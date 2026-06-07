const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

let isInitialized = false;

try {
  // Check if already initialized
  if (admin.apps.length === 0) {
    const serviceAccountPath = path.join(__dirname, "firebase-service-account.json");
    
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = require(serviceAccountPath);
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      
      isInitialized = true;
      console.log("✅ Firebase Admin SDK successfully initialized using JSON configuration file.");
    } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        })
      });
      
      isInitialized = true;
      console.log("✅ Firebase Admin SDK successfully initialized using environment variables.");
    } else {
      console.warn("⚠️ Firebase configuration missing! FCM notifications will fail to send. Please add 'server/config/firebase-service-account.json' or set FIREBASE_* env variables.");
    }
  } else {
    isInitialized = true;
    console.log("✅ Firebase Admin SDK already initialized.");
  }
} catch (error) {
  console.error("❌ Error initializing Firebase Admin SDK:", error);
  isInitialized = false;
}

// Export admin instance and initialization status
module.exports = admin;
module.exports.isInitialized = () => isInitialized;
