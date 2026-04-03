// src/services/notifications/notifications.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useProfileStore } from '@/store/ProfileStore';
import { getTodaysDailyPromises } from '@/store/DailyPromisesStore';


// Optional: Android notification channel
async function setupNotificationChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('daily-promise', {
      name: 'Daily Promise Reminders',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6B6B',
    });
  }
}

// 1. Request permission (only asks if needed)
export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Notification permission not granted');
    return false;
  }

  await setupNotificationChannel();
  return true;
}

// 2. Main scheduler — now 100% hook-free and Zustand-friendly
export async function schedulePersonalizedDailyPromiseNotification() {
  try {
    // 1. Permission
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      const granted = await requestNotificationPermission();
      if (!granted) return;
    }

    // 2. Get profile (non-hook way)
    const profile = useProfileStore.getState();
    if (!profile.hasCompletedOnboarding) {
      console.log('⏭️ Onboarding not completed → skipping notifications');
      return;
    }

    // 3. Get today's promises using the plain function (no hook!)
    const { userName, promises } = getTodaysDailyPromises();

    if (!promises?.length) throw new Error('No promises generated');

    const todayPromise = promises[0];

    // 4. Cancel old notifications
    await Notifications.cancelScheduledNotificationAsync('daily-promise-morning');
    await Notifications.cancelScheduledNotificationAsync('daily-promise-afternoon');
    await Notifications.cancelScheduledNotificationAsync('daily-promise-evening');

    const notificationTimes = [
      { id: 'daily-promise-morning', hour: 8, minute: 0, title: `Good morning, ${userName} ✨` },
      { id: 'daily-promise-afternoon', hour: 14, minute: 0, title: `Good afternoon, ${userName} ✨` },
      { id: 'daily-promise-evening', hour: 18, minute: 0, title: `Good evening, ${userName} ✨` },
    ];

    // 5. Schedule the three daily notifications
    for (const time of notificationTimes) {
      await Notifications.scheduleNotificationAsync({
        identifier: time.id,
        content: {
          title: time.title,
          body: todayPromise.finalText,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: {
            screen: 'promise',
            promiseId: todayPromise.id,
            timeOfDay: time.id.split('-')[2],
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: time.hour,
          minute: time.minute,
        },
      });

      console.log(`✅ Scheduled ${time.id} for ${time.hour}:${time.minute.toString().padStart(2, '0')}`);
    }

    console.log('🎉 All three daily personalized notifications scheduled!');
  } catch (error) {
    console.error('Failed to schedule personalized notifications:', error);
  }
}