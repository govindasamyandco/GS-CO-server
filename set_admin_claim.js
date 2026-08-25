/**
 * Admin Custom Claim Setup Script for Govindasamy & Co
 * Usage: node set_admin_claim.js <USER_EMAIL_OR_UID>
 */

const admin = require("firebase-admin");

// Initialize Firebase Admin with Default Credentials or Service Account
if (!admin.apps.length) {
  admin.initializeApp();
}

const targetEmail = process.argv[2] || "govindasamy.textitle@gmail.com";

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
