import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { usePills } from '../contexts/PillContext';

interface Pill {
  id: string;
  name: string;
  time: string;
  frequency: number;
  taken: boolean;
}

interface PillItemProps {
  pill: Pill;
}

export default function PillItem({ pill }: PillItemProps) {
  const { togglePillTaken, deletePill } = usePills();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.pillContent, pill.taken && styles.taken]}
        onPress={() => togglePillTaken(pill.id)}
      >
        <View>
          <Text style={styles.name}>{pill.name}</Text>
          <Text style={styles.details}>
            Every {pill.frequency} at {pill.time}
          </Text>
        </View>
        <View style={[styles.status, pill.taken && styles.statusTaken]} />
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => deletePill(pill.id)}
      >
        <Text style={styles.deleteButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pillContent: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  taken: {
    backgroundColor: '#E8F5E9',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  details: {
    fontSize: 14,
    color: '#666',
  },
  status: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFA000',
  },
  statusTaken: {
    backgroundColor: '#4CAF50',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});