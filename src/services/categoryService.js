// ==========================================================================
// Centralized Firestore Category Service (Server Concept)
// Collections: 'categories'
// ==========================================================================
import { db } from "../firebase.js";
import { 
  collection, 
  getDocs, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from "firebase/firestore";

const CATEGORIES_COLLECTION = "categories";
const DEFAULT_CATEGORIES = ["Panipat Mat", "Export Mat", "Local Mat", "Long Mat"];

/**
 * Real-time listener for categories collection
 */
export function subscribeToCategories(callback) {
  const q = query(collection(db, CATEGORIES_COLLECTION), orderBy("name", "asc"));
  return onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      callback(DEFAULT_CATEGORIES);
      return;
    }
    const categories = snapshot.docs.map(doc => doc.data().name);
    callback(categories);
  }, (error) => {
    console.error("Error subscribing to categories:", error);
    callback(DEFAULT_CATEGORIES);
  });
}

/**
 * Add a new custom category to Firestore
 */
export async function addCategory(categoryName) {
  try {
    const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), {
      name: categoryName,
      createdAt: serverTimestamp()
    });
    return { id: docRef.id, name: categoryName };
  } catch (error) {
    console.error("Error adding category to Firestore:", error);
    throw error;
  }
}
