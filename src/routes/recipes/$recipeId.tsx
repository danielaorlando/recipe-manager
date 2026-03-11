import { useState } from "react";
import { createRoute, Link, useNavigate } from "@tanstack/react-router";
import { Route as rootRoute } from "../__root";
import { useRecipes } from "../../context/RecipeContext";
import { useAuth } from "../../context/AuthContext";
import { getDishImageSrc } from "../../utils/dishImages";
import myRecipesImg from "../../assets/MyRecipesImg.png";
import mySearchIconImg from "../../assets/Icons/Icon-MagnifyingGlass.png";
import iconPinroll from "../../assets/Icons/Icon-Pinroll.png";
import { TextField, RoughBox } from "../../components/TextField";
import { HandDrawnButton } from "../../components/HandDrawButton";

// ROUTING CONCEPT: Path Parameters
// The "$" in $recipeId means "this part of the URL is a variable."
// /recipes/abc-123 → recipeId = "abc-123"
// /recipes/def-456 → recipeId = "def-456"
export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/recipes/$recipeId",
  component: RecipeDetailPage,
});

function RecipeDetailPage() {
  // ROUTING CONCEPT: Route.useParams() reads the $recipeId from the URL.
  const { recipeId } = Route.useParams();
  const { recipes, getRecipe, deleteRecipe } = useRecipes();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  // Sidebar only shows recipes this user is allowed to see
  const visibleRecipes = recipes.filter(
    (r) => r.visibility !== "private" || r.ownerId === user?.uid,
  );
  const filteredRecipes = visibleRecipes.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase()),
  );

  const recipe = getRecipe(recipeId);

  const handleDelete = () => {
    deleteRecipe(recipeId);
    navigate({ to: "/recipes" });
  };

  // Recipe doesn't exist
  if (!recipe) {
    return (
      <div className="not-found">
        <h2>Recipe Not Found</h2>
        <p>No recipe with that ID exists.</p>
        <Link to="/recipes">Back to recipe list</Link>
      </div>
    );
  }

  // AUTH CONCEPT: Someone tried to access a private recipe directly via URL.
  // We show "not found" instead of "access denied" — this is intentional.
  // Telling someone "you don't have permission" confirms the recipe exists,
  // which leaks information. "Not found" reveals nothing.
  if (recipe.visibility === "private" && recipe.ownerId !== user?.uid) {
    return (
      <div className="not-found">
        <h2>Recipe Not Found</h2>
        <p>No recipe with that ID exists.</p>
        <Link to="/recipes">Back to recipe list</Link>
      </div>
    );
  }

  // Look up the full image URL from the key stored on the recipe (e.g. "pasta")
  const dishImageSrc = recipe.image ? getDishImageSrc(recipe.image) : undefined;

  // The four stat boxes — built as an array so we can map instead of repeating JSX.
  const stats = [
    { label: "Prep Time", value: `${recipe.prepTime} min` },
    { label: "Cook Time", value: `${recipe.cookTime} min` },
    { label: "Servings", value: String(recipe.servings) },
    // Show "—" when calories wasn't filled in (optional field)
    {
      label: "Kcal p/Serving",
      value: recipe.calories ? String(recipe.calories) : "—",
    },
  ];

  return (
    // Three-column grid: sidebar | main content | recipe image
    <div className="detail-layout">
      {/* ── SIDEBAR ──────────────────────────────────────────────────────── */}
      <aside>
        {/* "My Recipes" wooden banner image */}
        <img src={myRecipesImg} alt="My Recipes" className="sidebar-banner" />

        {/* Search — same filter logic as the /recipes list page */}
        <div className="sidebar-search-wrap">
          <TextField
            type="text"
            placeholder="Find a recipe"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sidebar-search-input"
            width={220}
            height={45}
          />
          {/* Decorative magnifier icon — not interactive */}
          <span className="sidebar-search-icon">
            {" "}
            <img
              src={mySearchIconImg}
              alt="Magnifying Glass"
              className="sidebar-banner"
            />
          </span>
        </div>

        {/* Recipe list */}
        {/* ROUTING CONCEPT: Each Link navigates to that recipe's detail page.
            The current recipe is bold — we compare r.id === recipeId. */}
        {recipes.length === 0 ? (
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

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <h2 className="detail-title" style={{ margin: 0 }}>{recipe.title}</h2>
          {recipe.visibility === "private" && (
            <span className="private-badge">Private</span>
          )}
        </div>

        {recipe.description && (
          <p className="detail-description">{recipe.description}</p>
        )}

        {/* ── Stats row ──────────────────────────────────────────────────── */}
        {/* TYPE CONCEPT: We map over the `stats` array defined above.
            Each stat is a plain object { label, value } — TypeScript infers
            the type from the array literal. */}
        <div className="detail-stats">
          {stats.map((stat) => (
            <div key={stat.label}>
              <div className="detail-stat-label">{stat.label}</div>
              <RoughBox
                color="#d4956a"
                fillColor="#faf6f0"
                padding="0.5rem 1.25rem"
                style={{ minWidth: "90px", textAlign: "center" }}
              >
                {stat.value}
              </RoughBox>
            </div>
          ))}
        </div>

        {/* ── Ingredients ────────────────────────────────────────────────── */}
        {recipe.ingredients.length > 0 && (
          <div className="detail-section">
            <h3 className="detail-section-title">Ingredients</h3>
            {/* CSS Multi-column layout — items flow left to right across 3 columns.
                `break-inside: avoid` stops a single item splitting across columns. */}
            <ul className="ingredients-col-list">
              {recipe.ingredients.map((ing, i) => (
                <li key={i}>
                  {ing.amount} {ing.unit && `${ing.unit} `}
                  {ing.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Instructions ───────────────────────────────────────────────── */}
        {recipe.instructions.length > 0 && (
          <div className="detail-section">
            <h3 className="detail-section-title">Instructions</h3>
            <ul className="instructions-list">
              {recipe.instructions.map((step, i) => (
                <li key={i}>
                  <strong>Step {i + 1}</strong>
                  <p>{step}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Edit / Delete ───────────────────────────────────────────────── */}
        {/* AUTH CONCEPT: Authorization check.
            We only show these buttons if the logged-in user owns this recipe.
            user?.uid    → the current user's unique ID (null if logged out)
            recipe.ownerId → the ID of whoever created this recipe
            If they match, you're the owner. If not (or you're logged out), hidden. */}
        {user?.uid === recipe.ownerId && (
          <div className="detail-actions">
            <HandDrawnButton
              label="Edit Recipe"
              iconImg={<img src={iconPinroll} alt="" />}
              color="#5e6b3e"
              fillColor="#c8d8a820"
              width={180}
              height={50}
              actionBtn={() =>
                navigate({
                  to: "/recipes/$recipeId/edit",
                  params: { recipeId: recipe.id },
                })
              }
            />
            <HandDrawnButton
              label="Delete Recipe"
              iconImg={<img src={iconPinroll} alt="" />}
              color="#c07060"
              fillColor="#eca89820"
              width={180}
              height={50}
              actionBtn={handleDelete}
            />
          </div>
        )}

        <div className="detail-meta">
          Status: {recipe.status} | Created:{" "}
          {recipe.createdAt.toLocaleDateString()}
        </div>
      </div>

      {/* ── RECIPE IMAGE (right column) ────────────────────────────────── */}
      <div className="detail-image-col">
        {dishImageSrc ? (
          // Show the dish image the user picked when creating this recipe
          <div className="detail-image-circle">
            <img src={dishImageSrc} alt={recipe.title} />
          </div>
        ) : (
          // No image chosen — show an empty placeholder circle
          <div className="detail-image-placeholder">No image</div>
        )}
      </div>
    </div>
  );
}
