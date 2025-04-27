import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configurações globais para como as notificações são tratadas quando o app está aberto
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Solicita permissões para notificações
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('pills', {
        name: 'Pills Reminder',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',  // Garantir que o som padrão seja usado
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Permissão para notificações não concedida.');
      return false;
    }

    return true;

  } catch (error) {
    console.error('Erro ao solicitar permissões de notificação:', error);
    return false;
  }
}
// Agenda uma notificação para um horário específico

// Função para registrar e pegar o Expo Push Token
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  try {
    // Configuração do canal no Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    // Solicitar permissões
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('🚫 Permissão para notificações negada.');
      return null;
    }

    // Obter o Expo Push Token
    const tokenData = await Notifications.getExpoPushTokenAsync();
    console.log('✅ Expo Push Token:', tokenData.data);

    return tokenData.data;

  } catch (error) {
    console.error('Erro ao obter Expo Push Token:', error);
    return null;
  }
}
// Cancela uma notificação agendada pelo ID
export async function cancelPillNotification(identifier: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
    console.log('Notification canceled:', identifier);
  } catch (error) {
    console.error('Failed to cancel notification:', error);
  }
}
