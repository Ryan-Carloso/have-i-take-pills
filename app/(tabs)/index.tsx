import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppIntroSlider from 'react-native-app-intro-slider';
import * as StoreReview from 'expo-store-review';
import { THEME } from '@/components/Theme';
import { trackTest } from '@/components/Analytics/TrackTest';


const { width, height } = Dimensions.get('window');

// Define slides with pre-assigned background colors matching each slide's main color theme
const slides = [
  {
    key: '1',
    image: require('../../assets/images/onboard/image01.png'),
    backgroundColor: '#fff', // Light purple/lavender color like in your image
  },
  {
    key: '2',
    image: require('../../assets/images/onboard/image02.png'),
    backgroundColor: '#FFF', // Light purple/lavender color like in your image
  },
  {
    key: '3',
    image: require('../../assets/images/onboard/image03.png'),
    backgroundColor: '#FFF', // Light purple/lavender color like in your image
  },
];

const Onboarding = () => {
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const router = useRouter();

  // Add this new function to handle slide changes
  const handleSlideChange = (index: number) => {
    trackTest(`Viewing Onboarding Slide ${index + 1}`, 'OnboardFlow');
  };

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        if (!__DEV__) {
          const complete = await AsyncStorage.getItem('onboardingComplete');
          setOnboardingComplete(complete === 'true');
        }
        if (__DEV__) {
          const complete = await AsyncStorage.getItem('onboardingComplete1');
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
      trackTest('Finish Onboarding, sending for paywall', 'OnboardFlow');
      await AsyncStorage.setItem('onboardingComplete', 'true');
      router.push('/PaywallOnBoard');
    } catch (error) {
      console.error("Error saving onboarding status:", error);
    }
  };

  if (onboardingComplete) return null;

  const renderItem = ({ item }) => (
    <View style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
      {item.image && (
        <View style={styles.imageContainer}>
          <Image
            source={item.image}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
      )}
    </View>
  );

  const renderDoneButton = () => (
    <View style={styles.buttonContainer}>
      <View style={styles.button}>
        <Text style={styles.buttonText}>Next</Text>
      </View>
    </View>
  );

  const renderNextButton = renderDoneButton;

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
      showNextButton={true}
      showDoneButton={true}
      onSlideChange={handleSlideChange} // Add this new prop
    />
  );
};

const styles = StyleSheet.create({
  slide: {
    flex: 1,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0, // Remove padding
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
    maxHeight: undefined, // Remove maxHeight constraint
  },
  buttonContainer: {
    position: 'absolute', // Position button absolutely
    bottom: Platform.OS === 'ios' ? 40 : 20,
    left: 20,
    right: 20,
  },
  button: {
    backgroundColor: '#486591', // Dark blue color for the button like in your image
    borderRadius: 25,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: THEME.white,
    fontSize: 18,
    fontWeight: '900',
  },
  dot: {
    backgroundColor: THEME.textSecondary,
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: THEME.primary,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

export default Onboarding;