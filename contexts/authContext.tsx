import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthContextType, UserType } from "@/types";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth, firestore } from "@/config/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "expo-router";

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Runs once when the app loads (listens for authentication state changes)
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log(
        "🔄 Auth State Changed:",
        firebaseUser ? firebaseUser.uid : "No user"
      );

      if (firebaseUser) {
        // ✅ If a user is logged in, fetch their Firestore data
        const userData = await updateUserData(firebaseUser.uid);
        if (userData) {
          setUser(userData); // ✅ Set user state with Firestore data
          console.log("✅ User Set:", userData);
        } else {
          console.log("❌ No user data found in Firestore");
          setUser(null);
        }
      } else {
        console.log("❌ User Signed Out");
        setUser(null);
      }
      setLoading(false); // ✅ Auth check completed
    });

    return () => unsubscribe(); // ✅ Cleanup function to stop listening when unmounted
  }, []);

  // useEffect(() => {
  //   if (!loading && user === null) {
  //     router.replace("/(auth)/welcome");
  //   }
  // }, [loading, user]);

  const login = async (email: string, password: string) => {
    try {
      let response = await signInWithEmailAndPassword(auth, email, password); // ✅ Firebase login
      let userData = await updateUserData(response.user.uid); // ✅ Fetch user data from Firestore
      setUser(userData); // Ensure user state is updated
      return { success: true }; // ✅ Return success
    } catch (error: any) {
      let msg = error.message;
      if (msg.includes("(auth/invalid-credential)")) msg = "Wrong credentials";
      if (msg.includes("(auth/invalid-email)"))
        msg = "Invalid email or password";
      return { success: false, msg }; // Return error message
    }
  };

  // Function to register a new user
  const register = async (email: string, password: string, name: string) => {
    try {
      let response = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      ); // ✅ Firebase registration
      const userRef = doc(firestore, "users", response.user.uid); // ✅ Create Firestore document
      await setDoc(userRef, { uid: response.user.uid, email, name }); // ✅ Store user data in Firestore

      let userData = { uid: response.user.uid, email, name }; // ✅ Store user data locally
      setUser(userData); // ✅ Set user state after registration

      return { success: true }; // ✅ Return success
    } catch (error: any) {
      let msg = error.message;
      if (msg.includes("(auth/email-already-in-use)"))
        msg = "This email already exists"; // Handle errors
      if (msg.includes("(auth/invalid-email)"))
        msg = "Invalid email or password";
      if (msg.includes("(auth/weak-password)"))
        msg = "Password should be at least 6 characters";
      return { success: false, msg }; // Return error message
    }
  };

  // Function to log out the user
  const logout = async () => {
    try {
      await signOut(auth); // ✅ Firebase logout
      setUser(null); // ✅ Clear user state
      router.replace("/(auth)/welcome"); // ✅ Redirect to welcome screen
    } catch (error) {
      console.error("Logout error:", error); // Handle errors
    }
  };

  // Function to fetch user data from Firestore
  const updateUserData = async (uid: string) => {
    try {
      console.log("🟢 Fetching User Data from Firestore for UID:", uid);
      const userRef = doc(firestore, "users", uid); // ✅ Reference to Firestore document
      const docSnap = await getDoc(userRef); // ✅ Fetch document data

      if (docSnap.exists()) {
        const userData = docSnap.data() as UserType; // ✅ Convert data to UserType
        console.log("✅ User Data Found in Firestore:", userData);

        if (!userData.image) {
          console.log("⚠️ No Image Found in Firestore! Possible issue");
        }

        setUser(userData); // ✅ Update user state
        return userData; // ✅ Return user data
      } else {
        console.log("❌ No User Data in Firestore");
        return null; // ✅ No data found
      }
    } catch (error) {
      console.error("❌ Error fetching user data:", error);
      return null; // Handle errors
    }
  };

  // Store authentication functions in context
  const contextValue: AuthContextType = {
    user, // ✅ Current logged-in user
    setUser, // ✅ Function to manually set user state
    login, // ✅ Login function
    register, // ✅ Registration function
    logout, // ✅ Logout function
    updateUserData, // ✅ Function to fetch user data
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider> // ✅ Provide auth context to the app
  );
};

// Custom hook to use authentication context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be wrapped inside AuthProvider"); // Ensure hook is used within `AuthProvider`
  return context; // ✅ Return authentication context
};
