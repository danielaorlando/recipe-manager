import { createContext, useContext, useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";
import type { Recipe } from "../types/recipe";

// DATABASE CONCEPT: The context shape stays almost the same — the rest of the
// app doesn't need to know WHERE data comes from, just that it can get recipes,
// add them, update them, delete them. That's good separation of concerns.
// The only addition is `loading` — because now fetching data takes time.

interface RecipeContextType {
  recipes: Recipe[];
  loading: boolean;
  addRecipe: (recipe: Omit<Recipe, "id">) => Promise<string>;
  updateRecipe: (recipe: Recipe) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  getRecipe: (id: string) => Recipe | undefined;
}

const RecipeContext = createContext<RecipeContextType | null>(null);

export function RecipeProvider({ children }: { children: React.ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  // DATABASE CONCEPT: onSnapshot sets up a "live listener" on the recipes
  // collection. Any time a recipe is added, updated, or deleted in Firestore,
  // this function runs automatically and updates our local state.
  // This means all users see changes in real-time without refreshing.
  useEffect(() => {
    const recipesQuery = query(
      collection(db, "recipes"),
      orderBy("createdAt", "desc")
    );

    // onSnapshot returns an "unsubscribe" function.
    // We return it from useEffect so React calls it when the component unmounts,
    // cleaning up the listener and avoiding memory leaks.
    const unsubscribe = onSnapshot(recipesQuery, (snapshot) => {
      const recipesData = snapshot.docs.map((doc) => ({
        id: doc.id,           // Firestore gives each document a unique id
        ...doc.data(),        // Spread the rest of the fields
        createdAt: doc.data().createdAt?.toDate() ?? new Date(),
        // ^ Firestore stores dates as Timestamps, not JS Dates.
        //   .toDate() converts it back. ?? new Date() is a fallback.
      })) as Recipe[];

      setRecipes(recipesData);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // DATABASE CONCEPT: addDoc creates a new document in the "recipes" collection.
  // We don't pass an id — Firestore generates a unique one automatically.
  // That's why the parameter is Omit<Recipe, "id"> — no id needed from us.
  // DATABASE CONCEPT: addDoc returns a DocumentReference with the auto-generated id.
  // We return it so the caller can navigate to the new recipe's page.
  const addRecipe = async (recipe: Omit<Recipe, "id">): Promise<string> => {
    const docRef = await addDoc(collection(db, "recipes"), recipe);
    return docRef.id;
  };

  // DATABASE CONCEPT: updateDoc finds the document by id and merges in the
  // new values. Only the fields you pass get changed — others stay the same.
  const updateRecipe = async (recipe: Recipe): Promise<void> => {
    const { id, ...data } = recipe;
    await updateDoc(doc(db, "recipes", id), data);
  };

  // DATABASE CONCEPT: deleteDoc finds the document by id and removes it
  // permanently. There's no undo — the data is gone.
  const deleteRecipe = async (id: string): Promise<void> => {
    await deleteDoc(doc(db, "recipes", id));
  };

  // This one stays the same — we still search our local recipes array.
  // onSnapshot already keeps it in sync with the database.
  const getRecipe = (id: string): Recipe | undefined => {
    return recipes.find((recipe) => recipe.id === id);
  };

  return (
    <RecipeContext.Provider
      value={{ recipes, loading, addRecipe, updateRecipe, deleteRecipe, getRecipe }}
    >
      {children}
    </RecipeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useRecipes(): RecipeContextType {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error("useRecipes must be used within a RecipeProvider");
  }
  return context;
}
