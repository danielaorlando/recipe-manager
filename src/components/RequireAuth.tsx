import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "../context/AuthContext";

// AUTH CONCEPT: A "route guard" — a component that wraps a protected page.
// If the user is logged in, it renders the page normally.
// If not, it redirects them to /auth/login.
//
// Usage:
//   <RequireAuth>
//     <SomeProtectedPage />
//   </RequireAuth>
//
// This is reusable — wrap any page that needs login, without repeating the logic.

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect once Firebase has finished checking the session.
    // Without the `!loading` check, we'd redirect on every page load
    // before Firebase even has a chance to restore the saved token.
    if (!loading && !user) {
      navigate({ to: "/auth/login" });
    }
  }, [user, loading, navigate]);

  // While Firebase is checking auth state, render nothing.
  // This prevents a flash of the protected content before the redirect.
  if (loading || !user) return null;

  return <>{children}</>;
}
