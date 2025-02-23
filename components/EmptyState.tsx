import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { THEME } from "./Theme";
import { ExternalPathString, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import InsightoPage from "./insigh.to/insigh.toPage";

export default function EmptyState() {
  return (
    <View style={styles.container}>
      <View style={styles.emptyStateIcon}>
        <Ionicons name="medical-outline" size={48} color={THEME.primary} />
      </View>
      <Text style={styles.emptyStateTitle}>Start Tracking</Text>
      <Text style={styles.emptyStateDescription}>
        Track your daily medications, vitamins, and supplements all in one place
      </Text>
      <Pressable
        onPress={() => router.push("/modal" as unknown as ExternalPathString)}
        style={styles.emptyStateButton}
        pointerEvents="auto" // Assegura que o botão responda aos toques
      >
        <Text style={styles.emptyStateButtonText}>Add Your First Pill</Text>
      </Pressable>
      <InsightoPage/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${THEME.primary}10`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: THEME.text,
    marginBottom: 12,
  },
  emptyStateDescription: {
    fontSize: 16,
    color: THEME.textSecondary,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  emptyStateButton: {
    backgroundColor: THEME.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    zIndex: 1, // Adicione esta linha
  },
  emptyStateButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
