import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
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
//
// This way we test the REAL context — no mocking required.

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

    function TestConsumer() {
      const { recipes, addRecipe, deleteRecipe } = useRecipes()
      return (
        <div>
          <span data-testid="count">{recipes.length}</span>
          <button onClick={() => addRecipe(recipe)}>Add</button>
          <button onClick={() => deleteRecipe(recipe.id)}>Delete</button>
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
      return (
        <div>
          {recipes.map((r) => (
            <div key={r.id}>{r.title}</div>
          ))}
          <button onClick={() => addRecipe(recipe1)}>Add Pasta</button>
          <button onClick={() => addRecipe(recipe2)}>Add Pizza</button>
          <button onClick={() => deleteRecipe('id-1')}>Delete Pasta</button>
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

    function TestConsumer() {
      const { recipes, addRecipe, updateRecipe } = useRecipes()
      return (
        <div>
          {recipes.map((r) => (
            <div key={r.id}>{r.title}</div>
          ))}
          <button onClick={() => addRecipe(original)}>Add</button>
          <button onClick={() => updateRecipe(updated)}>Update</button>
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
      return (
        <div>
          <span data-testid="count">{recipes.length}</span>
          <button onClick={() => addRecipe(recipe)}>Add</button>
          <button onClick={() => updateRecipe(updated)}>Update</button>
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

    function TestConsumer() {
      const { addRecipe, getRecipe } = useRecipes()
      const found = getRecipe('my-id')
      return (
        <div>
          <span data-testid="found">{found?.title ?? 'not found'}</span>
          <button onClick={() => addRecipe(recipe)}>Add</button>
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
