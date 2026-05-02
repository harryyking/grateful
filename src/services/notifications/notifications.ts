// src/services/notifications/notifications.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useProfileStore } from '@/store/ProfileStore';
import { simpleHash } from '@/store/DailyPromisesStore';
import promises from '@/data/promise';
import type { PrimaryDesire, Focus } from '@/types/promiseTypes';

async function setupNotificationChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('daily-promise', {
      name: 'Daily Promise Reminders',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#F4B740',
    });
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return false;
  await setupNotificationChannel();
  return true;
}

// Scores a promise against user profile — same logic as DailyPromisesStore
const scorePromise = (
  promise: (typeof promises)[number],
  desire: PrimaryDesire | null,
  focus: Focus[]
): number => {
  let score = 0;
  if (desire && promise.desire === desire) score += 3;
  if (focus.length > 0 && focus.includes(promise.focus as Focus)) score += 2;
  return score;
};

// Gets the right promise for ANY date — not just today
const getPromiseForDate = (
  date: Date,
  name: string,
  desire: PrimaryDesire | null,
  focus: Focus[]
): { finalText: string; reference: string } => {
  const seed = date.toDateString() + 'local-user';

  const scored = promises.map((p) => ({
    promise: p,
    score: scorePromise(p, desire, focus),
  }));

  const sorted = [...scored].sort((a, b) => {
    const hashA = simpleHash(seed + a.promise.id) / (a.score + 1);
    const hashB = simpleHash(seed + b.promise.id) / (b.score + 1);
    return hashA - hashB;
  });

  const promise = sorted[0].promise;

  return {
    finalText: promise.personalizedTemplate.replace('{name}', name || 'Beloved'),
    reference: promise.reference,
  };
};

const TIME_SLOTS = {
  morning:   { hour: 8,  minute: 0,  greeting: (name: string) => `Good morning, ${name} ✨` },
  afternoon: { hour: 14, minute: 0,  greeting: (name: string) => `Midday word for you, ${name}` },
  night:     { hour: 20, minute: 0,  greeting: (name: string) => `Before you rest, ${name} 🌙` },
};

export async function schedulePersonalizedDailyPromiseNotification() {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      const granted = await requestNotificationPermission();
      if (!granted) return;
    }

    const profile = useProfileStore.getState();
    if (!profile.hasCompletedOnboarding) return;

    const { name, primaryDesire, focus, encouragementTime } = profile;

    // Cancel ALL existing Grateful notifications cleanly
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const gratefulNotifs = scheduled.filter((n) =>
      n.identifier.startsWith('grateful-')
    );
    await Promise.all(
      gratefulNotifs.map((n) =>
        Notifications.cancelScheduledNotificationAsync(n.identifier)
      )
    );

    // Schedule 7 days ahead — user can go a full week without opening the app
    const slot = TIME_SLOTS[encouragementTime] ?? TIME_SLOTS.morning;
    const scheduled7Days: string[] = [];

    for (let daysAhead = 0; daysAhead < 7; daysAhead++) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + daysAhead);
      targetDate.setHours(slot.hour, slot.minute, 0, 0);

      // Skip if the time has already passed today
      if (targetDate <= new Date()) continue;

      const { finalText, reference } = getPromiseForDate(
        targetDate,
        name,
        primaryDesire,
        focus
      );

      const identifier = `grateful-${targetDate.toDateString().replace(/\s/g, '-')}`;

      await Notifications.scheduleNotificationAsync({
        identifier,
        content: {
          title: slot.greeting(name),
          body: finalText,
          subtitle: reference,          // shows under body on iOS
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: {
            screen: 'home',
            date: targetDate.toDateString(),
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: targetDate,
        },
      });

      scheduled7Days.push(`${targetDate.toDateString()} @ ${slot.hour}:${String(slot.minute).padStart(2, '0')}`);
    }

    console.log(`✅ Scheduled ${scheduled7Days.length} notifications:`, scheduled7Days);

  } catch (error) {
    console.error('Failed to schedule notifications:', error);
  }
}