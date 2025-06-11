import { createContext, useContext, useEffect, useState } from "react";
import { auth, googleProvider, db } from "../lib/firebase";
import { useNavigate } from "react-router-dom";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { User } from "../types";

// Define the shape of the auth context
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInAsClient: () => Promise<void>;
  signInAsDesigner: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook to access the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Auth provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Function to sign in with Google and set the role
  const signInWithRole = async (role: "client" | "designer") => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      // Check if the user exists in Firestore, if not, create a new user document
      const userRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDoc(userRef);
      let userRole = role;

      if (!userDoc.exists()) {
        // New user, set their role and initial credits
        const newUser: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || "",
          displayName: firebaseUser.displayName || "Anonymous",
          role: role,
        };
        await setDoc(userRef, {
          ...newUser,
          credits: 110, // Initialize with 110 credits for clients
        });
        setUser(newUser);
      } else {
        // Existing user, use the stored role
        const userData = userDoc.data();
        const authUser: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || "",
          displayName: firebaseUser.displayName || "Anonymous",
          role: userData.role,
        };
        setUser(authUser);
      }
      // Redirect based on role
      if (userRole === "client") {
        navigate("/client");
      } else if (userRole === "designer") {
        navigate("/designer");
      }
    } catch (error) {
      console.error(`Error signing in as ${role}:`, error);
    }
  };

  const signInAsClient = async () => {
    await signInWithRole("client");
  };

  const signInAsDesigner = async () => {
    await signInWithRole("designer");
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user role from Firestore
        const userRef = doc(db, "users", firebaseUser.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const authUser: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            displayName: firebaseUser.displayName || "Anonymous",
            role: userData.role,
          };
          setUser(authUser);
        } else {
          // If user document doesn't exist, set user to null (they'll need to sign in again)
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInAsClient,
        signInAsDesigner,
        signOut: signOutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};