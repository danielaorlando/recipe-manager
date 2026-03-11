// TYPE CONCEPT: Interfaces define the "shape" of an object
// Think of it like a blueprint or contract - any Recipe object MUST have these properties

export interface Ingredient {
  // Basic type annotations - telling TypeScript what kind of data each property holds
  name: string;      // The ingredient name (e.g., "flour")
  amount: string;    // How much (e.g., "2" or "1.5")
  unit?: string;     // Optional property - the "?" means it might not be there
                     // (e.g., "cups", "tablespoons", or undefined for "2 eggs")
}

// WHY this exists: An ingredient is always part of a recipe, but it has its own structure.
// Separating it into its own interface makes the code cleaner and lets us reuse it.

export interface Recipe {
  // TYPE CONCEPT: string is the type, id is the property name
  id: string;              // Unique identifier for each recipe
  title: string;           // Recipe name
  description?: string;    // Optional - not all recipes need a description

  // TYPE CONCEPT: Array<Ingredient> means "an array that only holds Ingredient objects"
  // TypeScript won't let you accidentally add a string or number to this array
  ingredients: Ingredient[];    // Could also write as: Array<Ingredient>

  instructions: string[];       // Step-by-step directions (array of strings)

  // Numbers for time and servings
  prepTime: number;        // In minutes
  cookTime: number;        // In minutes
  servings: number;        // How many people it serves
  calories?: number;       // Optional - calories per serving
  image?: string;          // Optional - key of the selected dish image (e.g. "pasta")

  // TYPE CONCEPT: Union types - this can ONLY be one of these two specific strings
  // Not just any string, but exactly "draft" or "published"
  status: "draft" | "published";

  createdAt: Date;         // When the recipe was created

  // AUTH CONCEPT: Every recipe now knows who created it.
  // We store the Firebase user's uid (a unique string like "xKj3mN9...").
  // Optional so existing recipes (without an owner) don't break.
  ownerId?: string;

  // AUTH CONCEPT: Visibility controls who can see this recipe.
  // "public"  → everyone can browse and view it
  // "private" → only the owner can see it (doesn't appear in anyone else's list)
  // Defaults to "public" when not set.
  visibility?: "public" | "private";
}

// WHY Recipe exists: This interface represents what a recipe IS in the real world.
// It prevents bugs like forgetting to add a title, or accidentally storing
// prepTime as a string like "30 minutes" instead of the number 30.
