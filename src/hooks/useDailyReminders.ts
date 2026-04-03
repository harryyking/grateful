// src/hooks/useDailyReminders.ts
import { useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import {
  schedulePersonalizedDailyPromiseNotification,
} from '@/services/notifications/notifications';

import { storage } from '@/services/context/ThemeContext'; // your MMKV / storage

const REMINDERS_ENABLED_KEY = 'daily-reminders-enabled';

export function useDailyReminders() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved preference + re-schedule on app start
  useEffect(() => {
    const saved = storage.getBoolean(REMINDERS_ENABLED_KEY) ?? false;
    setIsEnabled(saved);
    setIsLoading(false);

    if (saved) {
      schedulePersonalizedDailyPromiseNotification();
    }
  }, []);

  const toggleReminders = async (value: boolean) => {
    setIsEnabled(value);
    storage.set(REMINDERS_ENABLED_KEY, value);

    try {
      if (value) {
        // await schedulePersonalizedDailyPromiseNotification();
      } else {
        await Notifications.cancelScheduledNotificationAsync('daily-promise-morning');
        await Notifications.cancelScheduledNotificationAsync('daily-promise-afternoon');
        await Notifications.cancelScheduledNotificationAsync('daily-promise-evening');
        console.log('✅ All three daily reminders cancelled');
      }
    } catch (error) {
      console.error('Failed to toggle daily reminders:', error);
    }
  };

  return { isEnabled, isLoading, toggleReminders };
}