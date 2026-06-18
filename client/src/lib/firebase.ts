import { initializeApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD9OI7kx-SWa3gwVSIhaFhsU4RmLD_POz8",
  authDomain: "mgsa-a4899.firebaseapp.com",
  projectId: "mgsa-a4899",
  storageBucket: "mgsa-a4899.firebasestorage.app",
  messagingSenderId: "851630773469",
  appId: "1:851630773469:web:9f83207fb4821d51767734",
  measurementId: "G-XS2S8R7ZVM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (only in browser)
let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Initialize Firebase Cloud Messaging
let messaging: Messaging | null = null;
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  messaging = getMessaging(app);
}

/**
 * Request permission for notifications and get FCM token
 * @param vapidKey - Your VAPID key from Firebase Console
 * @returns Promise with the FCM token or null
 */
export const requestNotificationPermission = async (vapidKey: string): Promise<string | null> => {
  try {
    if (!messaging) {
      console.warn('Firebase Messaging is not supported in this browser');
      return null;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      
      // Get FCM token
      const token = await getToken(messaging, { vapidKey });
      console.log('FCM Token:', token);
      return token;
    } else {
      console.log('Notification permission denied.');
      return null;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
};

/**
 * Listen for foreground messages
 * @param callback - Function to handle incoming messages
 */
export const onMessageListener = (callback: (payload: any) => void) => {
  if (!messaging) {
    console.warn('Firebase Messaging is not supported in this browser');
    return;
  }

  onMessage(messaging, (payload) => {
    console.log('Message received in foreground:', payload);
    callback(payload);
  });
};

export { app, analytics, messaging };
