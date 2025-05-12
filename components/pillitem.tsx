import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { THEME } from "@/components/Theme";
import { createClient } from "@supabase/supabase-js";
import { getUserId } from "../components/Analytics/UserID";

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
  const SUPABASE_URL = 'https://db.freesupabase.shop';
  const SERVICE_ROLE_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc0NTkyMjQ4MCwiZXhwIjo0OTAxNTk2MDgwLCJyb2xlIjoiYW5vbiJ9.WQf_CkFfHMkx-fHXKg1YdvNOS1uUZfMJI3xNbZVZkL4';
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const handleUpdate = async () => {
    try {
      const userId = await getUserId();
      const now = new Date();
      
      // Registrar na tabela pill_history
      const { error } = await supabase
        .from('pill_history')
        .insert([
          {
            user_id: userId,
            pill_id: pill.id,
            pill_name: pill.name,
            taken_at: now.toISOString(),
            formatted_time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);

      if (error) {
        console.error('Erro ao salvar histórico:', error);
        return;
      }

      // Atualizar o estado da pílula
      const updated = {
        ...pill,
        name: pill.name + " ✅",
      };
      onUpdate(updated);
    } catch (error) {
      console.error('Erro ao processar atualização:', error);
    }
  };

  const handleDelete = async () => {
    try {
      // Primeiro, chama o onDelete para atualizar a interface imediatamente
      onDelete();

      // Depois, deletar da tabela pills
      const { error: pillsError } = await supabase
        .from('pills')
        .delete()
        .eq('id', pill.id);

      if (pillsError) {
        console.error('Erro ao deletar da tabela pills:', pillsError);
        Alert.alert('Erro', 'Não foi possível deletar o medicamento. Tente novamente.');
        return;
      }

      // Por fim, deletar todo o histórico relacionado
      const { error: historyError } = await supabase
        .from('pill_history')
        .delete()
        .eq('pill_id', pill.id);

      if (historyError) {
        console.error('Erro ao deletar histórico:', historyError);
      }
    } catch (error) {
      console.error('Erro ao processar deleção:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao deletar o medicamento. Tente novamente.');
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir este medicamento? Esta ação não pode ser desfeita.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          onPress: handleDelete,
          style: 'destructive',
        },
      ],
    );
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
        <TouchableOpacity onPress={confirmDelete} style={styles.iconButton}>
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
