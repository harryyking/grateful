import { authClient } from "@/lib/authClient";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Optional: Set up Android notification channel (recommended)
async function setupNotificationChannel() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("daily-promise", {
      name: "Daily Promise Reminders",
      importance: Notifications.AndroidImportance.MAX, // shows heads-up
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF6B6B", // optional accent color
    });
  }
}

// 1. Request permission (only ask if not already granted/denied)
export async function requestNotificationPermission(): Promise<boolean> {
  // First check current status
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    // Ask only if not already decided
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Notification permission not granted");
    return false;
  }

  // Setup Android channel after permission is granted
  await setupNotificationChannel();

  return true;
}

// 2. Schedule daily notification at fixed time (e.g. 8:00 AM)
export async function scheduleDailyPromise(hour: number = 8, minute: number = 0) {
  // Optional: Cancel previous ones to avoid duplicates
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    identifier: "daily-promise-reminder", // ← useful if you later want to cancel/update this one specifically

    content: {
      title: "Your daily promise ✨",
      body: "God has something beautiful for you today.",
      sound: true,                    // play sound
      priority: Notifications.AndroidNotificationPriority.HIGH,
      data: { screen: "promise" },    // optional: deep link or custom data
    },

    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      // repeats: true  ← NOT needed with DAILY type
    },
  });

  console.log(`Daily promise scheduled for ${hour}:${minute.toString().padStart(2, "0")}`);
}




export async function schedulePersonalizedDailyPromiseNotification() {
  try {
    // 1. Ensure permission
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      const granted = await requestNotificationPermission();
      if (!granted) return;
    }
    const cookieHeader = authClient.getCookie()

    // 2. Fetch today's promises
    const res = await fetch("/api/daily-promises", {
      headers: { 
        "Cookie": cookieHeader || "", 
      },
      credentials: "omit",
    });
    if (!res.ok) throw new Error("Failed to fetch daily promises");

    const data = await res.json();
    if (!data.promises?.length) throw new Error("No promises returned");

    const todayPromise = data.promises[0]; // You can randomize later if desired

    // 3. Cancel any existing daily promise notifications
    await Notifications.cancelScheduledNotificationAsync("daily-promise-morning");
    await Notifications.cancelScheduledNotificationAsync("daily-promise-afternoon");
    await Notifications.cancelScheduledNotificationAsync("daily-promise-evening");

    const userName = data.userName || "Beloved";

    const notificationTimes = [
      { id: "daily-promise-morning",   hour: 8,  minute: 0,  title: `Good morning, ${userName} ✨` },
      { id: "daily-promise-afternoon", hour: 14, minute: 0,  title: `Good afternoon, ${userName} ✨` },
      { id: "daily-promise-evening",   hour: 18, minute: 0,  title: `Good evening, ${userName} ✨` },
    ];

    // 4. Schedule all three notifications
    for (const time of notificationTimes) {
      await Notifications.scheduleNotificationAsync({
        identifier: time.id,

        content: {
          title: time.title,
          body: todayPromise.finalText,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: {
            screen: "promise",
            promiseId: todayPromise.id,
            timeOfDay: time.id.split('-')[2], // morning/afternoon/evening
          },
        },

        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: time.hour,
          minute: time.minute,
        },
      });

      console.log(`✅ Scheduled notification for ${time.hour}:${time.minute.toString().padStart(2, '0')}`);
    }

    console.log("🎉 All three daily personalized notifications scheduled successfully!");

  } catch (error) {
    console.error("Failed to schedule personalized notifications:", error);
  }
}