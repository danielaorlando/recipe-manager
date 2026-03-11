import { createRoute, useNavigate } from "@tanstack/react-router";
import { Route as rootRoute } from "../__root";
import RecipeForm from "../../components/RecipeForm";
import { useRecipes } from "../../context/RecipeContext";
import { useAuth } from "../../context/AuthContext";
import { RequireAuth } from "../../components/RequireAuth";
import type { Recipe } from "../../types/recipe";

// ROUTING CONCEPT: This route handles /recipes/new
// It's the page where users add a new recipe.
export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/recipes/new",
  component: NewRecipePage,
});

function NewRecipePage() {
  const { addRecipe } = useRecipes();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAddRecipe = async (recipe: Recipe): Promise<void> => {
    // DATABASE CONCEPT: We strip `id` from the recipe before saving.
    // The form generates a temporary local id, but Firestore creates its own.
    // We use the Firestore id (returned by addRecipe) for navigation.
    const { id: _unused, ...recipeData } = recipe;
    const newId = await addRecipe({ ...recipeData, ownerId: user!.uid });
    navigate({ to: "/recipes/$recipeId", params: { recipeId: newId } });
  };

  return (
    // AUTH CONCEPT: RequireAuth wraps the whole page.
    // If the user isn't logged in, they get redirected before seeing anything.
    <RequireAuth>
      <div>
        <RecipeForm
          onAddRecipe={handleAddRecipe}
          onCancelEdit={() => navigate({ to: "/recipes" })}
        />
      </div>
    </RequireAuth>
  );
}
