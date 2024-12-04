import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function requestNotificationPermissions() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('pills', {
      name: 'Pills Reminder',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  return finalStatus === 'granted';
}

export async function schedulePillNotification(pillName: string, time: Date) {
  const notificationTime = new Date(time);
  notificationTime.setMinutes(notificationTime.getMinutes() - 10); // 10 minutes before

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Pill Reminder",
      body: `Time to take ${pillName} in 10 minutes!`,
      sound: true,
    },
    trigger: {
      hour: notificationTime.getHours(),
      minute: notificationTime.getMinutes(),
      repeats: true,
    },
  });

  return identifier;
}

export async function cancelPillNotification(identifier: string) {
  await Notifications.cancelScheduledNotificationAsync(identifier);
} 