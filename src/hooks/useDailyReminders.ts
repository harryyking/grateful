// src/hooks/useDailyReminders.ts
import { useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { AppState, AppStateStatus } from 'react-native';
import { schedulePersonalizedDailyPromiseNotification } from '@/services/notifications/notifications';
import { storage } from '@/services/context/ThemeContext';

const REMINDERS_ENABLED_KEY = 'daily-reminders-enabled';

export function useDailyReminders() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = storage.getBoolean(REMINDERS_ENABLED_KEY) ?? false;
    setIsEnabled(saved);
    setIsLoading(false);

    // Reschedule on mount — fills the 7-day window
    if (saved) {
      schedulePersonalizedDailyPromiseNotification();
    }
  }, []);

  // Reschedule every time app comes back to foreground
  // This keeps the window topped up without user doing anything
  useEffect(() => {
    if (!isEnabled) return;

    const subscription = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        if (nextState === 'active') {
          schedulePersonalizedDailyPromiseNotification();
        }
      }
    );

    return () => subscription.remove();
  }, [isEnabled]);

  const toggleReminders = async (value: boolean) => {
    setIsEnabled(value);
    storage.set(REMINDERS_ENABLED_KEY, value);

    if (value) {
      await schedulePersonalizedDailyPromiseNotification();
    } else {
      // Cancel all Grateful notifications
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      await Promise.all(
        scheduled
          .filter((n) => n.identifier.startsWith('grateful-'))
          .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier))
      );
    }
  };

  return { isEnabled, isLoading, toggleReminders };
}