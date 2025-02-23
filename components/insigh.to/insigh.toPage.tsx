import React from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { THEME } from '../Theme';


const InsightoPage = () => {
    const handlePress = () => {
    Linking.openURL('https://insigh.to/b/dailydose');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.button} 
        onPress={handlePress} 
        accessible={true} 
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>Got any feedback?</Text>
      </TouchableOpacity>
      <Text style={styles.Text}>Suggest features here.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    bottom: 30,
  },
  button: {
    backgroundColor: THEME.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  Text: {
    color: '#000',
    fontSize: 14,
    margin: 'auto',
    marginTop: 5
  },
});

export default InsightoPage;