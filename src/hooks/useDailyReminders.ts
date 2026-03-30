import { useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { authClient } from '@/lib/authClient';
import {
  requestNotificationPermission,
  schedulePersonalizedDailyPromiseNotification,
} from '@/services/notifications/notifications';

import { storage } from '@/services/context/ThemeContext';

const REMINDERS_ENABLED_KEY = 'daily-reminders-enabled';

export function useDailyReminders() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved preference on mount
  useEffect(() => {
    const saved = storage.getBoolean(REMINDERS_ENABLED_KEY) ?? false;
    setIsEnabled(saved);
    setIsLoading(false);

    // Optional: Re-schedule if already enabled (useful after app restart)
    if (saved) {
      schedulePersonalizedDailyPromiseNotification();
    }
  }, []);

  const toggleReminders = async (value: boolean) => {
    setIsEnabled(value);
    storage.set(REMINDERS_ENABLED_KEY, value);

    try {
      if (value) {
        // User turned ON → schedule all 3 notifications
        await schedulePersonalizedDailyPromiseNotification();
      } else {
        // User turned OFF → cancel ALL three notifications
        await Notifications.cancelScheduledNotificationAsync("daily-promise-morning");
        await Notifications.cancelScheduledNotificationAsync("daily-promise-afternoon");
        await Notifications.cancelScheduledNotificationAsync("daily-promise-evening");

        console.log('✅ All three daily reminders cancelled');
      }
    } catch (error) {
      console.error("Failed to toggle daily reminders:", error);
    }
  };

  return {
    isEnabled,
    isLoading,
    toggleReminders,
  };
}