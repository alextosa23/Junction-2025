import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform, Alert } from "react-native";

export type RecurrenceType = "once" | "daily";

export async function scheduleEventNotification({
  title,
  date,
  recurrence,
}: {
  title: string;
  date: Date;
  recurrence: RecurrenceType;
}) {
  // 🔹 Build the trigger (when it should fire)
  // - "once"  → exactly at the selected date+time
  // - "daily" → every day at that hour:minute
  const trigger =
    recurrence === "once"
      ? (date as any) // one-time, exact datetime
      : ({
          hour: date.getHours(),
          minute: date.getMinutes(),
          repeats: true,
        } as any); // daily at this time

  // 🔹 Schedule notification
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      // 👇 Only the event name; no hour/minute in text
      title: title,
      sound: "default",
      // no `body` field at all → only title shows
    },
    trigger,
  });

  return notificationId;
}

// MUST be called ONCE from App.tsx inside a useEffect
export async function registerForNotificationsAsync() {

  if (!Device.isDevice) {
    Alert.alert("Notice", "Must use a physical device for notifications.");
    return;
  }

  // Check existing permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // If not granted, request it
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  // Still not allowed?
  if (finalStatus !== "granted") {
    Alert.alert("Permission required", "Notifications permission was not granted.");
    return;
  }

  // Android needs a notification channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
    });
  }

  console.log("📲 Notifications registered successfully");
}
