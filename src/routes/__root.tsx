import {
  createRootRoute,
  Link,
  Outlet,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../context/AuthContext";
import appLogo from "../assets/AppLogo.png";
import femaleAvatar from "../assets/Avatar Img/Female.png";
import maleAvatar from "../assets/Avatar Img/Male.png";

// ROUTING CONCEPT: The root route is the "wrapper" for your entire app.
// It defines UI that appears on EVERY page — like a header and navigation.
// The <Outlet /> component is where child routes render their content.

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  // ROUTING CONCEPT: useRouterState() gives us live access to the current URL.
  const { location } = useRouterState();
  const path = location.pathname;
  const navigate = useNavigate();

  // AUTH CONCEPT: useAuth() reads from our AuthContext.
  // user is null when logged out, a Firebase User object when logged in.
  const { user, loading } = useAuth();

  async function handleLogout() {
    // signOut clears the token from memory and tells Firebase we're done.
    // Our onAuthStateChanged listener in AuthContext fires, sets user to null.
    await signOut(auth);
    navigate({ to: "/" });
  }

  const navClass = (active: boolean) =>
    active ? "nav-link nav-link--active" : "nav-link";

  return (
    <div className="app-wrapper">
      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      {/* The header renders on every page because it lives in the root route. */}
      <header className="site-header">
        {/* LEFT — Logo + app name */}

        <Link to="/">
          <div className="header-left">
            <img
              src={appLogo}
              alt="The Heart & Hand Cookbook logo"
              className="site-logo"
            />
            {/* FONT CONCEPT: Dancing Script is a Google Font loaded in index.html.
              We apply it via the .site-name class in index.css. Lato is the fallback. */}
            <span className="site-name">The Heart &amp; Hand Cookbook</span>
          </div>
        </Link>

        {/* CENTER — Navigation links */}
        <nav className="site-nav">
          {/* ROUTING CONCEPT: We pass className directly (computed from path) instead
              of using activeProps. This lets us write precise rules:
              • Home   → active only on exactly "/"
              • Recipes→ active on any /recipes/* EXCEPT /recipes/new
              • Add    → active only on exactly "/recipes/new"
              activeProps would mark Recipes active on /recipes/new too (prefix match). */}
          <Link to="/" className={navClass(path === "/")}>
            Home
          </Link>
          <Link
            to="/recipes"
            className={navClass(
              path.startsWith("/recipes") && path !== "/recipes/new",
            )}
          >
            Recipes
          </Link>
          <Link to="/recipes/new" className={navClass(path === "/recipes/new")}>
            Add Recipe
          </Link>
        </nav>

        {/* RIGHT — Auth area: shows login button or current user + logout */}
        <div className="header-right">
          {/* Pick the avatar image based on what the user chose at signup.
              photoURL stores "female" or "male" — we use it to pick the image. */}
          <img
            src={user?.photoURL === "male" ? maleAvatar : femaleAvatar}
            alt="User avatar"
            className="user-avatar"
          />
          {loading ? null : user ? (
            <>
              {/* Show "Hi, First Last!" using the displayName saved at signup */}
              <span className="login-text">
                Hi, {user.displayName ?? user.email}!
              </span>
              <button className="logout-btn" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <Link to="/auth/login" className="login-text">
              Log in
            </Link>
          )}
        </div>
      </header>

      {/* ── PAGE CONTENT ────────────────────────────────────────────────────── */}
      {/* ROUTING CONCEPT: <Outlet /> is the "slot" where child routes render.
          When the URL is "/", the home page component appears here.
          When the URL is "/recipes", the recipe list appears here.
          The header above stays the same — only this part changes! */}
      <main className="page-main">
        <Outlet />
      </main>
    </div>
  );
}
