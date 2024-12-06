import React, { useState, useEffect } from 'react';
import { Button, View, Text } from 'react-native';
import * as Notifications from 'expo-notifications';

export default function App() {
  const [message, setMessage] = useState('Texto da notificação');

  useEffect(() => {
    // Solicita permissão para enviar notificações
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Permissão para notificações não concedida!');
      }
    };

    requestPermissions();
  }, []);

  const scheduleNotification = async () => {
    // Agenda a notificação após 2 minutos
    setTimeout(async () => {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Notificação",
          body: message,
        },
        trigger: {},
      });
    }, 10000); // 1000 milissegundos = 1 segundo (apenas para agendar a execução do código)
  };

  return (
    <View>
      <Text>Mensagem: {message}</Text>
      <Button title="Agendar Notificação11" onPress={scheduleNotification} />
    </View>
  );
}