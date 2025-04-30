import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppIntroSlider from 'react-native-app-intro-slider';
import * as StoreReview from 'expo-store-review';
import { THEME } from '@/components/Theme';
import { trackTest } from '@/components/Analytics/TrackTest';

const { width, height } = Dimensions.get('window');

// Dados locais de fallback
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

// Timeout para as requisições
const TIMEOUT_DURATION = 1000; // 1 segundo

// Função para buscar dados com timeout
const fetchWithTimeout = async (url, timeout = TIMEOUT_DURATION) => {
  return Promise.race([
    fetch(url),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout: Request took longer than ' + timeout + 'ms')), timeout)
    )
  ]);
};

// Função para pré-carregar dados do PaywallOnBoard com timeout
const preloadPaywallData = async () => {
  try {
    // Pré-carrega os dados de preços ou outras informações necessárias
    const response = await fetchWithTimeout('https://getimages-testes.vercel.app/api/paywall/info');
    const data = await response.json();
    
    // Armazena os dados no AsyncStorage para uso posterior
    await AsyncStorage.setItem('paywallData', JSON.stringify(data));
    console.log('Dados do paywall pré-carregados com sucesso');
    return true;
  } catch (error) {
    console.warn('Erro ao pré-carregar dados do paywall:', error);
    return false;
  }
};

const Onboarding = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [paywallDataLoaded, setPaywallDataLoaded] = useState(false);
  const router = useRouter();

  // Verificar se o onboarding já foi concluído
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const value = await AsyncStorage.getItem('onboardingComplete');
        
        if (__DEV__) {
          if (value === 'false') {
            // Development mode specific logic
          }
        } else if (value === 'true') {
          // Se o onboarding já foi concluído, redirecionar para home
          setOnboardingComplete(true);
          router.push('/home');
          return; // Sai da função para não carregar os slides desnecessariamente
        }
        
        // Se chegou aqui, o onboarding não foi concluído, então carrega os slides
        fetchData();
      } catch (error) {
        console.error('Erro ao verificar status do onboarding:', error);
        fetchData(); // Em caso de erro, carrega os slides por segurança
      }
    };

    checkOnboardingStatus();
  }, [router]);

  const fetchData = async () => {
    try {
      // Inicia o pré-carregamento dos dados do paywall em paralelo
      const paywallPromise = preloadPaywallData();
      
      // Busca os slides do onboarding com timeout
      try {
        const res = await fetchWithTimeout('https://getimages-testes.vercel.app/api/onboard/dailydose');
        const data = await res.json();

        if (!data?.images || data.images.length !== 3) {
          throw new Error('API returned invalid images');
        }

        const formattedSlides = data.images.map((imageUrl, index) => ({
          key: `${index + 1}`,
          image: { uri: imageUrl },
          backgroundColor: '#FFF',
        }));

        setSlides(formattedSlides);
        trackTest('Started Onboarding - API version', 'OnboardFlow');
      } catch (error) {
        console.warn('Timeout ou erro ao buscar imagens do onboard. Usando fallback local:', error);
        setSlides(fallbackSlides);
        trackTest('Started Onboarding - Fallback version', 'OnboardFlow');
      }
      
      // Verifica se os dados do paywall foram carregados
      const paywallLoaded = await paywallPromise;
      setPaywallDataLoaded(paywallLoaded);
    } catch (error) {
      console.warn('Erro geral no carregamento de dados:', error);
      setSlides(fallbackSlides);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const preloadPaywallImages = async () => {
      try {
        // Pré-carrega as imagens do paywall com timeout
        await Promise.race([
          Image.prefetch('https://tlaihqorrptgeflxarvm.supabase.co/storage/v1/object/public/paywall/background.png'),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), TIMEOUT_DURATION))
        ]);
        
        await Promise.race([
          Image.prefetch('https://tlaihqorrptgeflxarvm.supabase.co/storage/v1/object/public/paywall/icon.png'),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), TIMEOUT_DURATION))
        ]);
        
        console.log('Imagens do paywall pré-carregadas com sucesso');
      } catch (error) {
        console.warn('Erro ao pré-carregar imagens do paywall:', error);
      }
    };

    preloadPaywallImages();
  }, []);

  const handleSlideChange = (index) => {
    trackTest(`Viewing Onboarding Slide ${index + 1}`, 'OnboardFlow');
    
    // No penúltimo slide, garantimos que os dados do paywall estejam carregados
    if (index === slides.length - 2 && !paywallDataLoaded) {
      preloadPaywallData().then(success => setPaywallDataLoaded(success));
    }
  };

  const handleDone = async () => {
    try {
      trackTest('Finish Onboarding', 'OnboardFlow');
      await AsyncStorage.setItem('onboardingComplete', 'true');
      
      // Verifica se os dados do paywall foram carregados antes de navegar
      if (!paywallDataLoaded) {
        await preloadPaywallData();
      }
      
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

  // Se o onboarding já foi concluído, não renderiza nada (já redirecionou)
  if (onboardingComplete) {
    return null;
  }

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