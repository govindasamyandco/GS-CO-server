// ==========================================================================
// Centralized Firebase Storage Service (Server Concept)
// Storage Bucket: 'product-images/'
// ==========================================================================
import { storage } from "../firebase.js";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

/**
 * Uploads a product image file to Firebase Cloud Storage and returns its HTTPS Download URL
 * @param {File} file - Image File from input
 * @param {Function} onProgress - Optional progress callback (0-100%)
 */
export async function uploadProductImage(file, onProgress = null) {
  if (!file) return "";

  const filename = `product-images/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  const storageRef = ref(storage, filename);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        if (onProgress) onProgress(progress);
      },
      (error) => {
        console.error("Storage upload error:", error);
        reject(error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
}
