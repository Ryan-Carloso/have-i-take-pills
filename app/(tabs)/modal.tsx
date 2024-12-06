import React, { useState } from 'react';
import { View, StyleSheet, Platform, Text, ScrollView } from 'react-native';
import { TextInput, Button, Title, HelperText } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { usePills } from '../../contexts/PillContext';
import { requestNotificationPermissions, schedulePillNotification } from '../../utils/notificationUtils';
import * as Notifications from 'expo-notifications';

interface Pill {
  id: string;
  name: string;
  time: string;
  frequency: number;
  taken: boolean;
  notificationId?: string;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function AddPillModal(): JSX.Element {
  const [name, setName] = useState<string>('');
  const [time, setTime] = useState<Date>(new Date());
  const [frequency, setFrequency] = useState<string>('1');
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { addPill } = usePills();
  const router = useRouter();

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Pill name is required';
    }

    const frequencyNum = parseInt(frequency, 10);
    if (isNaN(frequencyNum) || frequencyNum < 1) {
      newErrors.frequency = 'Frequency must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddPill = async (): Promise<void> => {
    if (validateForm()) {
      try {
        const permissionGranted = await requestNotificationPermissions();
        let notificationId;

        if (permissionGranted) {
          notificationId = await schedulePillNotification(name, time);
        }

        const newPill: Pill = {
          id: Date.now().toString(),
          name,
          time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          frequency: parseInt(frequency, 10),
          taken: false,
          notificationId,
        };

        addPill(newPill);
        router.back();
      } catch (error) {
        console.error('Error adding pill:', error);
      }
    }
  };

  const showTimepicker = () => {
    setShowTimePicker(!showTimePicker);  // Alterna a visibilidade do picker
  };

  return (
    <ScrollView style={styles.container}>
        <Text style={styles.title}>💊 Have I Taken My Pills?</Text>

        <Text style={styles.description}>
          Never forget your daily supplements or medications again! This app is your personal reminder to stay healthy and consistent.
        </Text>
      <View style={styles.card}>
        <Title style={styles.addTitle}>Add a New Pill</Title>
        <TextInput
          label="Pill Name"
          value={name}
          onChangeText={setName}
          error={!!errors.name}
          style={styles.input}
          mode="outlined"
        />
        <HelperText style={{marginTop: -10}}  type="error" visible={!!errors.name}>
          {errors.name}
        </HelperText>
        <Text style={[styles.DescText, { marginBottom: 10, marginTop: -5, }]}>Enter the name of the medication or supplement, e.g., Creatine.</Text>


        <View
        style={styles.timepicker}
        
        >
          <Text>⏰ </Text>
          <DateTimePicker
            testID="dateTimePicker"
            value={time}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={(event, selectedTime) => {
              setShowTimePicker(false);  // Fecha o picker após a seleção
              if (selectedTime) {
                setTime(selectedTime);
              }
            }}
          />
          </View>

        <Text style={[styles.DescText, { marginBottom: 5, marginTop: 5 }]}>Select the time of day you’d like to receive your reminder.</Text>

        <TextInput
          label="Frequency (days)"
          value={frequency}
          onChangeText={setFrequency}
          keyboardType="numeric"
          style={styles.input}
          error={!!errors.frequency}
          mode="outlined"
        />
        <HelperText style={{marginTop: -10}}  type="error" visible={!!errors.frequency}>
          {errors.frequency}
        </HelperText>

        <Text style={[styles.DescText, { marginTop: -5 }]}>
          Choose the frequency: enter 1 for daily, 2 for every two days, and so on.
        </Text>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleAddPill}
            style={styles.button}
            labelStyle={{ color: 'white' }}
            buttonColor="#4CAF50">
            Add Pill
          </Button>
          <Button
            mode="outlined"
            onPress={() => router.back()}
            style={styles.button}
            textColor="#4CAF50">
            Cancel
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F3F4F6',
    marginTop: 7,
  },
  DescText: {
    color: "gray"
  },
  card: {
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 7,
  },
  addTitle: {
    fontSize: 22,
    marginBottom: 7,
    textAlign: 'center',
    color: '#4CAF50',
  },
  description: {
    fontSize: 16,
    color: '#555',
    marginBottom: 15,
    lineHeight: 22,
  },
  input: {
    marginBottom: 7,
    marginTop: 7,
    
  },
  timepicker: {
    margin: 'auto',
    marginBottom: 7,
    marginTop: 7,
    display: 'flex',
    flexDirection: "row",
    alignItems: 'center',
    paddingRight: 20,

  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 7,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
});