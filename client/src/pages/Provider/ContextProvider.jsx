import {
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile,
} from "firebase/auth";


import { createContext, useCallback, useEffect, useState } from "react";

import { API_BASE_URL } from "../../config/api";
import auth from "../../Firebase/firebase.config";

export const AuthContext = createContext(null);
const googleProvider = new GoogleAuthProvider();
const ContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Creating The Function Of The USER
  const createUser = (email, password) => {
    setLoading(true);
    return createUserWithEmailAndPassword(auth, email, password);
  };

  // Login Function
  const logIn = (email, password) => {
    setLoading(true);
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Google SignIn
  const googleSignIn = () => {
    setLoading(true);
    return signInWithPopup(auth, googleProvider);
  };
  // Logout Function
  const logOut = async () => {
    try {
      setLoading(true);
      // Sign out from Firebase
      await signOut(auth);
      // Clear token from localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("Access-Token");
      setUser(null);
      setIsAdmin(false);
      setLoading(false);
    } catch (error) {
      console.error("Logout error:", error);
      setLoading(false);
    }
  };

  // Get Current User from Backend
  const getCurrentUser = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        setLoading(false);
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();

      if (!response.ok) {
        // Token invalid, clear it
        localStorage.removeItem("token");
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
        return null;
      }

      const { data, isAdmin: adminStatus } = result;
      setUser(data);
      
      // Set admin status from backend response only
      // Backend can return isAdmin at root level OR in data object
      // Priority: root level isAdmin > data.isAdmin > false
      const adminValue = typeof adminStatus === 'boolean' 
        ? adminStatus 
        : (typeof data?.isAdmin === 'boolean' ? data.isAdmin : false);
      
      setIsAdmin(adminValue);
      
      // Don't store user data in localStorage - always fetch from backend
      setLoading(false);
      return data;
    } catch (error) {
      console.error("Get current user error:", error);
      localStorage.removeItem("token");
      setUser(null);
      setIsAdmin(false);
      setLoading(false);
      return null;
    }
  }, []);

  // Apply backend auth response instantly (avoids extra /auth/me roundtrip on login)
  const applyBackendAuth = useCallback((backendUser, adminStatus) => {
    setUser(backendUser || null);
    setIsAdmin(!!adminStatus);
    setLoading(false);
  }, []);

  //   Update Profile
  const updateUserProfile = (name, photo) => {
    return updateProfile(auth.currentUser, {
      displayName: name,
      photoURL: photo,
    });
  };

  // State Management - Get current user from backend on mount
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        // If token exists, get user from backend
        await getCurrentUser();
      } else {
        setLoading(false);
      }
    };

    fetchUser();

    // Also listen to Firebase auth state changes (for Google login)
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // If Firebase user exists but no backend token, try to get user from backend
        const token = localStorage.getItem("token");
        if (token) {
          await getCurrentUser();
        }
      }
    });

    return () => unsubscribe();
  }, [getCurrentUser]);

  const authInfo = {
    user,
    isAdmin,
    createUser,
    logIn,
    logOut,
    loading,
    googleSignIn,
    updateUserProfile,
    getCurrentUser,
    applyBackendAuth,
    setLoading,
  };
  return (
    <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
  );
};

export default ContextProvider;