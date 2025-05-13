import React, { useState, useEffect, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { THEME } from "@/components/Theme";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { getUserId } from "../components/Analytics/UserID";

interface Pill {
  id: string;
  name: string;
  scheduled_time: string;
  time: string;
  taken_count?: number;
}

interface PillItemProps {
  pill: Pill;
  onUpdate: (updatedPill: Pill) => void;
  onDelete: () => void;
}

export default function PillItem({ pill, onUpdate, onDelete }: PillItemProps) {
  const [takenCount, setTakenCount] = useState<number>(1);
  const [isTaken, setIsTaken] = useState<boolean>(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(false);
  const [lastTakenInfo, setLastTakenInfo] = useState<string>("");

  const SUPABASE_URL = "https://db.freesupabase.shop";
  const SERVICE_ROLE_KEY =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc0NTkyMjQ4MCwiZXhwIjo0OTAxNTk2MDgwLCJyb2xlIjoiYW5vbiJ9.WQf_CkFfHMkx-fHXKg1YdvNOS1uUZfMJI3xNbZVZkL4";

  // Memoize the Supabase client so it doesn't re-create on every render
  const supabase: SupabaseClient = useMemo(
    () => createClient(SUPABASE_URL, SERVICE_ROLE_KEY),
    []
  );

  // Combined useEffect to fetch both count and last taken info
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        // 1. Fetch total taken count
        const { count, error: countError } = await supabase
          .from("pill_history")
          .select("id", { count: "exact", head: true })
          .eq("pill_id", pill.id);
          
        if (!isMounted) return;
        
        if (!countError && typeof count === "number") {
          setTakenCount(count);
        }

        // 2. Fetch last taken info
        const { data, error } = await supabase
          .from("pill_history")
          .select("taken_at")
          .eq("pill_id", pill.id)
          .order("taken_at", { ascending: false })
          .limit(1);

        if (!isMounted || error || !data || data.length === 0) return;

        const last = new Date(data[0].taken_at);
        const now = new Date();

        // Format for UI
        const dateStr = last.toLocaleDateString('en-US');
        const timeStr = last.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        });
        const info = `Last: ${dateStr} at ${timeStr}`;
        setLastTakenInfo(info);

        // Check if it was taken today
        const lastDay = new Date(last);
        const today = new Date(now);
        lastDay.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        const sameDay = lastDay.getTime() === today.getTime();

        setIsTaken(sameDay);
        setIsButtonDisabled(sameDay);
      } catch (err) {
        console.error("Error fetching pill data:", err);
      }
    };

    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, [pill.id, supabase]); // Only depend on stable values

  const handleUpdate = async () => {
    if (isButtonDisabled) return;

    try {
      const userId = await getUserId();
      const now = new Date();

      const { error } = await supabase.from("pill_history").insert([
        {
          user_id: userId,
          pill_id: pill.id,
          pill_name: pill.name,
          taken_at: now.toISOString(),
          formatted_time: now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          }),
        },
      ]);

      if (error) {
        console.error("Error saving history:", error);
        return;
      }

      // Update local state
      const newCount = takenCount + 1;
      setTakenCount(newCount);
      setIsTaken(true);
      setIsButtonDisabled(true);
      
      // Format for UI
      const dateStr = now.toLocaleDateString('en-US');
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
      setLastTakenInfo(`Last: ${dateStr} at ${timeStr}`);

      // Update parent component
      onUpdate({
        ...pill,
        taken_count: newCount,
      });
    } catch (err) {
      console.error("Error processing update:", err);
    }
  };

  const handleDelete = async () => {
    try {
      // First notify parent component
      onDelete();

      const { error: pillsError } = await supabase
        .from("pills")
        .delete()
        .eq("id", pill.id);

      if (pillsError) {
        console.error("Error deleting from pills table:", pillsError);
        Alert.alert(
          "Error",
          "Could not delete the medication. Please try again."
        );
        return;
      }

      const { error: historyError } = await supabase
        .from("pill_history")
        .delete()
        .eq("pill_id", pill.id);

      if (historyError) {
        console.error("Error deleting history:", historyError);
      }
    } catch (err) {
      console.error("Error processing deletion:", err);
      Alert.alert(
        "Error",
        "An error occurred while deleting the medication. Please try again."
      );
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      "Confirm deletion",
      "Are you sure you want to delete this medication? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: handleDelete },
      ]
    );
  };

  return (
    <TouchableOpacity
      onPress={handleUpdate}
      disabled={isButtonDisabled}
      style={[
        styles.card,
        isTaken && styles.cardTaken,
        isButtonDisabled && styles.cardDisabled,
      ]}
    >
      <View>
        <Text style={styles.name}>{pill.name}</Text>
        <Text style={styles.time}>Time: {pill.time}</Text>
        <Text style={styles.count}>Taken: {takenCount} times</Text>
        {lastTakenInfo.length > 0 && (
          <Text style={styles.lastTakenInfo}>{lastTakenInfo}</Text>
        )}
        {isTaken && <Text style={styles.takenText}>Taken today</Text>}
      </View>
      <TouchableOpacity onPress={confirmDelete} style={styles.deleteButton}>
        <Ionicons name="trash-outline" size={24} color="#ff3b30" />
      </TouchableOpacity>
    </TouchableOpacity>
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
  cardTaken: {
    backgroundColor: "#e8f5e9",
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
  count: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
  },
  cardDisabled: {
    opacity: 0.7,
  },
  takenText: {
    color: THEME.success,
    fontSize: 12,
    marginTop: 4,
    fontWeight: "bold",
  },
  lastTakenInfo: {
    fontSize: 11,
    color: "#666",
    marginTop: 2,
    fontStyle: "italic",
  },
});