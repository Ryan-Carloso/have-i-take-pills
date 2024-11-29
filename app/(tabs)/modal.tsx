import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { TextInput, Button, Title, HelperText, useTheme } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { usePills } from '../../contexts/PillContext';

interface Pill {
  id: string;
  name: string;
  time: string;
  frequency: number;
  taken: boolean;
}

export default function AddPillModal(): JSX.Element {
  const [name, setName] = useState<string>('');
  const [time, setTime] = useState<Date>(new Date());
  const [frequency, setFrequency] = useState<string>('1');
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { addPill } = usePills();
  const router = useRouter();
  const theme = useTheme();

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
        const newPill: Pill = {
          id: Date.now().toString(),
          name,
          time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          frequency: parseInt(frequency, 10),
          taken: false,
        };

        await addPill(newPill);
        router.back();
      } catch (error) {
        console.error('Error adding pill:', error);
        // You might want to show an error message to the user here
      }
    }
  };

  const showTimepicker = () => {
    setShowTimePicker(true);
  };

  return (
    <View style={styles.container}>
      <Title style={[styles.title, { color: '#2e7d32' }]}>Add New Pill</Title>
      <TextInput
        label="Pill Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
        error={!!errors.name}
      />
      <HelperText type="error" visible={!!errors.name}>
        {errors.name}
      </HelperText>

      <Button onPress={showTimepicker} mode="outlined" style={styles.input}>
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Button>
      {showTimePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={time}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={(event, selectedTime) => {
            setShowTimePicker(Platform.OS === 'ios');
            if (selectedTime) {
              setTime(selectedTime);
            }
          }}
        />
      )}

      <TextInput
        label="Frequency (days)"
        value={frequency}
        onChangeText={setFrequency}
        keyboardType="numeric"
        style={styles.input}
        error={!!errors.frequency}
      
      />
      <HelperText type="error" visible={!!errors.frequency}>
        {errors.frequency}
      </HelperText>

      <View style={styles.buttonContainer}>
        <Button 
          mode="contained" 
          onPress={handleAddPill} 
          style={styles.button}
          buttonColor="#2e7d32">
          Add Pill
        </Button>
        <Button 
          mode="outlined" 
          onPress={() => router.back()} 
          style={styles.button}
          textColor="#2e7d32">
          Cancel
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    // backgroundColor removed from here as we're applying it inline
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#fff' 
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
});