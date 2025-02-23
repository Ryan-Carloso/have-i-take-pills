import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import { useRouter } from 'expo-router';

const slides = [
  {
    key: 1,
    title: 'Welcome!',
    text: 'This is the first slide.',
    backgroundColor: '#59b2ab',
  },
  {
    key: 2,
    title: 'Second Slide',
    text: 'This is the second slide.',
    backgroundColor: '#febe29',
  },
  {
    key: 3,
    title: 'Last Slide',
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
  image: {
    width: 300,
    height: 300,
  },
  text: {
    color: 'white',
    fontSize: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    color: 'white',
    marginBottom: 10,
  },
});

export default function componentName() {
    const router = useRouter();
  const _renderItem = ({ item }) => (
    <View style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.text}>{item.text}</Text>
    </View>
  );

  const _onDone = () => {
    router.push('/home')
    console.log('Onboarding finished');
  };

  return (
    <AppIntroSlider
      data={slides}
      renderItem={_renderItem}
      onDone={_onDone}
    />
  );
}
