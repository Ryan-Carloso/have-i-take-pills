import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from './Theme';

export default function Header() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>DailyDose</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.primary,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: THEME.white,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});