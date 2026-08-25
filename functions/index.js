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

  const { title, category, baseRate, unit, bundlePieces, bundlesPerPack, minOrderNotice, description, imageUrl } = request.data;

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
    imageUrl: String(imageUrl || "public/assets/logo.jpg").trim(),
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

/**
 * Cloud Function: updateProduct
 * Verifies admin claim server-side before updating product
 */
exports.updateProduct = onCall(async (request) => {
  verifyAdminClaim(request);

  const { productId, ...updateData } = request.data;

  if (!productId) {
    throw new HttpsError("invalid-argument", "Product ID is required.");
  }

  await db.collection("products").doc(productId).update({
    ...updateData,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // Log Security Audit
  await logSecurityAudit(
    "UPDATE_PRODUCT",
    request.auth.uid,
    request.auth.token.email,
    { productId, updatedFields: Object.keys(updateData) }
  );

  return { success: true, productId };
});

/**
 * Cloud Function: deleteProduct
 * Verifies admin claim server-side before deleting product
 */
exports.deleteProduct = onCall(async (request) => {
  verifyAdminClaim(request);

  const { productId } = request.data;

  if (!productId) {
    throw new HttpsError("invalid-argument", "Product ID is required.");
  }

  const docSnap = await db.collection("products").doc(productId).get();
  const productTitle = docSnap.exists ? docSnap.data().title : "UNKNOWN";

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
