import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text } from 'react-native';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { usePills } from '../../contexts/PillContext';
import PillItem from '../../components/pillitem';
import Header from '@/components/Header';

export default function HomeScreen() {
  const { pills, loadPills } = usePills();

  useFocusEffect(
    React.useCallback(() => {
      loadPills();
    }, [loadPills])
  );

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Header />

      {pills.length === 0 ? (
        <View style={styles.noPillsContainer}>
          <Text style={styles.noPillsMessage}>Welcome!</Text>
          <Text style={styles.noPillsMessage}>
            Track vitamins, supplements like creatine, or medications for health conditions.
          </Text>
          <Text style={styles.noPillsMessage}>To add new pills, click down below on "Add Pill"</Text>
        </View>
      ) : (
        <FlatList
          data={pills}
          renderItem={({ item }) => <PillItem pill={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}

      <Link href="/modal" asChild>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    position: 'relative',
  },
  listContent: {
    paddingBottom: 80,
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#4CAF50',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  title: {
    fontSize: 25,
    justifyContent: 'center',
    display: 'flex',
    margin: 'auto',
    marginTop: 10,
    marginBottom: 2,
    backgroundColor: '#000',
    color: '#fff',
    padding: 10,
    borderRadius: 10,
  },
  noPillsMessage: {
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 20,
    marginHorizontal: 7,
  },
  noPillsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
});