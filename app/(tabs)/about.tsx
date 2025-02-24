import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '@/components/Header';
import { THEME } from '@/components/Theme';
import InsightoPage from '@/components/insigh.to/insigh.toPage';

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
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.emoji}>💊</Text>
          <Text style={styles.title}>Have I Taken My Pills?</Text>
          <Text style={styles.description}>
            Never forget to take your daily supplements or medications again! 
            Whether it's creatine, whey, or critical pills for your health, 
            this app is your personal reminder to stay consistent and healthy.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.emoji}>📬</Text>
          <Text style={styles.title}>Contact Us</Text>
          <Text style={styles.description}>
            Got a question or need assistance? We're here to help!
          </Text>
          <View style={styles.socialLinksContainer}>
            <SocialLink 
              icon="mail" 
              text="Email" 
              onPress={() => handleSocialLinkPress('mailto:ryancarlos16@gmail.com')}
            />
            <SocialLink 
              icon="logo-linkedin" 
              text="LinkedIn" 
              onPress={() => handleSocialLinkPress('https://www.linkedin.com/in/ryancarlos/')}
            />
            <SocialLink 
              icon="logo-instagram" 
              text="Instagram" 
              onPress={() => handleSocialLinkPress('https://www.instagram.com/make4ryan/')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.emoji}>💼</Text>
          <Text style={styles.title}>Need an App or Website?</Text>
          <Text style={styles.description}>
            Want an app like this or a website? I can create it for you! Get in touch with me via email or LinkedIn.
          </Text>
          <TouchableOpacity 
            style={styles.ctaButton} 
            onPress={() => handleSocialLinkPress('https://www.linkedin.com/in/ryancarlos/')}
          >
            <Text style={styles.ctaButtonText}>Connect on LinkedIn</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const SocialLink = ({ icon, text, onPress }) => (
  <TouchableOpacity style={styles.socialLink} onPress={onPress}>
    <Ionicons name={icon} size={24} color={THEME.accent} style={styles.socialIcon} />
    <Text style={styles.linkText}>{text}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    marginBottom: 10,
    padding: 20,
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: THEME.background,
    borderRadius: 15,
    shadowColor: THEME.text,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emoji: {
    fontSize: 40,
    textAlign: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME.primary,
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: THEME.textSecondary,
    marginBottom: 20,
    lineHeight: 24,
    textAlign: 'center',
  },
  socialLinksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  socialLink: {
    alignItems: 'center',
  },
  socialIcon: {
    marginBottom: 5,
  },
  linkText: {
    fontSize: 14,
    color: THEME.accent,
    textAlign: 'center',
  },
  ctaButton: {
    backgroundColor: THEME.accent,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: 'center',
  },
  ctaButtonText: {
    color: THEME.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});