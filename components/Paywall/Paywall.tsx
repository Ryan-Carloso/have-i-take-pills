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
  Subscription,
} from "react-native-iap";

const { width } = Dimensions.get('window');

interface PlatformSkus {
  subscription: string[];
  nonConsumable: string[];
}

interface ProductSkus {
  ios: PlatformSkus;
  android: PlatformSkus;
}

// Define product types
type ProductType = 'subscription' | 'lifetime';

interface ExtendedProduct extends Product {
  productType: ProductType;
}

interface SubscriptionsProps {
  navigation: any; // Replace with your navigation type
}

// Define both subscription and non-consumable SKUs
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

export const Subscriptions: React.FC<SubscriptionsProps> = ({ }) => {
  const { connected } = useIAP();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionEstablished, setConnectionEstablished] = useState<boolean>(false);
  const [availableProducts, setAvailableProducts] = useState<ExtendedProduct[]>([]);
  const [purchasedProducts, setPurchasedProducts] = useState<string[]>([]);

  useEffect(() => {
    let isMounted: boolean = true;

    const setupIAP = async (): Promise<void> => {
      try {
        console.log("Starting IAP setup...");
        await endConnection();
        const result = await initConnection();
        
        if (isMounted) {
          setConnectionEstablished(true);
          console.log("IAP setup complete");
        }
      } catch (error) {
        console.error("IAP setup failed:", error);
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

  const fetchProducts = async (): Promise<void> => {
    if (!connectionEstablished) {
      console.log("Connection not established yet");
      return;
    }

    try {
      console.log("Fetching products...");
      setLoading(true);

      const platform = Platform.OS as keyof ProductSkus;
      const allSkus = [
        ...productSkus[platform].subscription,
        ...productSkus[platform].nonConsumable
      ];

      const products = await getProducts({ skus: allSkus });
      console.log("Available products:", products);

      if (!products || products.length === 0) {
        throw new Error("No products available for purchase");
      }

      // Add product type information
      const productsWithType: ExtendedProduct[] = products.map(product => ({
        ...product,
        productType: productSkus[platform].subscription.includes(product.productId) 
          ? 'subscription' 
          : 'lifetime'
      }));

      setAvailableProducts(productsWithType);
    } catch (error) {
      console.error("Product fetch error:", error);
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
      console.log("Initiating purchase for:", product.productId);

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
      setPurchasedProducts([...purchasedProducts, product.productId]);
    } catch (error) {
      console.error("Purchase error:", error);
      Alert.alert("Purchase Failed", `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const renderProductCard = (product: ExtendedProduct): JSX.Element => (
    <View key={product.productId} style={styles.subscriptionCard}>
      <Text style={styles.subscriptionTitle}>
        {product.title}
        {product.productType === 'lifetime' && " One-Time Offer"}
      </Text>
      <Text style={styles.subscriptionPrice}>{product.localizedPrice}</Text>
      <Text style={styles.subscriptionDescription}>{product.description}</Text>
      
      {product.productType === 'lifetime' && (
        <View>
      <Text style={styles.lifetimeNote}>
        ★ Launch deal! Lifetime premium FREE—ends March 15!
      </Text>
        </View>
      )}
      
      <TouchableOpacity
        style={[
          styles.subscribeButton,
          purchasedProducts.includes(product.productId) && styles.subscribedButton
        ]}
        onPress={() => handlePurchase(product)}
        disabled={loading || purchasedProducts.includes(product.productId)}
      >
        <Text style={styles.buttonText}>
          {purchasedProducts.includes(product.productId)
            ? product.productType === 'subscription' 
              ? "Subscribed"
              : "Purchased"
            : loading
            ? "Processing..."
            : product.productType === 'subscription'
            ? "Subscribe"
            : "Buy Lifetime Access"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderContent = (): JSX.Element => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0071bc" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              fetchProducts();
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {availableProducts.length > 0 ? (
          <>
            {/* Show subscription products first */}
            {availableProducts
              .filter(product => product.productType === 'subscription')
              .map(renderProductCard)}
            
            {/* Then show lifetime products */}
            {availableProducts
              .filter(product => product.productType === 'lifetime')
              .map(renderProductCard)}
          </>
        ) : (
          <Text style={styles.noSubscriptionsText}>No products available</Text>
        )}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {renderContent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f0f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scrollContainer: {
    padding: 16,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: '#0071bc',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  subscriptionCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  subscriptionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subscriptionPrice: {
    fontSize: 18,
    color: '#0071bc',
    marginBottom: 12,
  },
  subscriptionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  lifetimeNote: {
    fontSize: 14,
    color: '#4caf50',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subscribeButton: {
    backgroundColor: '#0071bc',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  subscribedButton: {
    backgroundColor: '#4caf50',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noSubscriptionsText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
});

export default Subscriptions;