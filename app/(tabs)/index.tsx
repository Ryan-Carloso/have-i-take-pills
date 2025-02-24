import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import { useRouter } from 'expo-router';
import AsyncStorage  from '@react-native-async-storage/async-storage'
import {THEME} from '@/components/Theme'

const slides = [
  {
    key: 1,
    title: 'Dont Ever Forget to take an suplment, we help you out!!',
    text: 'Your daily Dose',
    image: require('../../assets/images/icon.png'),
    backgroundColor: THEME.surface,
  },
  {
    key: 2,
    title: 'First you need to set up each vitamin or suplement you will take',
    text: 'select the time you to send the notify',
    image: require('../../assets/images/modalphoto.png'),
    backgroundColor: THEME.surface,
  },
  {
    key: 3,
    title: 'you Will never forget again about your bills',
    text: 'This is the last slide.',
    backgroundColor: '#22bcb5',
  },
  
];

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  text: {
    color: 'black',
    fontSize: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    color: 'black',
    marginBottom: 10,
  },
  imageContainer: {
    height: 350, 
    aspectRatio: 9 / 16, 
    borderRadius: 30, 
    overflow: "hidden", // 🔥 Mantém a borda arredondada
    backgroundColor: THEME.surface,
    alignItems: "center", 
    justifyContent: "center",
  },
  tinyLogo: {
    height: "100%",
    width: "100%",
    resizeMode: "contain", // 🔥 Garante que a imagem inteira seja visível sem cortes
  },  
});

export default function componentName() {
    const router = useRouter();
    const [onboardingComplete, setOnboardingComplete] = useState(false);

    useEffect(() => {
      const checkOnboarding = async () => {
          try {
              // Check if we are in development mode.  __DEV__ is a React Native constant.
              if (!__DEV__) {
                  const complete = await AsyncStorage.getItem('onboardingComplete');
                  setOnboardingComplete(complete === 'true');
              } else {
                  setOnboardingComplete(false); // Always show onboarding in dev mode
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

    const _renderItem = ({ item }) => (
      <View style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
        <Text style={styles.title}>{item.title}</Text>
        {item.image && (
          <View
            style={[
              styles.imageContainer,
              item.backgroundColor && { backgroundColor: "white" }, // Apply background only if needed
            ]}
          >
            <Image
              source={item.image}
              style={styles.tinyLogo}
              resizeMode="contain" // Keeps the image inside the container
            />
          </View>
        )}
        <Text style={styles.text}>{item.text}</Text>
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

  const _onDone = async () => {
    try {
      await AsyncStorage.setItem('onboardingComplete', 'true');
    } catch (error) {
      console.error("Error saving onboarding status:", error);
    }
    router.push('/PaywallOnBoard');
    console.log('Onboarding finished');
  };

  if (onboardingComplete) {
    return null; // or a loading indicator
  }

  return (
    <AppIntroSlider
      data={slides}
      bottomButton={true}
      dotClickEnabled={true}
      renderItem={_renderItem}
      onDone={_onDone}
      renderDoneButton={renderDoneButton}
      renderNextButton={renderNextButton}
    />
  );
}