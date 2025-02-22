import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, SafeAreaView, Animated } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { usePills } from '../../contexts/PillContext';
import { requestNotificationPermissions, schedulePillNotification } from '../../utils/notificationUtils';
import * as Notifications from 'expo-notifications';
import { THEME } from '@/components/Theme';

interface Pill {
  id: string;
  name: string;
  time: string;
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
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { addPill } = usePills();
  const router = useRouter();
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!name.trim()) {
      newErrors.name = 'Please enter a pill name';
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
          <View style={styles.pillIconContainer}>
            <Text style={styles.pillIcon}>💊</Text>
          </View>
          
          <Text style={styles.title}>Add New Medication</Text>
          <Text style={styles.subtitle}>
            Set up your medication reminder
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Medication Name</Text>
            <TextInput
              placeholder="e.g., Vitamin D, Aspirin"
              value={name}
              onChangeText={setName}
              error={!!errors.name}
              style={styles.input}
              mode="outlined"
              outlineColor={THEME.primary}
              activeOutlineColor={THEME.primary}
              theme={{ colors: { primary: THEME.primary } }}
            />
            {errors.name && (
              <Text style={styles.errorText}>{errors.name}</Text>
            )}
          </View>

          <View style={styles.timeContainer}>
            <Text style={styles.label}>Reminder Time</Text>
            <View style={styles.timeWrapper}>
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
                style={styles.timePicker}
              />
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleAddPill}
              style={styles.addButton}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
            >
              Add Medication
            </Button>
            <Button
              mode="outlined"
              onPress={() => router.back()}
              style={styles.cancelButton}
              contentStyle={styles.buttonContent}
              labelStyle={[styles.buttonLabel, styles.cancelButtonLabel]}
            >
              Cancel
            </Button>
          </View>
        </Animated.View>
        <Text style={styles.description}>
            Never forget your daily supplements or medications again! This app is your personal reminder to stay healthy and consistent.
          </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 40,
  },
  description: {
    fontSize: 16,
    color: THEME.text,
    lineHeight: 24,
    marginTop: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  pillIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F0F9F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    alignSelf: 'center',
  },
  pillIcon: {
    fontSize: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: THEME.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: THEME.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    marginTop: 4,
  },
  timeContainer: {
    marginBottom: 32,
  },
  timeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 8,
  },
  timePicker: {
    flex: 1,
  },
  buttonContainer: {
    gap: 12,
  },
  buttonContent: {
    height: 48,
  },
  addButton: {
    backgroundColor: THEME.primary,
    borderRadius: 12,
  },
  cancelButton: {
    borderColor: THEME.primary,
    borderRadius: 12,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonLabel: {
    color: THEME.primary,
  },
});