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
          <Text style={styles.bestValueText}>DEAL</Text>
        </View>
      )}

      <View style={styles.planHeader}>
        <Text style={styles.proPlan}>PRO</Text>
        <Text style={styles.planType}>
          {product.productType === "subscription" ? "MONTHLY" : "LIFETIME"}
        </Text>
      </View>
      <Text style={styles.price}>{product.localizedPrice}</Text>
      <Text style={styles.billingCycle}>
        {product.productType === "subscription" ? "Billed monthly" : "Pay once"}
      </Text>
    </TouchableOpacity>
  );

  const features = [
    "Unlimited pill tracking",
    "Daily notifications for your supplement needs",
    "Never miss a necessary pill",
    "unlimited Doses history",
    "Help an indie dev"
  ];

  const renderFeature = (feature: string): JSX.Element => (
    <View key={feature} style={styles.featureItem}>
      <MaterialCommunityIcons
        name="check-circle"
        size={20}
        color={THEME.success}
      />
      <Text style={styles.featureText}>{feature}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Plan</Text>
          <Text style={styles.subtitle}>
            Unlock all features and take control of your health
          </Text>
        </View>

        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>What's Included:</Text>
          {features.map(renderFeature)}
        </View>

        <View style={styles.launchDealContainer} >
        <MaterialCommunityIcons name="tag" size={24} color={THEME.warning} />
          <Text style={styles.launchDealText}>
          🚨 Last Chance! Lifetime Premium at a one-time discount—before it’s gone forever! ⏳🔥
          </Text>
        </View>

        {products.length > 0 && (
          <>
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
                const selected = products.find(
                  (p) => p.productId === selectedPlan
                );
                if (selected) handlePurchase(selected);
              }}
            >
              {loading ? (
                <ActivityIndicator color={THEME.white} />
              ) : (
                <Text style={styles.subscribeButtonText}>
                  {selectedPlan ? "Subscribe Now" : "Select a Plan"}
                </Text>
              )}
            </TouchableOpacity>
          </>
        )}
        
        <TouchableOpacity
        style={styles.RestoreButton}
        onPress={handleRestore}
      >
        <Text style={styles.restoreButtonText}>Restore Purchase</Text>
      </TouchableOpacity>

      <ButtonPolicy/>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: THEME.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: THEME.textSecondary,
    textAlign: "center",
  },
  featuresContainer: {
    marginBottom: 6,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: THEME.text,
    marginBottom: 16,
  },
  cardsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 32,
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
  planHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  proPlan: {
    fontSize: 28,
    fontWeight: "800",
    color: THEME.primary,
    marginBottom: 4,
  },
  planType: {
    fontSize: 16,
    color: THEME.textSecondary,
    fontWeight: "600",
  },
  price: {
    fontSize: 28,
    fontWeight: "800",
    color: THEME.text,
    marginBottom: 8,
  },
  billingCycle: {
    fontSize: 14,
    color: THEME.textSecondary,
  },
  bestValueText: {
    color: THEME.white,
    fontSize: 15,
    fontWeight: "800",
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
  subscribeButton: {
    backgroundColor: THEME.primary,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    marginHorizontal: 24,
  },
  RestoreButton: {
    backgroundColor: THEME.cardPill,
    paddingVertical: 6,
    borderRadius: 30,
    alignItems: "center",
    marginHorizontal: 24,
    marginTop: 20
  },
  disabledButton: {
    backgroundColor: THEME.textSecondary,
    opacity: 0.7,
  },
  subscribeButtonText: {
    color: THEME.white,
    fontSize: 18,
    fontWeight: "700",
  },
  restoreButtonText: {
    color: THEME.white,
    fontSize: 16,
    fontWeight: "500",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  featureText: {
    marginLeft: 12,
    fontSize: 16,
    color: THEME.text,
  },
  launchDealContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9C4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 14,
    marginTop: 6,
  },
  launchDealText: {
    marginLeft: 8,
    color: THEME.warning,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
});