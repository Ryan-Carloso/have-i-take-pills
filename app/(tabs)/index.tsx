import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppIntroSlider from 'react-native-app-intro-slider';
import * as StoreReview from 'expo-store-review';
import { THEME } from '@/components/Theme';
import { trackTest } from '@/components/Analytics/TrackTest';

const { width, height } = Dimensions.get('window');

const fallbackSlides = [
  {
    key: '1',
    image: require('../../assets/images/onboard/image01.png'),
    backgroundColor: '#fff',
  },
  {
    key: '2',
    image: require('../../assets/images/onboard/image02.png'),
    backgroundColor: '#FFF',
  },
  {
    key: '3',
    image: require('../../assets/images/onboard/image03.png'),
    backgroundColor: '#FFF',
  },
];

const Onboarding = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const res = await fetch('https://getimages-testes.vercel.app/api/onboard/dailydose'); 
        const data = await res.json();

        if (!data?.images || data.images.length !== 3) {
          throw new Error('API returned invalid images');
        }

        const formattedSlides = data.images.map((imageUrl: string, index: number) => ({
          key: `${index + 1}`,
          image: { uri: imageUrl },
          backgroundColor: '#FFF',
        }));

        setSlides(formattedSlides);
        trackTest('Started Onboarding - API version', 'OnboardFlow');
      } catch (error) {
        console.warn('Erro ao buscar imagens do onboard. Usando fallback local:', error);
        setSlides(fallbackSlides);
        trackTest('Started Onboarding - Fallback version', 'OnboardFlow');
      } finally {
        setLoading(false);
      }
    };

    fetchSlides();
  }, []);

  const handleSlideChange = (index: number) => {
    trackTest(`Viewing Onboarding Slide ${index + 1}`, 'OnboardFlow');
  };

  const handleDone = async () => {
    try {
      trackTest('Finish Onboarding', 'OnboardFlow');
      await AsyncStorage.setItem('onboardingComplete', 'true');
      router.push('/PaywallOnBoard');
    } catch (error) {
      console.error('Erro ao salvar status do onboarding:', error);
    }
  };

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

  if (loading || slides.length === 0) {
    return (
      <View style={[styles.slide, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={THEME.primary} />
      </View>
    );
  }

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
      onSlideChange={handleSlideChange}
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
    padding: 0,
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
    maxHeight: undefined,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 20,
    left: 20,
    right: 20,
  },
  button: {
    backgroundColor: '#486591',
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
