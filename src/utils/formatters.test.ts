// TESTING CONCEPT: Import the function we want to test
import { toTitleCase } from './formatters'

// TESTING CONCEPT: Import 'describe', 'it', and 'expect' from vitest
// - 'describe' groups related tests together
// - 'it' defines a single test case
// - 'expect' makes assertions (checks if something is true)
import { describe, it, expect } from 'vitest'

// TESTING CONCEPT: describe() creates a test suite - a group of related tests
describe('toTitleCase', () => {

  // TESTING CONCEPT: it() defines one test.
  // The string describes what this test checks in plain English.
  it('capitalizes the first letter of each word', () => {
    // Call the function with test data
    const result = toTitleCase('pasta carbonara')

    // TESTING CONCEPT: expect().toBe() checks if two values are exactly equal.
    // This is called an "assertion" — the heart of every test.
    expect(result).toBe('Pasta Carbonara')
  })

  it('converts ALL CAPS input to title case', () => {
    const result = toTitleCase('PASTA CARBONARA')
    expect(result).toBe('Pasta Carbonara')
  })

  it('converts mixed-case input to title case', () => {
    const result = toTitleCase('PaStA cArBoNaRa')
    expect(result).toBe('Pasta Carbonara')
  })

  it('handles a single word', () => {
    const result = toTitleCase('chicken')
    expect(result).toBe('Chicken')
  })

  it('handles a single uppercase word', () => {
    const result = toTitleCase('CHICKEN')
    expect(result).toBe('Chicken')
  })

  // TESTING CONCEPT: Always test edge cases — unusual inputs that could
  // break the function. An empty string is the most common edge case.
  it('returns an empty string when given an empty string', () => {
    const result = toTitleCase('')
    expect(result).toBe('')
  })

  it('handles input that is already in title case', () => {
    // The function should not break if the input is already correct
    const result = toTitleCase('Beef Stew')
    expect(result).toBe('Beef Stew')
  })

  it('handles a three-word recipe name', () => {
    const result = toTitleCase('chicken tikka masala')
    expect(result).toBe('Chicken Tikka Masala')
  })
})
