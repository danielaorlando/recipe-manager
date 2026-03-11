import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RecipeProvider, useRecipes } from './RecipeContext'
import type { Recipe } from '../types/recipe'

// TESTING CONCEPT: Testing React Context requires a different approach.
//
// You can't test a context directly — context only does something when a
// component reads from it. The pattern is:
//
//   1. Create a small "test consumer" component that reads from the context
//   2. Wrap it in the Provider inside render()
//   3. Drive behavior by clicking buttons in the consumer
//   4. Assert against what the consumer renders

// ── Firebase mocks ─────────────────────────────────────────────────────────
//
// TESTING CONCEPT: RecipeContext talks to Firebase Firestore. In tests we
// don't want to hit the real database — it would be slow and read real data.
//
// vi.hoisted() creates variables BEFORE imports run (vi.mock is hoisted to
// the top of the file). This lets the factory functions below close over
// shared state, and lets beforeEach() reset that state between tests.

const mockState = vi.hoisted(() => ({
  docs: [] as Array<{ id: string; data: () => Record<string, unknown> }>,
  notify: null as ((snap: { docs: Array<{ id: string; data: () => Record<string, unknown> }> }) => void) | null,
}))

vi.mock('../firebase', () => ({ db: {} }))

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn((q: unknown) => q),
  orderBy: vi.fn(),

  // onSnapshot registers a callback and fires it immediately with current docs.
  // Returns an unsubscribe function (matches the real Firebase API).
  onSnapshot: vi.fn((_q: unknown, cb: typeof mockState.notify) => {
    mockState.notify = cb
    cb!({ docs: mockState.docs })
    return () => { mockState.notify = null }
  }),

  // addDoc stores the recipe and fires the snapshot callback so RecipeContext
  // sees the update. The recipe object passed at runtime still has its `id`
  // field even though TypeScript types it as Omit<Recipe, "id">, so we use
  // that id to make tests predictable.
  addDoc: vi.fn((_col: unknown, data: Record<string, unknown>) => {
    const id = (data.id as string) || `mock-id-${mockState.docs.length + 1}`
    const { id: _omit, ...rest } = data as Record<string, unknown> & { id?: string }
    mockState.docs.push({ id, data: () => ({ ...rest, createdAt: { toDate: () => new Date() } }) })
    mockState.notify?.({ docs: mockState.docs })
    return Promise.resolve({ id })
  }),

  // updateDoc finds the doc by id, merges in the new data, and fires snapshot.
  // We preserve the original createdAt (in Firestore Timestamp format) so that
  // RecipeContext can still call .toDate() on it after the update.
  updateDoc: vi.fn((ref: { id: string }, data: Record<string, unknown>) => {
    const idx = mockState.docs.findIndex(d => d.id === ref.id)
    if (idx !== -1) {
      const existing = mockState.docs[idx].data()
      mockState.docs[idx] = { id: ref.id, data: () => ({ ...existing, ...data, createdAt: existing.createdAt }) }
      mockState.notify?.({ docs: mockState.docs })
    }
    return Promise.resolve()
  }),

  // deleteDoc removes the doc by id and fires snapshot.
  deleteDoc: vi.fn((ref: { id: string }) => {
    mockState.docs = mockState.docs.filter(d => d.id !== ref.id)
    mockState.notify?.({ docs: mockState.docs })
    return Promise.resolve()
  }),

  doc: vi.fn((_db: unknown, _col: unknown, id: string) => ({ id })),
}))

// Each test gets a clean slate — no leftover docs from previous tests.
beforeEach(() => {
  mockState.docs = []
  mockState.notify = null
})

// ── Shared test data ──────────────────────────────────────────────────────────
// TESTING CONCEPT: A factory function lets each test get a fresh copy of the
// data. If tests shared the same object, one test could accidentally mutate
// it and break a later test.
function makeRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    id: 'test-id-1',
    title: 'Pasta Carbonara',
    ingredients: [{ name: 'pasta', amount: '200', unit: 'g' }],
    instructions: ['Boil water', 'Cook pasta'],
    prepTime: 10,
    cookTime: 20,
    servings: 2,
    status: 'draft',
    createdAt: new Date(),
    ...overrides,
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('RecipeContext', () => {

  it('starts with an empty recipe list', () => {
    // TESTING CONCEPT: This minimal consumer just displays the recipe count.
    // We only build what the specific test needs — keep it simple.
    function TestConsumer() {
      const { recipes } = useRecipes()
      return <span data-testid="count">{recipes.length}</span>
    }

    render(
      <RecipeProvider>
        <TestConsumer />
      </RecipeProvider>,
    )

    expect(screen.getByTestId('count')).toHaveTextContent('0')
  })

  it('addRecipe adds a recipe to the list', async () => {
    const user = userEvent.setup()

    function TestConsumer() {
      const { recipes, addRecipe } = useRecipes()
      return (
        <div>
          <span data-testid="count">{recipes.length}</span>
          <button onClick={() => addRecipe(makeRecipe())}>Add</button>
        </div>
      )
    }

    render(
      <RecipeProvider>
        <TestConsumer />
      </RecipeProvider>,
    )

    expect(screen.getByTestId('count')).toHaveTextContent('0')

    await user.click(screen.getByRole('button', { name: 'Add' }))

    expect(screen.getByTestId('count')).toHaveTextContent('1')
  })

  it('addRecipe stores the recipe with the correct data', async () => {
    const user = userEvent.setup()
    const recipe = makeRecipe({ title: 'Chicken Tikka', servings: 4 })

    function TestConsumer() {
      const { recipes, addRecipe } = useRecipes()
      return (
        <div>
          {recipes.map((r) => (
            <div key={r.id} data-testid="recipe-title">
              {r.title}
            </div>
          ))}
          <button onClick={() => addRecipe(recipe)}>Add</button>
        </div>
      )
    }

    render(
      <RecipeProvider>
        <TestConsumer />
      </RecipeProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Add' }))

    expect(screen.getByTestId('recipe-title')).toHaveTextContent('Chicken Tikka')
  })

  it('deleteRecipe removes a recipe by id', async () => {
    const user = userEvent.setup()
    const recipe = makeRecipe()

    // TESTING CONCEPT: addRecipe returns the Firestore-generated ID.
    // We capture it in state so we can use the correct ID for delete —
    // the same way a real component would.
    function TestConsumer() {
      const { recipes, addRecipe, deleteRecipe } = useRecipes()
      const [addedId, setAddedId] = useState('')
      return (
        <div>
          <span data-testid="count">{recipes.length}</span>
          <button onClick={async () => setAddedId(await addRecipe(recipe))}>Add</button>
          <button onClick={() => deleteRecipe(addedId)}>Delete</button>
        </div>
      )
    }

    render(
      <RecipeProvider>
        <TestConsumer />
      </RecipeProvider>,
    )

    // Add a recipe first
    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(screen.getByTestId('count')).toHaveTextContent('1')

    // Now delete it
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    expect(screen.getByTestId('count')).toHaveTextContent('0')
  })

  it('deleteRecipe only removes the targeted recipe', async () => {
    const user = userEvent.setup()
    const recipe1 = makeRecipe({ id: 'id-1', title: 'Pasta' })
    const recipe2 = makeRecipe({ id: 'id-2', title: 'Pizza' })

    function TestConsumer() {
      const { recipes, addRecipe, deleteRecipe } = useRecipes()
      const [pastaId, setPastaId] = useState('')
      return (
        <div>
          {recipes.map((r) => (
            <div key={r.id}>{r.title}</div>
          ))}
          <button onClick={async () => setPastaId(await addRecipe(recipe1))}>Add Pasta</button>
          <button onClick={() => addRecipe(recipe2)}>Add Pizza</button>
          <button onClick={() => deleteRecipe(pastaId)}>Delete Pasta</button>
        </div>
      )
    }

    render(
      <RecipeProvider>
        <TestConsumer />
      </RecipeProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Add Pasta' }))
    await user.click(screen.getByRole('button', { name: 'Add Pizza' }))
    await user.click(screen.getByRole('button', { name: 'Delete Pasta' }))

    // Pasta should be gone but Pizza should remain
    expect(screen.queryByText('Pasta')).not.toBeInTheDocument()
    expect(screen.getByText('Pizza')).toBeInTheDocument()
  })

  it('updateRecipe replaces a recipe with new data', async () => {
    const user = userEvent.setup()
    const original = makeRecipe({ title: 'Old Title' })
    const updated = makeRecipe({ title: 'New Title' }) // same id

    // TESTING CONCEPT: We capture the ID returned by addRecipe and use it
    // for the update — the same way a real component would.
    function TestConsumer() {
      const { recipes, addRecipe, updateRecipe } = useRecipes()
      const [addedId, setAddedId] = useState('')
      return (
        <div>
          {recipes.map((r) => (
            <div key={r.id}>{r.title}</div>
          ))}
          <button onClick={async () => setAddedId(await addRecipe(original))}>Add</button>
          <button onClick={() => updateRecipe({ ...updated, id: addedId })}>Update</button>
        </div>
      )
    }

    render(
      <RecipeProvider>
        <TestConsumer />
      </RecipeProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(screen.getByText('Old Title')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Update' }))

    // Old title gone, new title present
    expect(screen.queryByText('Old Title')).not.toBeInTheDocument()
    expect(screen.getByText('New Title')).toBeInTheDocument()
  })

  it('updateRecipe does not change the number of recipes', async () => {
    const user = userEvent.setup()
    const recipe = makeRecipe()
    const updated = makeRecipe({ title: 'Updated' })

    function TestConsumer() {
      const { recipes, addRecipe, updateRecipe } = useRecipes()
      const [addedId, setAddedId] = useState('')
      return (
        <div>
          <span data-testid="count">{recipes.length}</span>
          <button onClick={async () => setAddedId(await addRecipe(recipe))}>Add</button>
          <button onClick={() => updateRecipe({ ...updated, id: addedId })}>Update</button>
        </div>
      )
    }

    render(
      <RecipeProvider>
        <TestConsumer />
      </RecipeProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Add' }))
    await user.click(screen.getByRole('button', { name: 'Update' }))

    // Still 1 recipe, not 2
    expect(screen.getByTestId('count')).toHaveTextContent('1')
  })

  it('getRecipe finds a recipe by id', async () => {
    const user = userEvent.setup()
    const recipe = makeRecipe({ id: 'my-id', title: 'Lasagne' })

    // TESTING CONCEPT: We capture the returned ID and use it to look up the
    // recipe — this reflects real usage where you use the Firestore-generated ID.
    function TestConsumer() {
      const { addRecipe, getRecipe } = useRecipes()
      const [addedId, setAddedId] = useState('')
      const found = getRecipe(addedId)
      return (
        <div>
          <span data-testid="found">{found?.title ?? 'not found'}</span>
          <button onClick={async () => setAddedId(await addRecipe(recipe))}>Add</button>
        </div>
      )
    }

    render(
      <RecipeProvider>
        <TestConsumer />
      </RecipeProvider>,
    )

    // Before adding: not found
    expect(screen.getByTestId('found')).toHaveTextContent('not found')

    await user.click(screen.getByRole('button', { name: 'Add' }))

    // After adding: found by id
    expect(screen.getByTestId('found')).toHaveTextContent('Lasagne')
  })

  it('getRecipe returns undefined for an unknown id', () => {
    function TestConsumer() {
      const { getRecipe } = useRecipes()
      const found = getRecipe('no-such-id')
      return <span data-testid="found">{found?.title ?? 'not found'}</span>
    }

    render(
      <RecipeProvider>
        <TestConsumer />
      </RecipeProvider>,
    )

    expect(screen.getByTestId('found')).toHaveTextContent('not found')
  })

  // TESTING CONCEPT: Testing error boundaries — making sure the code throws
  // the right error when used incorrectly. This is useful documentation.
  it('useRecipes throws if used outside of RecipeProvider', () => {
    // TESTING CONCEPT: We expect this render to throw an error.
    // vi.spyOn(console, 'error') silences the noisy React error output
    // that would otherwise flood the test logs.
    function BadConsumer() {
      useRecipes() // No RecipeProvider above this!
      return null
    }

    // Vitest doesn't capture React's thrown errors cleanly on its own,
    // so we wrap the render in a try/catch to assert on the error message.
    expect(() => render(<BadConsumer />)).toThrow(
      'useRecipes must be used within a RecipeProvider',
    )
  })

})
