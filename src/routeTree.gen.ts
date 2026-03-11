// ROUTING CONCEPT: The Route Tree
// This file connects all your routes together into a hierarchy.
// Think of it like a sitemap — it tells the router which URLs exist.
//
// URL structure:
//   /                    → Home page (index route)
//   /recipes             → Recipe list
//   /recipes/new         → Add new recipe
//   /recipes/$recipeId   → View a specific recipe (dynamic!)
//   /recipes/$recipeId/edit → Edit an existing recipe
//   /auth/login          → Login + signup page

import { Route as rootRoute } from "./routes/__root";
import { Route as indexRoute } from "./routes/index";
import { Route as recipesIndexRoute } from "./routes/recipes/index";
import { Route as recipesNewRoute } from "./routes/recipes/new";
import { Route as recipeDetailRoute } from "./routes/recipes/$recipeId";
import { Route as recipeEditRoute } from "./routes/recipes/$recipeId.edit";
import { Route as loginRoute } from "./routes/auth/login";

// ROUTING CONCEPT: addChildren tells the router which routes are
// nested inside the root. All our pages are children of the root layout.
const routeTree = rootRoute.addChildren([
  indexRoute,
  recipesIndexRoute,
  recipesNewRoute,
  recipeDetailRoute,
  recipeEditRoute,
  loginRoute,
]);

export { routeTree };
