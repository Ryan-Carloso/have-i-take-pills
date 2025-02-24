import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEME } from '@/components/Theme';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    key: 1,
    title: "Don't Ever Forget to Take a Supplement",
    text: "We help you out with your daily dose!",
    image: require('../../assets/images/icon.png'),
  },
  {
    key: 2,
    title: "Set Up Your Vitamins and Supplements",
    text: "Select the time to receive notifications",
    image: require('../../assets/images/modalphoto.png'),
  },
  {
    key: 3,
    title: "Never Forget Your Pills Again",
    text: "Stay on top of your health routine",
    image: null,
  },
];

const Onboarding = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        if (!__DEV__) {
          const complete = await AsyncStorage.getItem('onboardingComplete');
          setOnboardingComplete(complete === 'true');
        } else {
          setOnboardingComplete(false);
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      }
    };
    checkOnboarding();
  }, []);

  useEffect(() => {
    if (onboardingComplete) {
      router.push('/home');
    }
  }, [onboardingComplete, router]);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleDone();
    }
  };

  const handleDone = async () => {
    try {
      await AsyncStorage.setItem('onboardingComplete', 'true');
      router.push('/PaywallOnBoard');
    } catch (error) {
      console.error("Error saving onboarding status:", error);
    }
  };

  if (onboardingComplete) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentSlide(slideIndex);
        }}
      >
        {slides.map((slide, index) => (
          <View key={slide.key} style={[
            styles.slide,
          ]}>
            <Text style={styles.title}>{slide.title}</Text>
            {slide.image && (
              <View style={[styles.imageContainer, index === 0 ? {} : { backgroundColor: THEME.white } ]}>
                <Image source={slide.image} style={styles.image} resizeMode="contain" />
              </View>
            )}
            <Text style={styles.text}>{slide.text}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              { backgroundColor: index === currentSlide ? THEME.primary : THEME.textSecondary }
            ]}
          />
        ))}
      </View>
      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>
          {currentSlide === slides.length - 1 ? 'Next' : 'Next'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.surface,
  },
  slide: {
    width,
    height,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
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
    marginBottom: 20,
  },
  imageContainer: {
    width: width * 0.6,
    height: height * 0.5,
    marginBottom: 30,
    overflow: 'hidden',
    borderRadius: 30,

  },
  image: {
    width: '100%',
    height: '100%',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  button: {
    backgroundColor: THEME.cardPill,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignSelf: 'center',
    marginBottom: 30,
  },
  buttonText: {
    color: THEME.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Onboarding;