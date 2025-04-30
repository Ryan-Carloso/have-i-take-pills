import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Platform,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  Image
} from "react-native";

import {
  initConnection,
  requestSubscription,
  requestPurchase,
  useIAP,
  getProducts,
  endConnection,
  type Product,
} from "react-native-iap";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { THEME } from "@/components/Theme";
import { router } from "expo-router";
import { handleRestore } from "./RestoreButton";
import ButtonPolicy from "./ButtonPolicy";
import { trackTest } from "../Analytics/TrackTest";


const { width } = Dimensions.get("window");

interface PlatformSkus {
  subscription: string[];
  nonConsumable: string[];
}

interface ProductSkus {
  ios: PlatformSkus;
  android: PlatformSkus;
}

type ProductType = "subscription" | "lifetime";

interface ExtendedProduct extends Product {
  productType: ProductType;
}

const productSkus: ProductSkus = {
  ios: {
    subscription: ["montly_dailydose", "weekly_dailydose"],
    nonConsumable: ["LifeTime_DailyDose"],
  },
  android: {
    subscription: ["monthly_subscription"],
    nonConsumable: ["lifetime_access"],
  },
};

export default function Subscriptions() {
  
  const { connected } = useIAP();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  useEffect(() => {
    trackTest("Open Subscriptions Page", "SubsFlow",);
    const setup = async () => {
      try {
        await initConnection();
        const platform = Platform.OS as keyof ProductSkus;
        const skus = [
          ...productSkus[platform].subscription,
          ...productSkus[platform].nonConsumable,
        ];
        const available = await getProducts({ skus });
  
        const productsWithType: ExtendedProduct[] = available.map((product) => ({
          ...product,
          productType: productSkus[platform].subscription.includes(product.productId)
            ? "subscription"
            : "lifetime",
        }));
  
        setProducts(productsWithType);
  
        // Selecionar automaticamente o primeiro plano "lifetime"
        const lifetimePlan = productsWithType.find(p => p.productType === "lifetime");
        if (lifetimePlan) {
          setSelectedPlan(lifetimePlan.productId);
        }
      } catch (err) {
        Alert.alert("Error", "Failed to load subscription options");
      }
    };
  
    if (connected) {
      setup();
    }
  
    return () => {
      endConnection();
    };
  }, [connected]);

  const handlePurchase = async (product: ExtendedProduct) => {
    try {
      setLoading(true);
      if (product.productType === "subscription") {
        await requestSubscription({
          sku: product.productId,
          andDangerouslyFinishTransactionAutomaticallyIOS: false,
        });
      } else {
        await requestPurchase({
          sku: product.productId,
          andDangerouslyFinishTransactionAutomaticallyIOS: false,
        });
      }
      Alert.alert("Success", "Thank you for your purchase!");
      trackTest(`Just Bought ${product.title}`, "SubsFlow",);
      // Navigate to the review page after successful purchase
      router.push("/reviewPage");
    } catch (err) {
      trackTest(`Cancel Buying ${product.title}`, "SubsFlow",);
      router.push("/reviewPage");
    } finally {
      setLoading(false);
    }
  };

  const renderPlanCard = (product: ExtendedProduct) => (
    <TouchableOpacity
      key={product.productId}
      style={[
        styles.planCard,
        selectedPlan === product.productId && styles.selectedCard,
      ]}
      onPress={() => setSelectedPlan(product.productId)}
    >
      {product.productType === "lifetime" && (
        <View style={styles.bestValueTag}>
          <Text style={styles.bestValueText}>MELHOR OFERTA</Text>
        </View>
      )}
      <View style={styles.planContent}>
        <Text style={styles.price}>{product.localizedPrice}</Text>
        <Text style={styles.billingCycle}>
          {product.productType === "subscription" 
            ? product.productId.includes("weekly") 
              ? "Cobrança semanal"
              : "Cobrança mensal"
            : "Pagamento único"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Image
            source={require('../../assets/images/onboard/paywall.png')}
            style={styles.backgroundImage}
          />
          <TouchableOpacity 
            onPress={() => router.push('/home')} 
            style={styles.closeButton}
          >
            <MaterialCommunityIcons name="close" size={24} color={THEME.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Escolha seu plano</Text>
          <Text style={styles.subtitle}>
            Desbloqueie todos os recursos e controle sua saúde
          </Text>

          <View style={styles.cardsContainer}>
            {products.map(renderPlanCard)}
          </View>

          <TouchableOpacity
            style={[
              styles.subscribeButton,
              !selectedPlan && styles.disabledButton,
            ]}
            disabled={!selectedPlan || loading}
            onPress={() => {
              const selected = products.find(p => p.productId === selectedPlan);
              if (selected) handlePurchase(selected);
            }}
          >
            {loading ? (
              <ActivityIndicator color={THEME.white} />
            ) : (
              <Text style={styles.subscribeButtonText}>
                Continuar
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.restoreButton}
            onPress={handleRestore}
          >
            <Text style={styles.restoreButtonText}>Restaurar Compra</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    marginTop: 10,
    height: Dimensions.get('window').height * 0.6,

  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  content: {
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: THEME.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: THEME.textSecondary,
    textAlign: 'center',
    marginBottom: 6,
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 8,
  },
  planCard: {
    flex: 1,
    backgroundColor: THEME.background,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    elevation: 2,
    shadowColor: THEME.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
    maxWidth: Dimensions.get('window').width * 0.4,
  },
  selectedCard: {
    borderColor: THEME.primary,
  },
  planContent: {
    alignItems: 'center',
  },
  price: {
    fontSize: 24,
    fontWeight: '800',
    color: THEME.text,
    marginBottom: 4,
  },
  billingCycle: {
    fontSize: 12,
    color: THEME.textSecondary,
    textAlign: 'center',
  },
  bestValueTag: {
    position: 'absolute',
    top: 8,
    right: -28,
    backgroundColor: THEME.warning,
    paddingHorizontal: 8,
    paddingVertical: 2,
    transform: [{ rotate: '45deg' }],
    width: 100,
  },
  bestValueText: {
    color: THEME.white,
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
  },
  subscribeButton: {
    backgroundColor: THEME.primary,
    paddingVertical: 8,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 12,
  },
  subscribeButtonText: {
    color: THEME.white,
    fontSize: 18,
    fontWeight: '700',
  },
  restoreButton: {
    paddingVertical: 6,
    alignItems: 'center',
  },
  restoreButtonText: {
    color: THEME.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  disabledButton: {
    backgroundColor: THEME.textSecondary,
    opacity: 0.7,
  },
});
