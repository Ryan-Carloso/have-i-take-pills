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

// Agenda uma notificação com frequência
export async function schedulePillNotification(pillName: string, time: Date, frequency: string) {
  const now = new Date();
  let notificationTime = new Date(now); // Initialize with current time

  // Configura horário da notificação
  notificationTime.setHours(time.getHours(), time.getMinutes(), 0, 0);

  // Ajusta para o próximo dia se o horário já passou
  if (notificationTime <= now) {
    notificationTime.setDate(notificationTime.getDate() + 1);
  }

  // Calcula o tempo em segundos até a notificação, considerando a frequência
  let triggerInSeconds;
  let daysIfSome = 1; // Placeholder - replace with actual calculation based on frequency

  switch (frequency) {
    case 'daily':
      triggerInSeconds = Math.max(Math.round((notificationTime.getTime() - now.getTime()) / 1000), 1);
      break;
    case 'every 2 days':
      daysIfSome = 2; // Example: every 2 days
      notificationTime.setDate(notificationTime.getDate() + daysIfSome -1); // Adjust for the next notification time
      triggerInSeconds = Math.max(Math.round((notificationTime.getTime() - now.getTime()) / 1000), 1);
      break;
    case 'weekly':
      const dayOfWeek = notificationTime.getDay();
      const daysUntilNextNotification = (7 - dayOfWeek + time.getDay()) % 7; // Calculate days until next occurrence of the specified day
      notificationTime.setDate(notificationTime.getDate() + daysUntilNextNotification);
      triggerInSeconds = Math.max(Math.round((notificationTime.getTime() - now.getTime()) / 1000), 1);
      break;
    default:
      console.error('Invalid frequency:', frequency);
      return;
  }

  // Converte segundos em milissegundos
  const triggerInMilliseconds = triggerInSeconds * 1000;

  console.log('Trigger in seconds:', triggerInSeconds);
  console.log('Trigger in milliseconds:', triggerInMilliseconds);

  console.log('Current time:', now.toISOString());
  console.log('Notification time:', notificationTime.toISOString());
  console.log('Trigger in seconds:', triggerInSeconds);

  // Usa setTimeout para agendar a lógica de criação da notificação
  setTimeout(async () => {
    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Pill Reminder',
          body: `Time to take your ${pillName}!`,
          sound: true,
        },
        trigger: {
          seconds: triggerInSeconds,
        },
      });
      console.log('Notification scheduled with ID:', identifier);
    } catch (error) {
      console.error('Failed to schedule notification:', error);
    }
  }, triggerInMilliseconds);
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