import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { auth } from "../firebase";

// The shape of what our context holds
type AuthContextType = {
  user: User | null;      // null = logged out, User = logged in
  loading: boolean;       // true while Firebase is figuring out if we're logged in
};

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

// The Provider wraps the whole app and makes auth available everywhere
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged is Firebase's way of saying:
    // "call this function whenever the login state changes"
    // It fires immediately on app load (to check if we're already logged in)
    // and again whenever the user logs in or out
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    // Clean up the listener when the component unmounts
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook — instead of importing AuthContext everywhere,
// components just call useAuth() to get the current user
export function useAuth() {
  return useContext(AuthContext);
}
