import { createRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "../../firebase";
import { Route as rootRoute } from "../__root";
import femaleAvatar from "../../assets/Avatar Img/Female.png";
import maleAvatar from "../../assets/Avatar Img/Male.png";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/login",
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();

  const [mode, setMode] = useState<"login" | "signup">("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Signup-only fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatar, setAvatar] = useState<"female" | "male">("female");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function switchMode(newMode: "login" | "signup") {
    setMode(newMode);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Step 1: Create the account (email + password only)
        const result = await createUserWithEmailAndPassword(auth, email, password);

        // Step 2: Save the extra info onto the user profile.
        // Firebase's User object has two built-in profile fields:
        //   displayName → we store "FirstName LastName"
        //   photoURL    → we store "female" or "male" as an identifier
        // (photoURL is normally for a real image URL, but we're using it
        //  as a simple way to remember the avatar choice without a database)
        await updateProfile(result.user, {
          displayName: `${firstName.trim()} ${lastName.trim()}`,
          photoURL: avatar,
        });
      }

      navigate({ to: "/" });
    } catch (err: unknown) {
      const errorCode = (err as { code?: string }).code;
      setError(getFriendlyError(errorCode));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>{mode === "login" ? "Welcome back" : "Create an account"}</h1>

        <form onSubmit={handleSubmit} className="auth-form">

          {/* Name fields — only shown during signup */}
          {mode === "signup" && (
            <>
              <div className="auth-name-row">
                <div>
                  <label htmlFor="firstName">First name</label>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    autoComplete="given-name"
                  />
                </div>
                <div>
                  <label htmlFor="lastName">Last name</label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    autoComplete="family-name"
                  />
                </div>
              </div>

              {/* Avatar picker — only shown during signup */}
              <p className="avatar-label">Choose your avatar</p>
              <div className="avatar-picker">
                <button
                  type="button"
                  className={`avatar-option ${avatar === "female" ? "avatar-option--selected" : ""}`}
                  onClick={() => setAvatar("female")}
                >
                  <img src={femaleAvatar} alt="Female avatar" />
                </button>
                <button
                  type="button"
                  className={`avatar-option ${avatar === "male" ? "avatar-option--selected" : ""}`}
                  onClick={() => setAvatar("male")}
                >
                  <img src={maleAvatar} alt="Male avatar" />
                </button>
              </div>
            </>
          )}

          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            minLength={6}
          />

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "..." : mode === "login" ? "Log in" : "Sign up"}
          </button>
        </form>

        <p className="auth-toggle">
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              <button onClick={() => switchMode("signup")}>Sign up</button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button onClick={() => switchMode("login")}>Log in</button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

function getFriendlyError(code: string | undefined): string {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return "Incorrect email or password.";
    case "auth/user-not-found":
      return "No account found with that email.";
    case "auth/email-already-in-use":
      return "An account with that email already exists.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    default:
      return "Something went wrong. Please try again.";
  }
}
