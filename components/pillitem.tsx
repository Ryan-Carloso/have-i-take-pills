import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { THEME } from "@/components/Theme";

interface Pill {
  id: string;
  name: string;
  scheduled_time: string;
  time: string;
}

interface PillItemProps {
  pill: Pill;
  onUpdate: (updatedPill: Pill) => void;
  onDelete: () => void;
}

export default function PillItem({ pill, onUpdate, onDelete }: PillItemProps) {
  const handleUpdate = () => {
    const updated = {
      ...pill,
      name: pill.name + " ✅",
    };
    onUpdate(updated);
  };

  return (
    <View style={styles.card}>
      <View>
        <Text style={styles.name}>{pill.name}</Text>
        <Text style={styles.time}>Horário: {pill.time}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity onPress={handleUpdate} style={styles.iconButton}>
          <Ionicons name="checkmark-circle-outline" size={24} color={THEME.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={styles.iconButton}>
          <Ionicons name="trash-outline" size={24} color="#ff3b30" />
        </TouchableOpacity>
      </View>
    </View>
  );
}



const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  time: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
  },
  iconButton: {
    marginLeft: 12,
  },
});
