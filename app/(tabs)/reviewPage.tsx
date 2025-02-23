import React, { useEffect, useState } from "react"
import { View, Text, TouchableOpacity, Linking, StyleSheet, SafeAreaView } from "react-native"
import * as StoreReview from "expo-store-review"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"


export default function OnboardingCompleteScreen() {
  const router = useRouter()
  const [showHomeButton, setShowHomeButton] = useState(false)
  const [reviewRequested, setReviewRequested] = useState(false)

  const AppReviewURL  = ''

  const handleReviewRequest = async () => {
    if (!reviewRequested) {
      const isAvailable = await StoreReview.isAvailableAsync()
      if (isAvailable) {
        try {
          await StoreReview.requestReview()
          setReviewRequested(true)
          setTimeout(() => setShowHomeButton(true), 1000)
        } catch (error) {
          console.log("Error requesting native review:", error)
          openAppStoreReview()
        }
      } else {
        openAppStoreReview()
      }
    }
  }

  const openAppStoreReview = () => {
    setTimeout(() => {
      Linking.openURL(AppReviewURL).catch((err) => console.error("Error opening App Store page:", err))
    }, 1000)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      handleReviewRequest()
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Ionicons name="star" size={60} color="#FFD700" style={styles.icon} />
          <Text style={styles.title}>AskFeedBack</Text>
          <Text style={styles.description}>descReview</Text>

          {showHomeButton && (
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push("/home")}
              accessibilityRole="button"
              accessibilityLabel="Go to homepage"
            >
              <Text style={styles.buttonText}>GoToHome</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    color: "#fff",
  },
  description: {
    fontSize: 18,
    textAlign: "center",
    color: "#f5f5f5",
    marginBottom: 25,
    lineHeight: 20,
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#192f6a",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: "#FFD700",
    fontSize: 14,
    fontWeight: "600",
  },
})
