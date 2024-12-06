import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AboutScreen() {
  const handleSocialLinkPress = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      console.error(`Unable to open URL: ${url}`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>💊 Have I Taken My Pills?</Text>
        <Text style={styles.description}>
          Never forget to take your daily supplements or medications again! 
          Whether it's creatine, whey, or critical pills for your health, 
          this app is your personal reminder to stay consistent and healthy.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>📬 Contact Us</Text>
        <Text style={styles.description}>
          Got a question or need assistance? We’re here to help!
        </Text>
        <TouchableOpacity style={styles.socialLink} onPress={() => handleSocialLinkPress('mailto:support@makedbyryan.tech')}>
          <Ionicons name="mail" size={24} color="#007AFF" style={styles.socialIcon} />
          <Text style={styles.linkText}>support@example.com</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialLink} onPress={() => handleSocialLinkPress('https://www.linkedin.com/in/ryancarlos/')}>
          <Ionicons name="logo-linkedin" size={24} color="#007AFF" style={styles.socialIcon} />
          <Text style={styles.linkText}>LinkedIn</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialLink} onPress={() => handleSocialLinkPress('https://www.instagram.com/make4ryan/')}>
          <Ionicons name="logo-instagram" size={24} color="#E1306C" style={styles.socialIcon} />
          <Text style={styles.linkText}>Instagram</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F9F9F9',
  },
  section: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#555',
    marginBottom: 15,
    lineHeight: 22,
  },
  socialLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  socialIcon: {
    marginRight: 10,
  },
  linkText: {
    fontSize: 16,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
});