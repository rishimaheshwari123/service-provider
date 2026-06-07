import { useEffect, useState } from 'react';
import { requestNotificationPermission, onMessageListener } from '@/lib/firebase';
import { toast } from 'react-toastify';
import { saveFCMToken } from '@/service/notificationApi';

// Replace this with your actual VAPID key from Firebase Console
// Go to: Project Settings > Cloud Messaging > Web Push certificates
const VAPID_KEY = 'YOUR_VAPID_KEY_HERE';

interface NotificationPayload {
  notification?: {
    title?: string;
    body?: string;
    icon?: string;
  };
  data?: any;
}

export const useNotification = () => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);

  useEffect(() => {
    // Check if notification permission is already granted
    if (Notification.permission === 'granted') {
      setIsPermissionGranted(true);
    }
  }, []);

  /**
   * Request notification permission and get FCM token
   */
  const requestPermission = async () => {
    try {
      const token = await requestNotificationPermission(VAPID_KEY);
      if (token) {
        setFcmToken(token);
        setIsPermissionGranted(true);
        
        console.log('FCM Token obtained:', token);
        
        // Send the token to backend
        try {
          await saveFCMToken(token);
          console.log('FCM token saved to backend successfully');
        } catch (backendError) {
          console.error('Failed to save FCM token to backend:', backendError);
          // Still allow notifications even if backend save fails
        }
        
        return token;
      } else {
        setIsPermissionGranted(false);
        return null;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return null;
    }
  };

  /**
   * Listen for foreground notifications
   */
  useEffect(() => {
    if (!isPermissionGranted) return;

    onMessageListener((payload: NotificationPayload) => {
      console.log('Received foreground notification:', payload);
      
      // Show notification using toast
      if (payload.notification) {
        const title = payload.notification.title || 'Notification';
        const body = payload.notification.body || '';
        
        toast.info(`${title}: ${body}`, {
          autoClose: 5000,
          position: 'top-right'
        });
      }
    });
  }, [isPermissionGranted]);

  return {
    fcmToken,
    isPermissionGranted,
    requestPermission
  };
};
