import axios from 'axios';

const API_URL = import.meta.env.VITE_APP_BASE_URL;

/**
 * Save FCM token to backend
 */
export const saveFCMToken = async (token: string) => {
  try {
    const response = await axios.post(
      `${API_URL}/auth/save-fcm-token`,
      { fcmToken: token },
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error saving FCM token:', error);
    throw error;
  }
};

/**
 * Remove FCM token from backend (on logout)
 */
export const removeFCMToken = async () => {
  try {
    const response = await axios.delete(
      `${API_URL}/auth/remove-fcm-token`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error removing FCM token:', error);
    throw error;
  }
};

/**
 * Get user notification preferences
 */
export const getNotificationPreferences = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/auth/notification-preferences`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    throw error;
  }
};

/**
 * Update user notification preferences
 */
export const updateNotificationPreferences = async (preferences: {
  bookingUpdates?: boolean;
  promotions?: boolean;
  reminders?: boolean;
  general?: boolean;
}) => {
  try {
    const response = await axios.put(
      `${API_URL}/auth/notification-preferences`,
      preferences,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    throw error;
  }
};
