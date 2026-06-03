const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

let firebaseApp = null;

try {
  const serviceAccountPath = path.join(__dirname, "firebase-service-account.json");
  if (fs.existsSync(serviceAccountPath)) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccountPath)
    });
    console.log("Firebase Admin SDK successfully initialized using JSON configuration file.");
  } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      })
    });
    console.log("Firebase Admin SDK successfully initialized using environment variables.");
  } else {
    console.warn("⚠️ Firebase configuration missing! FCM notifications will fail to send. Please add 'server/config/firebase-service-account.json' or set FIREBASE_* env variables.");
  }
} catch (error) {
  console.error("❌ Error initializing Firebase Admin SDK:", error);
}

module.exports = admin;
