import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Solicita permissões para notificações
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

// Agenda uma notificação
export async function schedulePillNotification(pillName: string) {
  try {
    // Schedule notification directly with Expo's API using a date trigger
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Pill Reminder',
        body: `Time to take your ${pillName}!`,
        sound: true,
      },
      trigger: {
        hour: 12,
        minute: 10,
        repeats: true,  // This makes it repeat daily
      },
    });
    
    console.log('Notification scheduled with ID:', identifier);
    return identifier;
  } catch (error) {
    console.error('Failed to schedule notification:', error);
    return null;
  }
}

// Cancela uma notificação
export async function cancelPillNotification(identifier: string) {
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
    console.log('Notification canceled:', identifier);
  } catch (error) {
    console.error('Failed to cancel notification:', error);
  }
}