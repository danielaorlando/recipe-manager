import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace these values with your own Firebase config
// Get them from: Firebase Console → Project Settings → Your apps → Web app
const firebaseConfig = {
  apiKey: "AIzaSyDFvtydGoY2HXy6anGJXpRcZGEPPtlnaSI",
  authDomain: "recipe-manager-68f3f.firebaseapp.com",
  projectId: "recipe-manager-68f3f",
  storageBucket: "recipe-manager-68f3f.firebasestorage.app",
  messagingSenderId: "318430699290",
  appId: "1:318430699290:web:bff878771d171109a2d6a3",
};

// Initialize Firebase with our config
const app = initializeApp(firebaseConfig);

// Get the auth service — this is what we'll use to sign in, sign up, sign out
export const auth = getAuth(app);

// Initialize Firestore — this is our database
export const db = getFirestore(app);
