import { useEffect, useState } from 'react';
import { useNotification } from '@/hooks/useNotification';

/**
 * This component automatically requests notification permission on app load
 * Shows browser's native permission dialog
 */
export const NotificationSetup = () => {
  const { isPermissionGranted, requestPermission } = useNotification();
  const [hasAttempted, setHasAttempted] = useState(false);

  useEffect(() => {
    // Check if already attempted in this session
    const attemptedInSession = sessionStorage.getItem('notificationAttempted');
    
    if (attemptedInSession) {
      setHasAttempted(true);
      return;
    }

    // Check if user is logged in
    const token = localStorage.getItem('token');
    
    // Only ask if:
    // 1. User is logged in
    // 2. Permission not already granted
    // 3. Permission not already denied (still 'default')
    // 4. Haven't attempted in this session
    if (token && !isPermissionGranted && !hasAttempted && Notification.permission === 'default') {
      // Wait 3 seconds after app load, then ask for permission
      const timer = setTimeout(async () => {
        console.log('Requesting notification permission...');
        await requestPermission();
        setHasAttempted(true);
        sessionStorage.setItem('notificationAttempted', 'true');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isPermissionGranted, requestPermission, hasAttempted]);

  return null; // This component doesn't render anything
};
