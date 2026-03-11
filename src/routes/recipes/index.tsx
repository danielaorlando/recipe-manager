import { useState } from "react";
import { createRoute, Link, useNavigate } from "@tanstack/react-router";
import { Route as rootRoute } from "../__root";
import { useRecipes } from "../../context/RecipeContext";
import { useAuth } from "../../context/AuthContext";
import { getDishImageSrc } from "../../utils/dishImages";
import mySearchIconImg from "../../assets/Icons/Icon-MagnifyingGlass.png";
import { TextField, RoughBox } from "../../components/TextField";
import { HandDrawnButton } from "../../components/HandDrawButton";
import type { Recipe } from "../../types/recipe";
import myRecipesImg from "../../assets/MyRecipesImg.png";
import iconPinroll from "../../assets/Icons/Icon-Pinroll.png";
import iconCutlery from "../../assets/Icons/Icon-Cutlery.png";

// ROUTING CONCEPT: createRoute with path "/recipes" handles the URL /recipes
export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/recipes",
  component: RecipeListPage,
});

function RecipeListPage() {
  const { recipes, deleteRecipe } = useRecipes();
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  // AUTH CONCEPT: Only show recipes the current user is allowed to see.
  // Public recipes → visible to everyone.
  // Private recipes → visible only to their owner.
  const visibleRecipes = recipes.filter(
    (r) => r.visibility !== "private" || r.ownerId === user?.uid,
  );

  // Then apply the search filter on top of what's already visible.
  const filtered = visibleRecipes.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      {/* ── Top bar: banner left, search right ─────────────────────────── */}
      <div className="recipes-topbar">
        {/* "My Recipes" wooden sign banner */}
        <img src={myRecipesImg} alt="My Recipes" className="recipes-banner" />

        {/* Search — TextField component + magnifier button on the right */}
        <div className="search-group">
          <TextField
            type="text"
            placeholder="Find a recipe"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            width={280}
            height={45}
          />
          <button className="search-btn">
            {" "}
            <img src={mySearchIconImg} alt="Magnifying Glass" />
          </button>
        </div>
      </div>

      {/* ── Recipe grid ─────────────────────────────────────────────────── */}
      {visibleRecipes.length === 0 ? (
        <div className="recipe-empty">
          <p>No recipes yet. Add your first recipe!</p>
          <Link to="/recipes/new">Create your first recipe</Link>
        </div>
      ) : filtered.length === 0 ? (
        <p style={{ color: "#666" }}>No recipes match "{search}".</p>
      ) : (
        // Two-column grid of recipe cards
        <div className="recipe-grid">
          {filtered.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onDelete={deleteRecipe}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── RecipeCard ────────────────────────────────────────────────────────────────
// Extracted into its own function to keep RecipeListPage readable.
// TYPE CONCEPT: The props shape is defined inline as a type annotation
// right in the function signature — no separate interface needed for something
// this small and local.
function RecipeCard({
  recipe,
  onDelete,
}: {
  recipe: Recipe;
  onDelete: (id: string) => void;
}) {
  // ROUTING CONCEPT: useNavigate() lets us navigate programmatically on button
  // click — same result as a <Link>, but triggered by a HandDrawnButton instead.
  const navigate = useNavigate();

  // AUTH CONCEPT: We need to know the current user to decide which buttons to show.
  // Edit and Delete should only appear for the recipe's owner.
  // The same check exists on the detail page — this is authorization at the UI layer.
  // (The route itself also blocks non-owners from editing — UI + route = defense in depth.)
  const { user } = useAuth();
  const isOwner = user?.uid === recipe.ownerId;

  // Look up the dish image URL from the key stored on the recipe (e.g. "pasta")
  const dishImageSrc = recipe.image ? getDishImageSrc(recipe.image) : undefined;

  // Build the four stats as data so we can map() instead of repeating JSX.
  const stats = [
    { label: "Prep Time", value: `${recipe.prepTime} min` },
    { label: "Cook Time", value: `${recipe.cookTime} min` },
    { label: "Servings", value: String(recipe.servings) },
    {
      label: "Kcal x serv.",
      value: recipe.calories ? `${recipe.calories} kcal` : "—",
    },
  ];

  return (
    // RoughBox draws a hand-drawn rectangle border sized to fit the card content.
    <RoughBox color="#cf7f5a" fillColor="#fbf5ec" padding="1.25rem">
      {/* Inner flex column — same layout the old .recipe-card CSS provided */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {/* Title + private badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <h3 className="recipe-card-title" style={{ margin: 0 }}>{recipe.title}</h3>
          {recipe.visibility === "private" && (
            <span className="private-badge">Private</span>
          )}
        </div>

        {/* Dish image (circular) + description side by side */}
        <div className="recipe-card-body">
          <div className="recipe-card-image">
            {dishImageSrc ? (
              <img src={dishImageSrc} alt={recipe.title} />
            ) : (
              <span className="no-image-label">No image</span>
            )}
          </div>
          {recipe.description && (
            <p className="recipe-card-description">{recipe.description}</p>
          )}
        </div>

        {/* Stats row — each value box gets its own hand-drawn RoughBox border */}
        <div className="recipe-card-stats">
          {stats.map((stat) => (
            <div key={stat.label}>
              <div className="stat-item-label">{stat.label}</div>
              <RoughBox
                color="#d4956a"
                fillColor="#faf6f0"
                padding="0.4rem 0.75rem"
                style={{ minWidth: "70px", textAlign: "center" }}
              >
                {stat.value}
              </RoughBox>
            </div>
          ))}
        </div>

        {/* Action buttons — navigate() used instead of <Link> so we can pass
            these actions into HandDrawnButton's actionBtn prop */}
        <div className="recipe-card-actions">
          <HandDrawnButton
            label="View"
            iconImg={<img src={iconPinroll} alt="" />}
            color="#6b5a40"
            fillColor="#b0987830"
            width={100}
            height={38}
            actionBtn={() =>
              navigate({
                to: "/recipes/$recipeId",
                params: { recipeId: recipe.id },
              })
            }
          />
          {/* AUTH CONCEPT: Only show Edit and Delete to the recipe's owner.
              This is the UI layer of authorization. The edit route also blocks
              non-owners at the route level — two layers of protection. */}
          {isOwner && (
            <>
              <HandDrawnButton
                label="Edit"
                iconImg={<img src={iconPinroll} alt="" />}
                color="#8b7248"
                fillColor="#c8b58a"
                width={100}
                height={38}
                actionBtn={() =>
                  navigate({
                    to: "/recipes/$recipeId/edit",
                    params: { recipeId: recipe.id },
                  })
                }
              />
              <HandDrawnButton
                label="Delete"
                iconImg={<img src={iconCutlery} alt="" />}
                color="#c07060"
                fillColor="#eca89830"
                width={100}
                height={38}
                actionBtn={() => onDelete(recipe.id)}
              />
            </>
          )}
        </div>
      </div>
    </RoughBox>
  );
}
