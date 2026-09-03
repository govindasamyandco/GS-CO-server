/**
 * Admin Custom Claim Setup Script for Govindasamy & Co
 * Usage: node set_admin_claim.js <USER_EMAIL_OR_UID>
 */

let admin;
try {
  admin = require("firebase-admin");
} catch {
  admin = require("./functions/node_modules/firebase-admin");
}

// Initialize Firebase Admin with Default Credentials or Service Account
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || "govindasamyandco"
  });
}

const targetEmail = process.argv[2] || process.env.ADMIN_EMAIL || "govindasamy.textile@gmail.com";

async function grantAdminClaim(email) {
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log(`✅ SUCCESS: Admin custom claim { admin: true } set for user ${email} (UID: ${user.uid})`);
    process.exit(0);
  } catch (error) {
    console.error(`❌ ERROR setting admin claim for ${email}:`, error.message);
    process.exit(1);
  }
}

grantAdminClaim(targetEmail);
