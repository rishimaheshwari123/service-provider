import { useEffect, useState } from 'react';
import { useNotification } from '@/hooks/useNotification';
import { Button } from '@/components/ui/button';
import { Bell, X } from 'lucide-react';

export const NotificationPrompt = () => {
  const { isPermissionGranted, requestPermission } = useNotification();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed the prompt
    const dismissed = localStorage.getItem('notificationPromptDismissed');
    
    // Show prompt if permission not granted and not dismissed
    if (!isPermissionGranted && !dismissed && Notification.permission === 'default') {
      // Show prompt after 3 seconds
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isPermissionGranted]);

  const handleEnableNotifications = async () => {
    await requestPermission();
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setIsDismissed(true);
    localStorage.setItem('notificationPromptDismissed', 'true');
  };

  if (!showPrompt || isPermissionGranted || isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md animate-in slide-in-from-bottom-5">
      <div className="bg-card border border-border rounded-lg shadow-lg p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Enable Notifications</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Stay updated with booking confirmations, service updates, and important alerts.
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleEnableNotifications}
            className="flex-1"
            size="sm"
          >
            Enable Notifications
          </Button>
          <Button
            onClick={handleDismiss}
            variant="outline"
            size="sm"
          >
            Not Now
          </Button>
        </div>
      </div>
    </div>
  );
};
