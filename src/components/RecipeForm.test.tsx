import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import RecipeForm from './RecipeForm'
import type { Recipe } from '../types/recipe'

// TESTING CONCEPT: Component tests check what the user sees and what happens
// when they interact with it. We don't test implementation details like state
// variable names — we test BEHAVIOR: "when I type here and click Submit,
// the right thing happens."

// TESTING CONCEPT: A factory for a complete Recipe object.
// TypeScript forces every field to be present, so having a factory with
// sensible defaults makes it easy to create test recipes with one override.
function makeRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    id: 'test-id',
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

describe('RecipeForm', () => {

  // ── Rendering ──────────────────────────────────────────────────────────────

  it('renders the "Add New Recipe" heading by default', () => {
    // TESTING CONCEPT: render() puts the component on a fake page.
    // When no editingRecipe is passed, the form is in "add" mode.
    render(<RecipeForm onAddRecipe={() => {}} />)

    expect(screen.getByRole('heading', { name: 'Add New Recipe' })).toBeInTheDocument()
  })

  it('renders all the main form fields', () => {
    render(<RecipeForm onAddRecipe={() => {}} />)

    // TESTING CONCEPT: getByLabelText() finds an input by the label that
    // describes it. This mirrors how a real user reads a form.
    expect(screen.getByLabelText('Title')).toBeInTheDocument()
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
    expect(screen.getByLabelText('Prep Time')).toBeInTheDocument()
    expect(screen.getByLabelText('Cook Time')).toBeInTheDocument()
    expect(screen.getByLabelText('Servings')).toBeInTheDocument()
    expect(screen.getByLabelText('Kcal x serv.')).toBeInTheDocument()
  })

  it('renders the "Add Recipe" submit button', () => {
    render(<RecipeForm onAddRecipe={() => {}} />)

    expect(screen.getByRole('button', { name: 'Add Recipe' })).toBeInTheDocument()
  })

  it('renders dish image picker buttons', () => {
    render(<RecipeForm onAddRecipe={() => {}} />)

    // The image picker has a button for each dish category
    expect(screen.getByRole('button', { name: 'Pasta' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pizza' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Breakfast' })).toBeInTheDocument()
  })

  it('does NOT show a Cancel button when onCancelEdit is not provided', () => {
    render(<RecipeForm onAddRecipe={() => {}} />)

    // TESTING CONCEPT: queryByRole() returns null if the element is absent
    // (whereas getByRole() would throw). Use queryBy when you expect nothing.
    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument()
  })

  it('shows a Cancel button when onCancelEdit is provided', () => {
    render(<RecipeForm onAddRecipe={() => {}} onCancelEdit={() => {}} />)

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  // ── Submitting a new recipe ────────────────────────────────────────────────

  it('calls onAddRecipe when the form is submitted', async () => {
    // TESTING CONCEPT: vi.fn() creates a "mock function" — a fake function
    // we can spy on. We can check if it was called, how many times, and
    // with what arguments.
    const mockAddRecipe = vi.fn()
    const user = userEvent.setup()

    render(<RecipeForm onAddRecipe={mockAddRecipe} />)

    // Type a title (the only required field)
    await user.type(screen.getByLabelText('Title'), 'pasta carbonara')
    await user.click(screen.getByRole('button', { name: 'Add Recipe' }))

    expect(mockAddRecipe).toHaveBeenCalledTimes(1)
  })

  it('submits the title in title case regardless of how it was typed', async () => {
    const mockAddRecipe = vi.fn()
    const user = userEvent.setup()

    render(<RecipeForm onAddRecipe={mockAddRecipe} />)

    // Type title in lowercase — the form should normalise it
    await user.type(screen.getByLabelText('Title'), 'chicken tikka masala')
    await user.click(screen.getByRole('button', { name: 'Add Recipe' }))

    // TESTING CONCEPT: mock.calls[0][0] is the first argument of the first call
    const submittedRecipe: Recipe = mockAddRecipe.mock.calls[0][0]
    expect(submittedRecipe.title).toBe('Chicken Tikka Masala')
  })

  it('submits a recipe with the correct status and a generated id', async () => {
    const mockAddRecipe = vi.fn()
    const user = userEvent.setup()

    render(<RecipeForm onAddRecipe={mockAddRecipe} />)

    await user.type(screen.getByLabelText('Title'), 'Beef Stew')
    await user.click(screen.getByRole('button', { name: 'Add Recipe' }))

    const submittedRecipe: Recipe = mockAddRecipe.mock.calls[0][0]
    expect(submittedRecipe.status).toBe('draft')
    expect(submittedRecipe.id).toBeDefined()
    expect(submittedRecipe.createdAt).toBeInstanceOf(Date)
  })

  it('submits numeric fields as numbers', async () => {
    const mockAddRecipe = vi.fn()
    const user = userEvent.setup()

    render(<RecipeForm onAddRecipe={mockAddRecipe} />)

    await user.type(screen.getByLabelText('Title'), 'Soup')
    await user.type(screen.getByLabelText('Prep Time'), '5')
    await user.type(screen.getByLabelText('Cook Time'), '30')
    await user.type(screen.getByLabelText('Servings'), '4')
    await user.click(screen.getByRole('button', { name: 'Add Recipe' }))

    const submittedRecipe: Recipe = mockAddRecipe.mock.calls[0][0]

    // TESTING CONCEPT: toBeTypeOf() checks the JavaScript type of a value.
    // The form stores these as strings internally but converts them on submit.
    expect(submittedRecipe.prepTime).toBeTypeOf('number')
    expect(submittedRecipe.prepTime).toBe(5)
    expect(submittedRecipe.cookTime).toBe(30)
    expect(submittedRecipe.servings).toBe(4)
  })

  // ── Edit mode ─────────────────────────────────────────────────────────────

  it('shows the "Edit Recipe" heading when editing', () => {
    render(
      <RecipeForm
        onAddRecipe={() => {}}
        editingRecipe={makeRecipe()}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Edit Recipe' })).toBeInTheDocument()
  })

  it('shows the "Update Recipe" button when editing', () => {
    render(
      <RecipeForm
        onAddRecipe={() => {}}
        editingRecipe={makeRecipe()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Update Recipe' })).toBeInTheDocument()
  })

  it('pre-fills the title from the recipe being edited', () => {
    const recipe = makeRecipe({ title: 'Beef Wellington' })

    render(
      <RecipeForm
        onAddRecipe={() => {}}
        editingRecipe={recipe}
      />,
    )

    // TESTING CONCEPT: toHaveValue() checks the current value of an input.
    expect(screen.getByLabelText('Title')).toHaveValue('Beef Wellington')
  })

  it('pre-fills numeric fields from the recipe being edited', () => {
    const recipe = makeRecipe({ prepTime: 15, cookTime: 45, servings: 6 })

    render(
      <RecipeForm
        onAddRecipe={() => {}}
        editingRecipe={recipe}
      />,
    )

    expect(screen.getByLabelText('Prep Time')).toHaveValue(15)
    expect(screen.getByLabelText('Cook Time')).toHaveValue(45)
    expect(screen.getByLabelText('Servings')).toHaveValue(6)
  })

  it('calls onUpdateRecipe (not onAddRecipe) when editing', async () => {
    const mockAddRecipe = vi.fn()
    const mockUpdateRecipe = vi.fn()
    const user = userEvent.setup()

    render(
      <RecipeForm
        onAddRecipe={mockAddRecipe}
        onUpdateRecipe={mockUpdateRecipe}
        editingRecipe={makeRecipe()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Update Recipe' }))

    expect(mockUpdateRecipe).toHaveBeenCalledTimes(1)
    expect(mockAddRecipe).not.toHaveBeenCalled()
  })

  it('calls onCancelEdit when Cancel is clicked', async () => {
    const mockCancel = vi.fn()
    const user = userEvent.setup()

    render(
      <RecipeForm
        onAddRecipe={() => {}}
        onCancelEdit={mockCancel}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(mockCancel).toHaveBeenCalledTimes(1)
  })

  // ── Dynamic rows ──────────────────────────────────────────────────────────

  it('renders one ingredient row by default', () => {
    render(<RecipeForm onAddRecipe={() => {}} />)

    // TESTING CONCEPT: getAllByPlaceholderText returns an array of all
    // matching elements. The count tells us how many rows exist.
    expect(screen.getAllByPlaceholderText('e.g. Flour')).toHaveLength(1)
  })

  it('adds a new ingredient row when "Add Ingredient" is clicked', async () => {
    const user = userEvent.setup()
    render(<RecipeForm onAddRecipe={() => {}} />)

    await user.click(screen.getByRole('button', { name: 'Add Ingredient' }))

    expect(screen.getAllByPlaceholderText('e.g. Flour')).toHaveLength(2)
  })

  it('adds a new instruction step when "+ Add Step" is clicked', async () => {
    const user = userEvent.setup()
    render(<RecipeForm onAddRecipe={() => {}} />)

    // Before clicking: 1 step (the default empty one)
    expect(screen.getAllByText(/Step \d+/)).toHaveLength(1)

    await user.click(screen.getByRole('button', { name: '+ Add Step' }))

    expect(screen.getAllByText(/Step \d+/)).toHaveLength(2)
  })

  it('filters out empty ingredients on submit', async () => {
    const mockAddRecipe = vi.fn()
    const user = userEvent.setup()

    render(<RecipeForm onAddRecipe={mockAddRecipe} />)

    await user.type(screen.getByLabelText('Title'), 'Soup')

    // Add a second row but leave it blank
    await user.click(screen.getByRole('button', { name: 'Add Ingredient' }))

    // Fill only the first row
    const nameInputs = screen.getAllByPlaceholderText('e.g. Flour')
    const amountInputs = screen.getAllByPlaceholderText('e.g. 2')
    await user.type(nameInputs[0], 'carrot')
    await user.type(amountInputs[0], '3')

    await user.click(screen.getByRole('button', { name: 'Add Recipe' }))

    const submittedRecipe: Recipe = mockAddRecipe.mock.calls[0][0]

    // The blank row should have been filtered out
    expect(submittedRecipe.ingredients).toHaveLength(1)
    expect(submittedRecipe.ingredients[0].name).toBe('carrot')
  })

})
