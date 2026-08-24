// ==========================================================================
// Centralized Server SDK Entry Point - Govindasamy & Co
// ==========================================================================
export { default as firebaseApp, auth, db, storage } from "./firebase.js";
export * from "./services/productService.js";
export * from "./services/categoryService.js";
export * from "./services/storageService.js";
export * from "./services/authService.js";
