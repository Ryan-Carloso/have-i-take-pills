// @ts-ignore
import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { ExternalPathString, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { usePills } from '../../contexts/PillContext';
import PillItem from '../../components/pillitem';
import Header from '@/components/Header';
import EmptyState from '../../components/EmptyState';
import { THEME } from '@/components/Theme';

export default function HomeScreen() {
  const { pills, loadPills, updatePill, deletePill } = usePills();

  useFocusEffect(
    React.useCallback(() => {
      loadPills();
    }, [loadPills])
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Header/>

      {pills.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={pills}
          renderItem={({ item }) => (
            <PillItem 
              pill={item}
              onUpdate={(updatedPill) => {
                updatePill(updatedPill);
                loadPills(); // Recarrega a lista após atualização
              }}
              onDelete={() => {
                deletePill(item.id);
                loadPills(); // Recarrega após deletar
              }}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator
          scrollEnabled
          bounces
        />
      )}

      <TouchableOpacity
        onPress={() => router.push("/modal" as unknown as ExternalPathString)}
        style={styles.fab}
        activeOpacity={0.9}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: THEME.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});
