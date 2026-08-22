# Govindasamy & Co - Firebase Database & Storage Schemas

## 📁 1. Collections Overview

### Collection: `products`
Stores all product metadata, pricing, bundle settings, and image URLs.

```json
{
  "id": "prod_101",
  "title": "Heavy Duty Printed Panipat Door Mat",
  "category": "Panipat Mat",
  "baseRate": 1800,
  "unit": "per Bundle",
  "bundlePieces": 10,
  "minOrderNotice": "Purchased per full Bundle (10 Pcs only)",
  "description": "Authentic Panipat woven door mat sold in bundles of 10 pieces.",
  "imageUrl": "https://firebasestorage.googleapis.com/v0/b/.../product-images/panipat1.png",
  "createdAt": "2026-08-22T23:00:00.000Z",
  "updatedAt": "2026-08-22T23:00:00.000Z"
}
```

### Collection: `categories`
Stores product categories available in the store catalog.

```json
{
  "id": "cat_01",
  "name": "Panipat Mat",
  "createdAt": "2026-08-22T23:00:00.000Z"
}
```

---

## 🔐 2. Firebase Credentials Setup

To connect to your live Firebase project, create a `.env` file in `admin/` and `user/` with your Firebase web app keys:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=govindasamyandco.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=govindasamyandco
VITE_FIREBASE_STORAGE_BUCKET=govindasamyandco.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```
