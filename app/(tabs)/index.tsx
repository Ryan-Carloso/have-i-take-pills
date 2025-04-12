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

// Near the top of the file, after imports
const getRandomVariant = () => Math.random() < 0.5 ? 'A' : 'B';

const getSlideImages = (variant: string) => [
  {
    key: '1',
    image: variant === 'A' 
      ? require('../../assets/images/onboard/image01.png')
      : { uri: 'https://tlaihqorrptgeflxarvm.supabase.co/storage/v1/object/public/testes-onboard/image01.png' },
    backgroundColor: '#fff',
  },
  {
    key: '2',
    image: variant === 'A' 
      ? require('../../assets/images/onboard/image02.png')
      : { uri: 'https://tlaihqorrptgeflxarvm.supabase.co/storage/v1/object/public/testes-onboard/image02.png' },
    backgroundColor: '#FFF',
  },
  {
    key: '3',
    image: variant === 'A' 
      ? require('../../assets/images/onboard/image03.png')
      : { uri: 'https://tlaihqorrptgeflxarvm.supabase.co/storage/v1/object/public/testes-onboard/image03.png' },
    backgroundColor: '#FFF',
  },
];

const Onboarding = () => {
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [variant] = useState(getRandomVariant());
  const slides = getSlideImages(variant);
  const router = useRouter();

  
  // Add this useEffect to track which variant the user sees
  useEffect(() => {
    trackTest(`Started Onboarding - Variant ${variant}`, 'OnboardFlow');
  }, [variant]);

  const handleSlideChange = (index: number) => {
    trackTest(`Viewing Onboarding Slide ${index + 1} - Variant ${variant}`, 'OnboardFlow');
  };

  const handleDone = async () => {
    try {
      trackTest(`Finish Onboarding - Variant ${variant}`, 'OnboardFlow');
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