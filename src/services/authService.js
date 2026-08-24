// ==========================================================================
// Centralized Firebase Authentication Service (Server Concept)
// ==========================================================================
import { auth } from "../firebase.js";
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail 
} from "firebase/auth";

/**
 * Authenticate Admin User
 */
export async function loginAdmin(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Admin Login Error:", error);
    throw error;
  }
}

/**
 * Log Out Admin User
 */
export async function logoutAdmin() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Admin Logout Error:", error);
    throw error;
  }
}

/**
 * Listen for Authentication State Changes
 */
export function subscribeToAuth(callback) {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
}

/**
 * Reset Admin Password
 */
export async function resetAdminPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Password Reset Error:", error);
    throw error;
  }
}
