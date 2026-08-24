// ==========================================================================
// Central Firebase Initialization (Server Concept)
// Single Source of Truth for Govindasamy & Co Database & Storage
// ==========================================================================
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY || "AIzaSyDvjfa-nhsPwYGUn1BcAv6ukXiFwmaa9ks",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN || "govindasamyandco.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || "govindasamyandco",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET || "govindasamyandco.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID || "154816426732",
  appId: process.env.VITE_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID || "1:154816426732:web:9bc68ca9632db51c2dabc9",
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || process.env.FIREBASE_MEASUREMENT_ID || "G-T98D4GNX9V"
};

// Initialize Central Firebase App
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
