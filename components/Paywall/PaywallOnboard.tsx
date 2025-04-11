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
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={require('../../assets/images/onboard/image01.png')}
          style={styles.backgroundImage}
          resizeMode="contain"
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  imageContainer: {
    height: '60%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginVertical: 20,
  },
  planCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
    width: width * 0.42,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: THEME.primary,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
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
    position: 'absolute',
    top: 10,
    right: -28,
    backgroundColor: THEME.warning,
    paddingHorizontal: 12,
    paddingVertical: 4,
    transform: [{ rotate: '45deg' }],
    width: 100,
    alignItems: 'center',
  },
  bestValueText: {
    color: THEME.white,
    fontSize: 12,
    fontWeight: '800',
  },
  subscribeButton: {
    backgroundColor: THEME.primary,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 12,
  },
  subscribeButtonText: {
    color: THEME.white,
    fontSize: 18,
    fontWeight: '700',
  },
  RestoreButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
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
