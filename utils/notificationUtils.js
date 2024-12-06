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
export async function schedulePillNotification(pillName: string, time: Date) {
  const now = new Date();
  const notificationTime = new Date();

  // Configura horário da notificação
  notificationTime.setHours(time.getHours(), time.getMinutes(), 0, 0);

  // Ajusta para o próximo dia se o horário já passou
  if (notificationTime <= now) {
    notificationTime.setDate(notificationTime.getDate() + 1);
  }

  // Calcula o tempo em segundos até a notificação
  const triggerInSeconds = Math.max(
    Math.round((notificationTime.getTime() - now.getTime()) / 1000),
    1
  );

  // Converte segundos em minutos
  const triggerInMinutes = Math.round(triggerInSeconds / 60);

  console.log('Trigger in seconds:', triggerInSeconds);
  console.log('Trigger in minutes:', triggerInMinutes);

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
        },
      });
      console.log('Notification scheduled with ID:', identifier);
    } catch (error) {
      console.error('Failed to schedule notification:', error);
    }
  }, triggerInMinutes * 60 * 1000); // Converte minutos para milissegundos
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