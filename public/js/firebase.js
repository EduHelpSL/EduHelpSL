/**
 * Firebase Authentication and Database Module
 * Handles user authentication, data storage, and security
 */

import { state } from "./state.js";
import { getTranslation } from "./translation.js";

// Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyCC_H7LagLptVYm45XSlUePerJ0EKgXI1s",
  authDomain: "eduhelp-sl.firebaseapp.com",
  databaseURL:
    "https://eduhelp-sl-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "eduhelp-sl",
  storageBucket: "eduhelp-sl.firebasestorage.app",
  messagingSenderId: "258793073514",
  appId: "1:258793073514:web:310cf2f42767f7d0925313",
  measurementId: "G-E6XTJKR9FW",
};

// Firebase instances
let firebaseApp = null;
let auth = null;
let database = null;
let firestore = null;

/**
 * Initialize Firebase services
 */
export async function initializeFirebase() {
  try {
    // Load Firebase scripts if not already loaded
    if (typeof window.firebase === "undefined") {
      await loadFirebaseScripts();
    }

    // Initialize Firebase app
    if (!firebaseApp) {
      firebaseApp = window.firebase.initializeApp(firebaseConfig);
      auth = window.firebase.auth();
      database = window.firebase.database();
      firestore = window.firebase.firestore();

      console.log("Firebase initialized successfully");
    }

    return { auth, database, firestore };
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    throw error;
  }
}

/**
 * Load Firebase scripts dynamically
 */
function loadFirebaseScripts() {
  return new Promise((resolve, reject) => {
    const scripts = [
      "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js",
      "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js",
      "https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js",
      "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js",
    ];

    let loadedCount = 0;
    const totalScripts = scripts.length;

    scripts.forEach((src) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => {
        loadedCount++;
        if (loadedCount === totalScripts) {
          resolve();
        }
      };
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
    });
  });
}

/**
 * Save user data to Firebase Realtime Database
 */
export async function saveUserData(user, additionalData = {}) {
  try {
    if (!database || !user) {
      throw new Error("Database not initialized or user not provided");
    }

    const userData = {
      name: user.displayName || additionalData.name || "Anonymous",
      email: user.email,
      grade: additionalData.grade || null,
      signupTime: window.firebase.database.ServerValue.TIMESTAMP,
      lastLogin: window.firebase.database.ServerValue.TIMESTAMP,
      photoURL: user.photoURL || null,
    };

    // Save to /users/{uid}/
    await database.ref(`users/${user.uid}`).set(userData);
    console.log("User data saved successfully");

    return userData;
  } catch (error) {
    console.error("Error saving user data:", error);
    throw error;
  }
}

/**
 * Update user's last login time
 */
export async function updateLastLogin(uid) {
  try {
    if (!database || !uid) return;

    await database
      .ref(`users/${uid}/lastLogin`)
      .set(window.firebase.database.ServerValue.TIMESTAMP);
  } catch (error) {
    console.error("Error updating last login:", error);
  }
}

/**
 * Get user data from database
 */
export async function getUserData(uid) {
  try {
    if (!database || !uid) return null;

    const snapshot = await database.ref(`users/${uid}`).once("value");
    return snapshot.val();
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle(displayName, grade) {
  try {
    if (!auth) {
      throw new Error("Firebase Auth not initialized");
    }

    const provider = new window.firebase.auth.GoogleAuthProvider();
    const result = await auth.signInWithPopup(provider);
    const user = result.user;

    if (user) {
      // Update user profile with provided name
      if (displayName && displayName !== user.displayName) {
        await user.updateProfile({ displayName });
      }

      // Save user data to database
      await saveUserData(user, { name: displayName, grade });

      return user;
    }

    throw new Error("No user returned from sign-in");
  } catch (error) {
    console.error("Google sign-in error:", error);
    throw error;
  }
}

/**
 * Sign out user
 */
export async function signOut() {
  try {
    if (!auth) {
      throw new Error("Firebase Auth not initialized");
    }

    await auth.signOut();
    console.log("User signed out successfully");
  } catch (error) {
    console.error("Sign out error:", error);
    throw error;
  }
}

/**
 * Set up authentication state observer
 */
export function setupAuthStateObserver(callback) {
  if (!auth) {
    console.error("Firebase Auth not initialized");
    return;
  }

  return auth.onAuthStateChanged(async (user) => {
    if (user) {
      // User is signed in
      state.auth.isUserLoggedIn = true;

      // Get additional user data from database
      const userData = await getUserData(user.uid);

      state.auth.userProfile = {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        uid: user.uid,
        grade: userData?.grade || null,
      };

      // Update last login
      await updateLastLogin(user.uid);

      console.log("User signed in:", user.email);
    } else {
      // User is signed out
      state.auth.isUserLoggedIn = false;
      state.auth.userProfile = null;
      console.log("User signed out");
    }

    // Call the callback with the user state
    if (callback) {
      callback(user);
    }
  });
}

/**
 * Check if user is authenticated
 */
export function isUserAuthenticated() {
  return state.auth.isUserLoggedIn && state.auth.userProfile;
}

/**
 * Get current user
 */
export function getCurrentUser() {
  return auth ? auth.currentUser : null;
}

/**
 * Get authentication error message
 */
export function getAuthErrorMessage(error) {
  const errorCode = error.code;

  switch (errorCode) {
    case "auth/user-not-found":
      return getTranslation(
        "authErrorUserNotFound",
        "No account found with this email."
      );
    case "auth/wrong-password":
      return getTranslation("authErrorWrongPassword", "Incorrect password.");
    case "auth/email-already-in-use":
      return getTranslation(
        "authErrorEmailInUse",
        "An account with this email already exists."
      );
    case "auth/weak-password":
      return getTranslation("authErrorWeakPassword", "Password is too weak.");
    case "auth/invalid-email":
      return getTranslation("authErrorInvalidEmail", "Invalid email address.");
    case "auth/popup-closed-by-user":
      return getTranslation(
        "authErrorPopupClosed",
        "Sign-in popup was closed."
      );
    case "auth/cancelled-popup-request":
      return getTranslation(
        "authErrorPopupCancelled",
        "Sign-in was cancelled."
      );
    case "auth/popup-blocked":
      return getTranslation(
        "authErrorPopupBlocked",
        "Sign-in popup was blocked by browser."
      );
    case "auth/network-request-failed":
      return getTranslation(
        "authErrorNetwork",
        "Network error. Please check your connection."
      );
    default:
      return getTranslation(
        "authErrorGeneric",
        "Authentication failed. Please try again."
      );
  }
}
