//@ts-ignore
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import {
  initConnection,
  requestSubscription,
  requestPurchase,
  useIAP,
  getProducts,
  endConnection,
  Product,
} from "react-native-iap";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME } from '@/components/Theme';
import { router } from "expo-router";

const { width } = Dimensions.get('window');

// Types remain the same
interface PlatformSkus {
  subscription: string[];
  nonConsumable: string[];
}

interface ProductSkus {
  ios: PlatformSkus;
  android: PlatformSkus;
}

type ProductType = 'subscription' | 'lifetime';

interface ExtendedProduct extends Product {
  productType: ProductType;
}

interface SubscriptionsProps {
  navigation: any;
}

const productSkus: ProductSkus = {
  ios: {
    subscription: ["Monthly_DailyDose"],
    nonConsumable: ["LifeTime_DailyDose"]
  },
  android: {
    subscription: ["monthly_subscription"],
    nonConsumable: ["lifetime_access"]
  }
};

const features = [
  "Unlimited pill tracking",
  "Detailed analytics",
  "Reminder notifications",
  "Export health data",
  "Priority support"
];

export const Subscriptions: React.FC<SubscriptionsProps> = ({ }) => {
  // State management remains the same
  const { connected } = useIAP();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionEstablished, setConnectionEstablished] = useState<boolean>(false);
  const [availableProducts, setAvailableProducts] = useState<ExtendedProduct[]>([]);
  const [purchasedProducts, setPurchasedProducts] = useState<string[]>([]);

  // Setup and fetch functions remain the same
  useEffect(() => {
    let isMounted: boolean = true;

    const setupIAP = async (): Promise<void> => {
      try {
        await endConnection();
        const result = await initConnection();
        if (isMounted) {
          setConnectionEstablished(true);
        }
      } catch (error) {
        if (isMounted) {
          setError(`IAP initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          Alert.alert(
            "Setup Error",
            "Failed to initialize in-app purchases. Please try again later."
          );
        }
      }
    };

    setupIAP();
    return () => {
      isMounted = false;
      endConnection();
    };
  }, []);

  // Fetch products function remains the same
  const fetchProducts = async (): Promise<void> => {
    if (!connectionEstablished) return;

    try {
      setLoading(true);
      const platform = Platform.OS as keyof ProductSkus;
      const allSkus = [
        ...productSkus[platform].subscription,
        ...productSkus[platform].nonConsumable
      ];

      const products = await getProducts({ skus: allSkus });

      if (!products || products.length === 0) {
        throw new Error("No products available for purchase");
      }

      const productsWithType: ExtendedProduct[] = products.map(product => ({
        ...product,
        productType: productSkus[platform].subscription.includes(product.productId) 
          ? 'subscription' 
          : 'lifetime'
      }));

      setAvailableProducts(productsWithType);
    } catch (error) {
      setError(`Failed to load products: ${error instanceof Error ? error.message : 'Unknown error'}`);
      Alert.alert(
        "Loading Error",
        "Unable to load products. Please check your internet connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (connectionEstablished && connected) {
      fetchProducts();
    }
  }, [connectionEstablished, connected]);

  const handlePurchase = async (product: ExtendedProduct): Promise<void> => {
    if (purchasedProducts.includes(product.productId)) {
      Alert.alert("Already Purchased", 
        product.productType === 'subscription' 
          ? "You are already subscribed to this plan."
          : "You already own lifetime access."
      );
      return;
    }

    try {
      setLoading(true);

      if (product.productType === 'subscription') {
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
      router.push('/reviewPage')
      setPurchasedProducts([...purchasedProducts, product.productId]);
    } catch (error) {
      Alert.alert("Purchase Failed", `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      router.push('/Paywall')
    } finally {
      setLoading(false);
    }
  };

  const renderFeature = (feature: string): JSX.Element => (
    <View key={feature} style={styles.featureItem}>
      <MaterialCommunityIcons name="check-circle" size={20} color={THEME.success} />
      <Text style={styles.featureText}>{feature}</Text>
    </View>
  );

  const renderProductCard = (product: ExtendedProduct): JSX.Element => (
    <View key={product.productId} style={styles.subscriptionCard}>
      <View style={[
        styles.cardHeader,
        product.productType === 'lifetime' ? styles.lifetimeHeader : styles.subscriptionHeader
      ]}>
        {product.productType === 'lifetime' && (
          <View style={styles.bestValueTag}>
            <MaterialCommunityIcons name="star" size={16} color={THEME.primary} />
            <Text style={styles.bestValueText}>BEST VALUE</Text>
          </View>
        )}
        <Text style={styles.planType}>
          {product.productType === 'lifetime' ? 'Lifetime Access' : 'Monthly Plan'}
        </Text>
        <Text style={styles.planPrice}>{product.localizedPrice}</Text>
      </View>
      {product.productType === 'subscription' && (
        <Text style={styles.billingCycle}>Billed monthly</Text>
      )}

      <View style={styles.cardContent}>
        {features.map(renderFeature)}

        {product.productType === 'lifetime' && (
          <View style={styles.launchDealContainer}>
            <MaterialCommunityIcons name="tag" size={24} color={THEME.warning} />
            <Text style={styles.launchDealText}>
              Launch deal! Lifetime premium FREE—ends March 15!
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.purchaseButton,
            product.productType === 'lifetime' ? styles.lifetimeButton : styles.subscriptionButton,
            purchasedProducts.includes(product.productId) && styles.purchasedButton
          ]}
          onPress={() => handlePurchase(product)}
          disabled={loading || purchasedProducts.includes(product.productId)}
        >
          {loading ? (
            <ActivityIndicator color={THEME.white} />
          ) : (
            <>
              <Text style={styles.buttonText}>
                {purchasedProducts.includes(product.productId)
                  ? "Purchased"
                  : product.productType === 'lifetime'
                  ? "Get Lifetime Access"
                  : "Start Monthly Plan"}
              </Text>
              <MaterialCommunityIcons 
                name={purchasedProducts.includes(product.productId) 
                  ? "check"
                  : product.productType === 'lifetime'
                  ? "lightning-bolt"
                  : "clock-outline"} 
                size={20} 
                color={THEME.white} 
                style={styles.buttonIcon}
              />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle" size={48} color={THEME.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setError(null);
            fetchProducts();
          }}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Plan</Text>
          <Text style={styles.subtitle}>
            Unlock premium features and take control of your health journey
          </Text>
        </View>

        {availableProducts.length > 0 ? (
          <>
            {availableProducts
              .filter(product => product.productType === 'lifetime')
              .map(renderProductCard)}
            {availableProducts
              .filter(product => product.productType === 'subscription')
              .map(renderProductCard)}
          </>
        ) : (
          <Text style={styles.noProductsText}>No plans available at the moment</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  scrollContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: THEME.primary,
    textAlign: 'center',
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 16,
    color: THEME.textSecondary,
    textAlign: 'center',
    marginHorizontal: 24,
    lineHeight: 22,
  },
  subscriptionCard: {
    backgroundColor: THEME.surface,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: 4,
    alignItems: 'center',
  },
  lifetimeHeader: {
    backgroundColor: THEME.primary,
  },
  subscriptionHeader: {
    backgroundColor: THEME.success,
  },
  bestValueTag: {
    position: 'absolute',
    top: 15,
    right: -30,
    backgroundColor: THEME.Yellow,
    paddingHorizontal: 12,
    paddingVertical: 4,
    transform: [{ rotate: '45deg' }],
    width: 120,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bestValueText: {
    color: THEME.primary,
    fontSize: 10,
    fontWeight: '800',
    marginLeft: 4,
  },
  planType: {
    color: THEME.white,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
    marginTop: 4,
  },
  planPrice: {
    color: THEME.white,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  billingCycle: {
    color: THEME.text,
    fontSize: 14,
    margin: 'auto',
    marginTop: 8
  },
  cardContent: {
    padding: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
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
    marginVertical: 16,
  },
  launchDealText: {
    marginLeft: 8,
    color: THEME.warning,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  purchaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  lifetimeButton: {
    backgroundColor: THEME.primary,
  },
  subscriptionButton: {
    backgroundColor: THEME.success,
  },
  purchasedButton: {
    backgroundColor: THEME.success,
  },
  buttonText: {
    color: THEME.white,
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: THEME.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: THEME.background,
  },
  errorText: {
    fontSize: 16,
    color: THEME.error,
    textAlign: 'center',
    marginBottom: 16,
    marginTop: 12,
  },
  retryButton: {
    backgroundColor: THEME.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: THEME.white,
    fontSize: 16,
    fontWeight: '600',
  },
  noProductsText: {
    fontSize: 16,
    color: THEME.textSecondary,
    textAlign: 'center',
    marginTop: 24,
  },
});

export default Subscriptions;
