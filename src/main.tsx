import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { RecipeProvider } from "./context/RecipeContext";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

// ROUTING CONCEPT: createRouter takes the route tree and creates the router.
// This is the "brain" of your routing — it watches the URL and decides
// which component to show based on the route tree we defined.
const router = createRouter({ routeTree });

// ROUTING CONCEPT: Type registration
// This tells TypeScript about all your routes so it can check them.
// If you try to <Link to="/typo">, TypeScript will catch it!
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* RecipeProvider wraps the router so ALL routes can access recipes */}
    {/* AuthProvider wraps everything so every component knows who's logged in */}
    <AuthProvider>
      <RecipeProvider>
        {/* ROUTING CONCEPT: RouterProvider connects the router to React.
            It replaces the old <App /> component — the router now controls
            which components render based on the URL. */}
        <RouterProvider router={router} />
      </RecipeProvider>
    </AuthProvider>
  </StrictMode>
);
