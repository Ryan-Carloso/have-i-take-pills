import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import * as StoreReview from "expo-store-review";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { THEME } from "@/components/Theme";

export default function OnboardingCompleteScreen() {
  const router = useRouter();
  const [showHomeButton, setShowHomeButton] = useState(false);
  const [reviewRequested, setReviewRequested] = useState(false);

  const AppReviewURL = "https://apps.apple.com/pt/app/ai-soccer-insights-football-iq/id6592649804?l=en-GB";
  // TODO: Update with the actual App Store / Play Store URL when available

  const handleReviewRequest = async () => {
    if (!reviewRequested) {
      const isAvailable = await StoreReview.isAvailableAsync();
      if (isAvailable) {
        try {
          await StoreReview.requestReview();
          setReviewRequested(true);
          setTimeout(() => setShowHomeButton(true), 1000);
        } catch (error) {
          console.log("Error requesting native review:", error);
          openAppStoreReview();
        }
      } else {
        openAppStoreReview();
      }
    }
  };

  const openAppStoreReview = () => {
    setTimeout(() => {
      Linking.openURL(AppReviewURL).catch((err) =>
        console.error("Error opening App Store page:", err)
      );
    }, 1000);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleReviewRequest();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="star" size={60} color={THEME.cardPill} />
        </View>
        <Text style={styles.title}>We Value Your Feedback!</Text>
        <Text style={styles.description}>
          Your review helps us improve and grow. Please take a moment to rate
          our app—it means a lot to us!
        </Text>

        {showHomeButton && (
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/home")}
            accessibilityRole="button"
            accessibilityLabel="Go to homepage"
          >
            <Text style={styles.buttonText}>Go to Home</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  iconContainer: {
    backgroundColor: THEME.background,
    borderRadius: 50,
    padding: 20,
    marginBottom: 30,
    elevation: 5,
    shadowColor: THEME.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: THEME.primary,
  },
  description: {
    fontSize: 18,
    textAlign: "center",
    color: THEME.textSecondary,
    marginBottom: 30,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: THEME.accent,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 3,
    shadowColor: THEME.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: THEME.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
