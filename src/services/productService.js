// ==========================================================================
// Centralized Firestore Product Service (Server Concept)
// Collections: 'products'
// ==========================================================================
import { db } from "../firebase.js";
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from "firebase/firestore";

const PRODUCTS_COLLECTION = "products";

/**
 * Real-time listener for products collection
 * @param {Function} callback - Function called with updated products array
 */
export function subscribeToProducts(callback) {
  const q = query(collection(db, PRODUCTS_COLLECTION), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(products);
  }, (error) => {
    console.error("Error subscribing to products:", error);
    callback([]);
  });
}

/**
 * Fetch all products once
 */
export async function getProducts() {
  try {
    const q = query(collection(db, PRODUCTS_COLLECTION), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

/**
 * Add a new Mat Product to Firestore
 */
export async function addProduct(productData) {
  try {
    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
      title: productData.title,
      category: productData.category,
      baseRate: Number(productData.baseRate),
      unit: productData.unit,
      bundlePieces: Number(productData.bundlePieces || 0),
      minOrderNotice: productData.minOrderNotice || "",
      description: productData.description || "",
      imageUrl: productData.imageUrl || "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docRef.id, ...productData };
  } catch (error) {
    console.error("Error adding product to Firestore:", error);
    throw error;
  }
}

/**
 * Update an existing product's rate or bundle specifications
 */
export async function updateProduct(id, updateFields) {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, id);
    await updateDoc(productRef, {
      ...updateFields,
      updatedAt: serverTimestamp()
    });
    return { id, ...updateFields };
  } catch (error) {
    console.error("Error updating product in Firestore:", error);
    throw error;
  }
}

/**
 * Delete a product by ID from Firestore
 */
export async function deleteProduct(id) {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, id);
    await deleteDoc(productRef);
    return id;
  } catch (error) {
    console.error("Error deleting product from Firestore:", error);
    throw error;
  }
}
