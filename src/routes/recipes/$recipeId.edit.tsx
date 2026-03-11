import { useState } from "react";
import { createRoute, Link, useNavigate } from "@tanstack/react-router";
import { Route as rootRoute } from "../__root";
import RecipeForm from "../../components/RecipeForm";
import { useRecipes } from "../../context/RecipeContext";
import { useAuth } from "../../context/AuthContext";
import { RequireAuth } from "../../components/RequireAuth";
import type { Recipe } from "../../types/recipe";
import myRecipesImg from "../../assets/MyRecipesImg.png";
import mySearchIconImg from "../../assets/Icons/Icon-MagnifyingGlass.png";
import { TextField } from "../../components/TextField";

// ROUTING CONCEPT: This route handles /recipes/$recipeId/edit
// The dot in the filename ($recipeId.edit.tsx) creates a nested URL path.
// So $recipeId.edit.tsx → /recipes/abc-123/edit
export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/recipes/$recipeId/edit",
  component: EditRecipePage,
});

function EditRecipePage() {
  const { recipeId } = Route.useParams();
  // We need `recipes` for the sidebar list, plus getRecipe and updateRecipe.
  const { recipes, getRecipe, updateRecipe } = useRecipes();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  // AUTH CONCEPT: Same visibility filter as the detail page and index.
  // The sidebar should never reveal private recipe titles from other users.
  const visibleRecipes = recipes.filter(
    (r) => r.visibility !== "private" || r.ownerId === user?.uid,
  );
  const filteredRecipes = visibleRecipes.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase()),
  );

  const recipe = getRecipe(recipeId);

  if (!recipe) {
    return (
      <div className="not-found">
        <h2>Recipe Not Found</h2>
        <p>Can't edit a recipe that doesn't exist.</p>
        <Link to="/recipes">Back to recipe list</Link>
      </div>
    );
  }

  // AUTH CONCEPT: Authorization check — not just "are you logged in?" but
  // "do you own this specific recipe?"
  // RequireAuth above only checks login. This checks ownership.
  // Without this, any logged-in user could type /recipes/abc-123/edit and
  // edit someone else's recipe, even if the Edit button is hidden from them.
  // We show "not found" (not "access denied") — same reason as the detail page:
  // confirming the recipe exists would leak information.
  if (recipe.ownerId !== user?.uid) {
    return (
      <div className="not-found">
        <h2>Recipe Not Found</h2>
        <p>No recipe with that ID exists.</p>
        <Link to="/recipes">Back to recipe list</Link>
      </div>
    );
  }

  const handleUpdateRecipe = async (updatedRecipe: Recipe): Promise<void> => {
    // DATABASE CONCEPT: await makes sure the save finishes before we navigate.
    // Without await, we might navigate away before the database is updated.
    await updateRecipe(updatedRecipe);
    navigate({
      to: "/recipes/$recipeId",
      params: { recipeId: updatedRecipe.id },
    });
  };

  return (
    <RequireAuth>
    {/* Two-column grid: sidebar on the left, form on the right. */}
    <div className="edit-layout">
      {/* ── SIDEBAR ──────────────────────────────────────────────────────── */}
      {/* Mirrors the sidebar on the detail page — same banner, search, and list.
          This lets users jump to another recipe's detail page while editing. */}
      <aside>
        <img src={myRecipesImg} alt="My Recipes" className="sidebar-banner" />

        {/* Search */}
        <div className="sidebar-search-wrap">
          <TextField
            type="text"
            placeholder="Find a recipe"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            width={220}
            height={45}
          />
          <span className="sidebar-search-icon">
            <img
              src={mySearchIconImg}
              alt="Magnifying Glass"
              className="sidebar-banner"
            />
          </span>
        </div>

        {/* Recipe list — current recipe is bold, clicking goes to its detail page */}
        {/* ROUTING CONCEPT: These links go to the DETAIL page (/recipes/$recipeId),
            not the edit page, so the user can review before editing further. */}
        {visibleRecipes.length === 0 ? (
          <p className="sidebar-empty">No recipes yet</p>
        ) : filteredRecipes.length === 0 ? (
          <p className="sidebar-empty">No matches</p>
        ) : (
          <ul className="sidebar-list">
            {filteredRecipes.map((r) => (
              <li key={r.id}>
                <Link
                  to="/recipes/$recipeId"
                  params={{ recipeId: r.id }}
                  className={`sidebar-link${r.id === recipeId ? " sidebar-link--current" : ""}`}
                >
                  {r.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </aside>

      {/* ── EDIT FORM ────────────────────────────────────────────────────── */}
      {/* RecipeForm handles all the form state and submit logic.
          We pass editingRecipe so it pre-fills every field with the saved values.
          onCancelEdit navigates back to the detail page without saving. */}
      <RecipeForm
        onAddRecipe={() => {}}
        onUpdateRecipe={handleUpdateRecipe}
        editingRecipe={recipe}
        onCancelEdit={() =>
          navigate({
            to: "/recipes/$recipeId",
            params: { recipeId: recipe.id },
          })
        }
      />
    </div>
    </RequireAuth>
  );
}
