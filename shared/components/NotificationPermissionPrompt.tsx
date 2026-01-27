'use client';

import { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { requestNotificationPermission, isNotificationSupported } from '@/shared/utils/notificationUtils';

interface NotificationPermissionPromptProps {
  onPermissionGranted: () => void;
  onDismiss: () => void;
  primaryColor: string;
}

export default function NotificationPermissionPrompt({
  onPermissionGranted,
  onDismiss,
  primaryColor
}: NotificationPermissionPromptProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isNotificationSupported()) return null;

  const handleEnable = async () => {
    setIsLoading(true);
    const granted = await requestNotificationPermission();
    setIsLoading(false);

    if (granted) {
      onPermissionGranted();
    } else {
      onDismiss();
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <div
          className="p-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: `${primaryColor}20` }}
        >
          <Bell className="w-5 h-5" style={{ color: primaryColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">
            Enable reminders
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Get notified when cards are due for review.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleEnable}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg text-white font-medium text-sm transition-all hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: primaryColor }}
            >
              {isLoading ? 'Enabling...' : 'Enable Notifications'}
            </button>
            <button
              onClick={onDismiss}
              className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-400 font-medium text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Not now
            </button>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="p-1 hover:bg-blue-100 dark:hover:bg-blue-800/50 rounded-full transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </div>
  );
}
