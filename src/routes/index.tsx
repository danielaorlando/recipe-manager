import { createRoute } from "@tanstack/react-router";
import { Route as rootRoute } from "./__root";
import appLogo from "../assets/AppLogo.png";
import iconBook from "../assets/Icons/Icon-Book.png";
import iconCutlery from "../assets/Icons/Icon-Cutlery.png";

import { HandDrawnLink } from "../components/HandDrawLink";

// ROUTING CONCEPT: createRoute defines a route manually.
// `getParentRoute` tells TanStack Router where this route fits in the tree.
// `path: "/"` means this component renders at the root URL.
export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

function HomePage() {
  return (
    <div className="home">
      {/* "Welcome to" sits above the circular illustration */}
      <p className="home-eyebrow">Welcome to</p>

      {/* ── Hero illustration ─────────────────────────────────────────────── */}
      {/* The dashed circle frames the cookbook image, matching the design. */}
      <div className="hero-circle">
        <img src={appLogo} alt="Cookbook illustration" />
      </div>

      {/* ── App title ─────────────────────────────────────────────────────── */}
      {/* FONT CONCEPT: Dancing Script is ONLY used for the cookbook name.
          Everything else on the site uses Lato (set in index.css on body). */}
      <h1 className="home-title">The Heart &amp; Hand Cookbook</h1>

      <p className="home-subtitle">
        All your favorite recipes, perfectly organized
      </p>

      {/* ── CTA Buttons ───────────────────────────────────────────────────── */}
      {/* ROUTING CONCEPT: These Links navigate to other routes client-side.
          No page reload — the URL changes and TanStack Router renders the
          correct component into <Outlet /> without touching the server. */}
      {/* <div className="home-actions">
        <Link to="/recipes" className="cta-btn">
          Browse Recipes
          <img src={iconBook} alt="" />
        </Link>

        <Link to="/recipes/new" className="cta-btn">
          Add New Recipe
          <img src={iconCutlery} alt="" />
        </Link>
      </div> */}

      <div className="home-actions">
        <HandDrawnLink
          to="/recipes"
          label="Browse Recipes"
          color="#906E41"
          fillColor="#E0C193"
          iconImg={<img src={iconBook} alt="" />}
        />
        <HandDrawnLink
          to="/recipes/new"
          label="Add New Recipe"
          color="#9b9b80"
          fillColor="#CCC5A5"
          iconImg={<img src={iconCutlery} alt="" />}
        />
      </div>
    </div>
  );
}
