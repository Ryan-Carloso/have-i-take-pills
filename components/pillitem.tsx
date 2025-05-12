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

  // Effect #1: fetch total taken count
  useEffect(() => {
    let isMounted = true;

    const fetchCount = async () => {
      const { data, error, count } = await supabase
        .from("pill_history")
        .select("id", { count: "exact", head: true })
        .eq("pill_id", pill.id);

      if (!isMounted || error) return;

      // count may be null if head/select not supported—fallback to data length
      const newCount = typeof count === "number" ? count : data?.length ?? 0;
      if (newCount !== takenCount) {
        setTakenCount(newCount);
      }
    };

    fetchCount();
    return () => {
      isMounted = false;
    };
  }, [pill.id, supabase, takenCount]);

  // Effect #2: fetch last taken info & today check
  useEffect(() => {
    let isMounted = true;

    const fetchLastTaken = async () => {
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
      const dateStr = last.toLocaleDateString("pt-BR");
      const timeStr = last.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const info = `Último: ${dateStr} às ${timeStr}`;
      if (info !== lastTakenInfo) {
        setLastTakenInfo(info);
      }

      // Check if it was taken today
      const lastDay = new Date(last);
      const today = new Date(now);
      lastDay.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      const sameDay = lastDay.getTime() === today.getTime();

      if (sameDay !== isTaken) {
        setIsTaken(sameDay);
      }
      if (sameDay !== isButtonDisabled) {
        setIsButtonDisabled(sameDay);
      }
    };

    fetchLastTaken();
    return () => {
      isMounted = false;
    };
  }, [pill.id, supabase, isTaken, isButtonDisabled, lastTakenInfo]);

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
          formatted_time: now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          takenCount,
        },
      ]);

      if (error) {
        console.error("Erro ao salvar histórico:", error);
        return;
      }

      setIsTaken(true);
      setIsButtonDisabled(true);
      setTakenCount((prev) => prev + 1);

      onUpdate({
        ...pill,
        taken_count: takenCount + 1,
      });
    } catch (err) {
      console.error("Erro ao processar atualização:", err);
    }
  };

  const handleDelete = async () => {
    try {
      onDelete();

      const { error: pillsError } = await supabase
        .from("pills")
        .delete()
        .eq("id", pill.id);

      if (pillsError) {
        console.error("Erro ao deletar da tabela pills:", pillsError);
        Alert.alert(
          "Erro",
          "Não foi possível deletar o medicamento. Tente novamente."
        );
        return;
      }

      const { error: historyError } = await supabase
        .from("pill_history")
        .delete()
        .eq("pill_id", pill.id);

      if (historyError) {
        console.error("Erro ao deletar histórico:", historyError);
      }
    } catch (err) {
      console.error("Erro ao processar deleção:", err);
      Alert.alert(
        "Erro",
        "Ocorreu um erro ao deletar o medicamento. Tente novamente."
      );
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      "Confirmar exclusão",
      "Tem certeza que deseja excluir este medicamento? Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: handleDelete },
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
        <Text style={styles.time}>Horário: {pill.time}</Text>
        <Text style={styles.count}>Tomado: {takenCount} vezes</Text>
        {lastTakenInfo.length > 0 && (
          <Text style={styles.lastTakenInfo}>{lastTakenInfo}</Text>
        )}
        {isTaken && <Text style={styles.takenText}>Tomado hoje</Text>}
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
