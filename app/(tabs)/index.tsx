import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppIntroSlider from 'react-native-app-intro-slider';
import * as StoreReview from 'expo-store-review';
import { THEME } from '@/components/Theme';
import { trackVisit } from '@/components/Analytics/TrackVisit';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    key: '1',
    title: "Don't Ever Forget to Take a Supplement",
    text: "We help you out with your daily dose!",
    image: require('../../assets/images/iconOnboard.png'),
  },
  {
    key: '2',
    title: "Set Up Your Vitamins and Supplements",
    text: "Select the time to receive notifications",
    image: require('../../assets/images/modalphoto.png'),
  },
  {
    key: '3',
    title: "Never Forget Your Pills Again",
    text: "Stay on top of your health routine",
    image: require('../../assets/images/notify.png'),
  },
];

const Onboarding = () => {
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        if (!__DEV__) {
          const complete = await AsyncStorage.getItem('onboardingComplete');
          setOnboardingComplete(complete === 'true');
        }
        if (__DEV__) {
          const complete = await AsyncStorage.getItem('onboardingComplete');
          setOnboardingComplete(complete === 'true');
        }
        
        // Track app visits
        await trackAppVisits();
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      }
    };
    
    // Function to track app visits
    const trackAppVisits = async () => {
      try {
        // Get current visit count
        const visitsString = await AsyncStorage.getItem('appVisitCount');
        let visits = visitsString ? parseInt(visitsString) : 0;
        
        // Increment visit count
        visits += 1;
        
        // Request review at specific milestones
        if (visits === 3 || visits === 5 || visits === 10 || visits === 15) {
          console.log(`User has opened the app for the ${visits}${getOrdinalSuffix(visits)} time!`);
          
          // Check if device supports review requests
          const isAvailable = await StoreReview.isAvailableAsync();
          if (isAvailable) {
            // Request review
            await StoreReview.requestReview();
          }
        }
        
        // Save updated count
        await AsyncStorage.setItem('appVisitCount', visits.toString());
      } catch (error) {
        console.error("Error tracking app visits:", error);
      }
    };
    
    // Helper function to get ordinal suffix (1st, 2nd, 3rd, etc.)
    const getOrdinalSuffix = (n) => {
      if (n > 3 && n < 21) return 'th';
      switch (n % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };
    
    checkOnboarding();
  }, []);

  useEffect(() => {
    if (onboardingComplete) {
      router.push('/home');
    }
  }, [onboardingComplete, router]);

  const handleDone = async () => {
    try {
      trackVisit('Finish Onboarding, sending for paywall', 'OnboardFlow');
      await AsyncStorage.setItem('onboardingComplete', 'true');
      router.push('/PaywallOnBoard');
    } catch (error) {
      console.error("Error saving onboarding status:", error);
    }
  };

  if (onboardingComplete) return null;

  const renderItem = ({ item }) => (
    <View style={styles.slide}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.text}>{item.text}</Text>
      {item.image && (
        <View style={[styles.imageContainer, item.key === '2' ? { backgroundColor: THEME.white } : {}]}>
          <Image source={item.image} style={[styles.image, item.key === '3' ? {    width: width * 0.9, height: height * 0.16} : {  width: width * 0.4 ,height: height * 0.3}]} resizeMode="contain" />
        </View>

      )}
    </View>
  );

  const renderDoneButton = () => (
    <View style={{padding: 10, backgroundColor: THEME.cardPill, borderRadius: 20,}} >
      <Text style={{margin: 'auto', fontSize: 20, color: THEME.white, fontWeight: '900'}} >Next</Text>
    </View>
  );

  const renderNextButton = () => (
    <View style={{padding: 10, backgroundColor: THEME.cardPill, borderRadius: 20,}} >
      <Text style={{margin: 'auto', fontSize: 20, color: THEME.white, fontWeight: '900'}} >Next</Text>
    </View>
    );

  return (
    <AppIntroSlider
      data={slides}
      renderItem={renderItem}
      onDone={handleDone}
      bottomButton={true}
      dotStyle={styles.dot}
      activeDotStyle={styles.activeDot}
      renderDoneButton={renderDoneButton}
      renderNextButton={renderNextButton}
    />
  );
};

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: THEME.background,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: THEME.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    color: THEME.text,
    textAlign: 'center',
    marginTop: 10,
  },
  image: {
  },
  imageContainer: {
    borderRadius: 10,
    marginTop: 10,
  },
  dot: {
    backgroundColor: THEME.textSecondary,
    
  },
  activeDot: {
    backgroundColor: THEME.primary,
    
  },
  button: {
    backgroundColor: THEME.cardPill,
    borderRadius: 25,
  },
  buttonText: {
    color: THEME.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Onboarding;
