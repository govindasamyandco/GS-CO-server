const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Server-side security check for admin custom claim
 */
function verifyAdminClaim(request) {
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "Authentication required to access admin operations."
    );
  }
  if (!request.auth.token || request.auth.token.admin !== true) {
    throw new HttpsError(
      "permission-denied",
      "Access denied. Admin custom claim is required to perform this action."
    );
  }
}

/**
 * Helper to log security actions to "audit_logs" collection
 */
async function logSecurityAudit(action, adminUid, adminEmail, details) {
  try {
    await db.collection("audit_logs").add({
      action: action,
      adminUid: adminUid || "UNKNOWN",
      adminEmail: adminEmail || "UNKNOWN",
      details: details || {},
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      ipAddress: "FIREBASE_CLOUD_FUNCTION"
    });
  } catch (err) {
    console.error("Failed to record audit log:", err);
  }
}

/**
 * Cloud Function: addProduct
 * Verifies admin claim server-side before writing product to Firestore
 */
exports.addProduct = onCall(async (request) => {
  verifyAdminClaim(request);

  const { title, category, baseRate, unit, bundlePieces, bundlesPerPack, minOrderNotice, description, imageUrl, stockQty, seasonNotice } = request.data;

  if (!title || !category || isNaN(baseRate)) {
    throw new HttpsError("invalid-argument", "Missing required product fields.");
  }

  const productData = {
    title: String(title).trim(),
    category: String(category).trim(),
    baseRate: Number(baseRate),
    unit: String(unit || "per Bundle").trim(),
    bundlePieces: Number(bundlePieces || 0),
    bundlesPerPack: Number(bundlesPerPack || 8),
    compressibility: 0.80,
    minOrderNotice: String(minOrderNotice || "").trim(),
    description: String(description || "").trim(),
    imageUrl: String(imageUrl || "/assets/logo.jpg").trim(),
    stockQty: Number(stockQty !== undefined ? stockQty : 100),
    seasonNotice: String(seasonNotice || "Price may differ based on the season item or the stock quantity").trim(),
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  };

  const docRef = await db.collection("products").add(productData);

  // Log Security Audit
  await logSecurityAudit(
    "ADD_PRODUCT",
    request.auth.uid,
    request.auth.token.email,
    { productId: docRef.id, title: productData.title, category: productData.category }
  );

  return { success: true, productId: docRef.id };
});

const ALLOWED_PRODUCT_FIELDS = [
  "title",
  "category",
  "baseRate",
  "unit",
  "bundlePieces",
  "bundlesPerPack",
  "compressibility",
  "minOrderNotice",
  "description",
  "imageUrl",
  "stockQty",
  "seasonNotice",
  "isDisabled"
];

/**
 * Helper to extract Storage path from a Firebase Storage download URL
 */
function extractStoragePathFromUrl(downloadUrl) {
  try {
    if (!downloadUrl || typeof downloadUrl !== "string") return null;
    if (!downloadUrl.includes("firebasestorage.googleapis.com")) return null;
    const matches = downloadUrl.match(/\/o\/([^?]+)/);
    if (matches && matches[1]) {
      return decodeURIComponent(matches[1]);
    }
  } catch (e) {
    console.warn("Error parsing storage URL:", e);
  }
  return null;
}

/**
 * Cloud Function: updateProduct
 * Verifies admin claim server-side and applies strict field whitelisting
 */
exports.updateProduct = onCall(async (request) => {
  verifyAdminClaim(request);

  const { productId, ...updateData } = request.data;

  if (!productId) {
    throw new HttpsError("invalid-argument", "Product ID is required.");
  }

  // Strict Field Whitelisting (Mass-Assignment Prevention)
  const sanitizedUpdate = {};
  for (const field of ALLOWED_PRODUCT_FIELDS) {
    if (updateData[field] !== undefined) {
      if (["baseRate", "bundlePieces", "bundlesPerPack", "compressibility", "stockQty"].includes(field)) {
        sanitizedUpdate[field] = Number(updateData[field]);
      } else if (field === "isDisabled") {
        sanitizedUpdate[field] = Boolean(updateData[field]);
      } else {
        sanitizedUpdate[field] = String(updateData[field]).trim();
      }
    }
  }

  if (Object.keys(sanitizedUpdate).length === 0) {
    throw new HttpsError("invalid-argument", "No valid update fields provided.");
  }

  sanitizedUpdate.updatedAt = admin.firestore.FieldValue.serverTimestamp();

  await db.collection("products").doc(productId).update(sanitizedUpdate);

  // Log Security Audit
  await logSecurityAudit(
    "UPDATE_PRODUCT",
    request.auth.uid,
    request.auth.token.email,
    { productId, updatedFields: Object.keys(sanitizedUpdate) }
  );

  return { success: true, productId };
});

/**
 * Cloud Function: deleteProduct
 * Verifies admin claim server-side and cleans up associated Storage assets
 */
exports.deleteProduct = onCall(async (request) => {
  verifyAdminClaim(request);

  const { productId } = request.data;

  if (!productId) {
    throw new HttpsError("invalid-argument", "Product ID is required.");
  }

  const docSnap = await db.collection("products").doc(productId).get();
  if (!docSnap.exists) {
    throw new HttpsError("not-found", "Product not found.");
  }

  const productData = docSnap.data();
  const productTitle = productData.title || "UNKNOWN";

  // Clean up associated image asset in Cloud Storage to prevent orphaned files
  if (productData.imageUrl) {
    const storagePath = extractStoragePathFromUrl(productData.imageUrl);
    if (storagePath) {
      try {
        const bucket = admin.storage().bucket();
        await bucket.file(storagePath).delete();
      } catch (storageErr) {
        console.warn("Storage asset cleanup warning:", storageErr.message);
      }
    }
  }

  await db.collection("products").doc(productId).delete();

  // Log Security Audit
  await logSecurityAudit(
    "DELETE_PRODUCT",
    request.auth.uid,
    request.auth.token.email,
    { productId, title: productTitle }
  );

  return { success: true, productId };
});
