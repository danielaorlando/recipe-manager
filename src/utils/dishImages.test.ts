import { DISH_IMAGES, getDishImageSrc } from './dishImages'
import { describe, it, expect } from 'vitest'

describe('DISH_IMAGES', () => {

  it('contains 11 dish images', () => {
    // TESTING CONCEPT: We create test data — here the data IS the module itself.
    // Testing that the array length is correct gives us a "canary" test:
    // if someone accidentally adds or removes an image, this will fail loudly.
    expect(DISH_IMAGES).toHaveLength(11)
  })

  it('every image has a key, src, and label', () => {
    // TESTING CONCEPT: .forEach() inside a test lets us check every item
    // in an array. If any single item fails, the whole test fails.
    DISH_IMAGES.forEach((img) => {
      expect(img.key).toBeDefined()
      expect(img.src).toBeDefined()
      expect(img.label).toBeDefined()
    })
  })

  it('contains expected dish keys', () => {
    // TESTING CONCEPT: .map() extracts just the keys, then toContain()
    // checks that a specific value is in that array.
    const keys = DISH_IMAGES.map((img) => img.key)

    expect(keys).toContain('pasta')
    expect(keys).toContain('breakfast')
    expect(keys).toContain('pizza')
    expect(keys).toContain('dessert')
  })

  it('has unique keys (no duplicates)', () => {
    // TESTING CONCEPT: Putting the keys in a Set removes duplicates.
    // If Set size equals array length, all keys were unique.
    const keys = DISH_IMAGES.map((img) => img.key)
    const uniqueKeys = new Set(keys)

    expect(uniqueKeys.size).toBe(DISH_IMAGES.length)
  })

})

describe('getDishImageSrc', () => {

  it('returns a string for a known key', () => {
    // TESTING CONCEPT: We don't check the exact URL (it's an asset hash
    // that can change at build time). We just check that it's defined and
    // is a string — proving the lookup works.
    const src = getDishImageSrc('pasta')

    expect(src).toBeDefined()
    expect(typeof src).toBe('string')
  })

  it('returns a value for every valid key in DISH_IMAGES', () => {
    // Each key in the array should be findable — no mismatches allowed.
    DISH_IMAGES.forEach((img) => {
      const src = getDishImageSrc(img.key)
      expect(src).toBeDefined()
    })
  })

  // TESTING CONCEPT: Testing for undefined is just as important as
  // testing for a real value. This proves the function handles bad input
  // gracefully instead of throwing an error.
  it('returns undefined for an unknown key', () => {
    const src = getDishImageSrc('unicorn-steak')

    expect(src).toBeUndefined()
  })

  it('returns undefined for an empty string', () => {
    const src = getDishImageSrc('')

    expect(src).toBeUndefined()
  })

})
