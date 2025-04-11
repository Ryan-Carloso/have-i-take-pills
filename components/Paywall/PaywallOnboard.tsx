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
import { trackVisit } from "../Analytics/TrackVisit";


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
    subscription: ["montly_dailydose"],
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
    trackVisit("Open Subscriptions Page", "SubsFlow",);
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
      trackVisit(`Just Bought ${product.title}`, "SubsFlow",);
      // Navigate to the review page after successful purchase
      router.push("/reviewPage");
    } catch (err) {
      trackVisit(`Cancel Buying ${product.title}`, "SubsFlow",);
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
          <Text style={styles.bestValueText}>BEST DEAL</Text>
        </View>
      )}
      <Text style={styles.price}>{product.localizedPrice}</Text>
      <Text style={styles.billingCycle}>
        {product.productType === "subscription" ? "Monthly" : "One-time purchase"}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.imageContainer}>
          <Image
            source={require('../../assets/images/onboard/paywall.png')}
            style={styles.backgroundImage}
          />
        </View>
        <View style={styles.content}>
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
                Continue
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.RestoreButton}
            onPress={handleRestore}
          >
            <Text style={styles.restoreButtonText}>Restore Purchase</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  imageContainer: {
    paddingTop: 10,
    height: Dimensions.get('window').height * 0.6,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  subscribeButtonText: {
    color: THEME.white,
    fontSize: 18,
    fontWeight: '700',
  },
  backgroundImage: {
    width: '90%',
    height: '90%',
    resizeMode: 'contain',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    flex: 1,
    justifyContent: 'space-between', // Added to distribute space
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: -20, // Added to reduce space
  },
  planCard: {
    backgroundColor: THEME.background,
    borderRadius: 16,
    padding: 24,
    width: width * 0.42,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    elevation: 4,
    shadowColor: THEME.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: "hidden",
  },
  selectedCard: {
    borderColor: THEME.primary,
  },
  price: {
    fontSize: 28,
    fontWeight: '800',
    color: THEME.text,
    marginBottom: 8,
  },
  billingCycle: {
    fontSize: 14,
    color: THEME.textSecondary,
    textAlign: 'center',
  },
  bestValueTag: {
    position: "absolute",
    top: 15,
    right: -35,
    backgroundColor: THEME.warning,
    paddingHorizontal: 12,
    paddingVertical: 4,
    transform: [{ rotate: "45deg" }],
    width: 120,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  bestValueText: {
    color: THEME.white,
    fontSize: 13,
    fontWeight: "800",
  },
  subscribeButton: {
    backgroundColor: THEME.primary,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 12,
    width: '100%', // Added for consistency
  },
  RestoreButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
    width: '100%', // Added for consistency
    marginTop: 8, // Added some spacing
  },
  restoreButtonText: {
    color: THEME.white,
    fontSize: 16,
    fontWeight: '500',
  },
  disabledButton: {
    backgroundColor: THEME.textSecondary,
    opacity: 0.7,
  },
});
