import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, SafeAreaView, Pressable } from 'react-native';
import { TextInput, Title, HelperText, Button } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { usePills } from '../../contexts/PillContext';
import { requestNotificationPermissions, schedulePillNotification } from '../../utils/notificationUtils';
import * as Notifications from 'expo-notifications';

interface Pill {
  id: string;
  name: string;
  time: string;
  frequency: string;
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
  const [frequency, setFrequency] = useState<string>('daily');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { addPill } = usePills();
  const router = useRouter();

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Pill name is required';
    }

    if (!['daily', 'every 2 days', 'weekly'].includes(frequency)) {
      newErrors.frequency = 'Frequency must be daily, every 2 days, or weekly';
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
          notificationId = await schedulePillNotification(name, time, frequency); // Incluímos a frequência aqui
        }

        const newPill: Pill = {
          id: Date.now().toString(),
          name,
          time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          frequency,
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

  const selectFrequency = (freq: string) => {
    setFrequency(freq);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>💊 Have I Taken My Pills?</Text>
          <Text style={styles.description}>
            Never forget your daily supplements or medications again! This app is your personal reminder to stay healthy and consistent.
          </Text>
        </View>

        <View style={styles.card}>
          <Title style={styles.addTitle}>Add a New Pill</Title>
          <Text style={styles.helperText}>Enter the name of the medication or supplement, e.g., Creatine.</Text>
          <TextInput
            label="Pill Name"
            value={name}
            onChangeText={setName}
            error={!!errors.name}
            style={styles.input}
            mode="outlined"
          />
          <HelperText type="error" visible={!!errors.name}>
            {errors.name}
          </HelperText>
          <Text style={styles.helperText}>Select the time of day you'd like to receive your reminder.</Text>
          <View style={styles.timepicker}>
            <Text style={styles.timeLabel}>⏰ Reminder Time:</Text>
            <DateTimePicker
              testID="dateTimePicker"
              value={time}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={(event, selectedTime) => {
                if (selectedTime) {
                  setTime(selectedTime);
                }
              }}
              style={styles.datePicker}
            />
          </View>

          <Text style={styles.frequencyLabel}>Frequency</Text>
          <View style={styles.frequencyButtons}>
            {['Daily', 'Every 2 Days', 'Weekly'].map((freq) => (
              <Pressable
                key={freq}
                onPress={() => selectFrequency(freq.toLowerCase())}
                style={[
                  styles.frequencyButton,
                  frequency === freq.toLowerCase() && styles.selectedFrequencyButton,
                ]}
              >
                <Text
                  style={[
                    styles.frequencyButtonLabel,
                    frequency === freq.toLowerCase() && styles.selectedFrequencyLabel,
                  ]}
                >
                  {freq}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleAddPill}
              style={styles.addButton}
              labelStyle={styles.buttonLabel}
            >
              Add Pill
            </Button>
            <Button
              mode="outlined"
              onPress={() => router.back()}
              style={styles.cancelButton}
              labelStyle={styles.buttonLabelCancel}
            >
              Cancel
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },
  card: {
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  addTitle: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 5,
  },
  helperText: {
    color: '#666',
    marginBottom: 10,
    fontSize: 14,
  },
  timepicker: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    maxWidth: 290,
    margin: 'auto'
    
    
  },
  timeLabel: {
    fontSize: 16,
    marginRight: 10,
  },
  frequencyLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  frequencyButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  frequencyButton: {
    flex: 1,
    marginHorizontal: 2,
    backgroundColor: '#FFF', // Default background color
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  frequencyButtonLabel: {
    fontSize: 14,
    textAlign: 'center',
    color: '#4CAF50', // Default text color
  },
  selectedFrequencyButton: {
    backgroundColor: '#4CAF50', // Green background for selected
  },
  selectedFrequencyLabel: {
    color: '#fff', // White text for selected
  },
  datePicker: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  addButton: {
    flex: 1,
    marginRight: 5,
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    flex: 1,
    marginLeft: 5,
    borderColor: '#4CAF50',
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  buttonLabelCancel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});