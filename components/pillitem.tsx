import React, { useState, useEffect } from "react";
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
  taken_count?: number;
}

interface PillItemProps {
  pill: Pill;
  onUpdate: (updatedPill: Pill) => void;
  onDelete: () => void;
}

export default function PillItem({ pill, onUpdate, onDelete }: PillItemProps) {
  const [takenCount, setTakenCount] = useState(1);
  const [isTaken, setIsTaken] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [lastTakenInfo, setLastTakenInfo] = useState<string>('');
  const SUPABASE_URL = 'https://db.freesupabase.shop';
  const SERVICE_ROLE_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc0NTkyMjQ4MCwiZXhwIjo0OTAxNTk2MDgwLCJyb2xlIjoiYW5vbiJ9.WQf_CkFfHMkx-fHXKg1YdvNOS1uUZfMJI3xNbZVZkL4';
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // Combine both fetch operations into a single useEffect
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch taken count
        const { data: historyData, error: historyError } = await supabase
          .from('pill_history')
          .select('*')
          .eq('pill_id', pill.id);

        if (!historyError && historyData) {
          setTakenCount(historyData.length);
        }

        // Check last taken
        const { data: lastTakenData, error: lastTakenError } = await supabase
          .from('pill_history')
          .select('taken_at')
          .eq('pill_id', pill.id)
          .order('taken_at', { ascending: false })
          .limit(1);

        if (!lastTakenError && lastTakenData && lastTakenData.length > 0) {
          const lastTakenDate = new Date(lastTakenData[0].taken_at);
          const today = new Date();
          
          const formattedDate = lastTakenDate.toLocaleDateString('pt-BR');
          const formattedTime = lastTakenDate.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
          setLastTakenInfo(`Último: ${formattedDate} às ${formattedTime}`);
          
          const lastTakenDay = new Date(lastTakenDate.setHours(0,0,0,0));
          const todayDay = new Date(today.setHours(0,0,0,0));
          
          const isSameDay = lastTakenDay.getTime() === todayDay.getTime();
          setIsButtonDisabled(isSameDay);
          setIsTaken(isSameDay);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [pill.id]); // Add pill.id as dependency

  const handleUpdate = async () => {
    if (isButtonDisabled) return;
    
    try {
      const userId = await getUserId();
      const now = new Date();
      
      const { error } = await supabase
        .from('pill_history')
        .insert([
          {
            user_id: userId,
            pill_id: pill.id,
            pill_name: pill.name,
            taken_at: now.toISOString(),
            formatted_time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            takenCount: takenCount
          }
        ]);

      if (error) {
        console.error('Erro ao salvar histórico:', error);
        return;
      }

      setIsTaken(true);
      setIsButtonDisabled(true);
      setTakenCount(prev => prev + 1);
      
      const updated = {
        ...pill,
        
        taken_count: takenCount + 1
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
    <TouchableOpacity 
      onPress={handleUpdate}
      disabled={isButtonDisabled}
      style={[
        styles.card,
        isTaken && styles.cardTaken,
        isButtonDisabled && styles.cardDisabled
      ]}
    >
      <View>
        <Text style={styles.name}>{pill.name}</Text>
        <Text style={styles.time}>Horário: {pill.time}</Text>
        <Text style={styles.count}>Tomado: {takenCount} vezes</Text>
        {lastTakenInfo && (
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
    backgroundColor: '#e8f5e9', // cor verde clara quando tomado
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
    fontWeight: 'bold',
  },
  lastTakenInfo: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
    fontStyle: 'italic'
  }
});
