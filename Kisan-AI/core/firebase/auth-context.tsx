/**
 * lib/firebase/auth-context.tsx
 * Global Firebase Auth context - wraps the entire app.
 * Provides current user and loading state to all components.
 */

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth } from "./client";
import { createUserProfileIfNotExists } from "./user-profile";

// Types

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

// Context

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children?: React.ReactNode }) {
  const [user, setUser]     = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser: import('firebase/auth').User | null) => {
      if (firebaseUser) {
        // Profile sync should not block auth state resolution.
        try {
          await createUserProfileIfNotExists(firebaseUser);
        } catch (err) {
          console.warn("Profile sync warning:", err);
        }
        setUser(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    await signInWithEmailAndPassword(auth, normalizedEmail, password);
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    await createUserWithEmailAndPassword(auth, normalizedEmail, password);
  };

const signInWithGoogle = async () => {
  console.log("Creating provider");

  const provider = new GoogleAuthProvider();
  provider.addScope("email");
  provider.addScope("profile");

  try {
    console.log("Opening popup");

    await signInWithPopup(auth, provider);

    console.log("Popup success");
  } catch (err) {
    console.error("Popup error:", err);

    if (err instanceof FirebaseError && err.code === "auth/popup-closed-by-user") {
      throw new Error("Google sign-in popup was closed. Please try again.");
    }

    throw err;
  }
};

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{
      user, loading,
      signInWithEmail, signUpWithEmail, signInWithGoogle, signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}