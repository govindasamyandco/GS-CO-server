/**
 * Firebase Firestore Seeding Script for Govindasamy & Co
 * Usage: node seedFirebase.js
 */

const fs = require('fs');
const path = require('path');

// Read JSON Seed Data
const seedDataPath = path.join(__dirname, 'seedData.json');
const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf8'));

console.log('====================================================');
console.log('📦 Govindasamy & Co - Firebase Seed Data Ready');
console.log('====================================================');
console.log(`Categories to Seed: ${seedData.categories.length}`);
console.log(`Products to Seed:   ${seedData.products.length}`);
console.log('----------------------------------------------------');

seedData.categories.forEach((cat, index) => {
    console.log(`Category #${index + 1}: ${cat.name} (${cat.id})`);
});

console.log('----------------------------------------------------');

seedData.products.forEach((prod, index) => {
    console.log(`Product #${index + 1}: ${prod.title} | ₹${prod.baseRate} / ${prod.unit} (${prod.bundlePieces} pcs)`);
});

console.log('====================================================');
console.log('To import this data into Firebase Firestore:');
console.log('1. Copy seedData.json content directly into Firebase Console');
console.log('2. Or run this script with Firebase Admin SDK credentials.');
console.log('====================================================');
