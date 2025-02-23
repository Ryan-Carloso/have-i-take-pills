import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import {
  GestureHandlerRootView,
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from "react-native-gesture-handler";
import { usePills } from "../contexts/PillContext";
import { THEME } from "./Theme";

interface Pill {
  id: string;
  name: string;
  time: string;
  frequency: number;
  taken: boolean;
  lastTakenDate: string;
}

interface PillItemProps {
  pill: Pill;
}

export default function PillItem({ pill }: PillItemProps) {
  const { togglePillTaken, deletePill, updatePill } = usePills();
  const translateX = useRef(new Animated.Value(0)).current;
  const [isDeleteVisible, setIsDeleteVisible] = useState(false);

  const checkAndResetPillStatus = () => {
    const currentDate = new Date();
    const lastTakenDate = new Date(pill.lastTakenDate);
    
    // Reset hours to midnight for date comparison
    currentDate.setHours(0, 0, 0, 0);
    lastTakenDate.setHours(0, 0, 0, 0);

    // If the dates are different and pill is marked as taken, reset it
    if (currentDate.getTime() !== lastTakenDate.getTime() && pill.taken) {
      updatePill({
        ...pill,
        taken: false,
      });
    }
  };

  useEffect(() => {
    checkAndResetPillStatus();
    
    // Check status every minute
    const intervalId = setInterval(checkAndResetPillStatus, 60000);
    return () => clearInterval(intervalId);
  }, [pill]);

  const onGestureEvent = Animated.event<PanGestureHandlerGestureEvent>(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: PanGestureHandlerGestureEvent) => {
    if (event.nativeEvent.oldState === 4) {
      if (event.nativeEvent.translationX < -50) {
        setIsDeleteVisible(true);
        Animated.timing(translateX, {
          toValue: -10,
          duration: 200,
          useNativeDriver: true,
        }).start();
      } else {
        setIsDeleteVisible(false);
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  const handlePillTaken = () => {
    const currentDate = new Date().toISOString();
    
    // First update the lastTakenDate
    updatePill({
      ...pill,
      lastTakenDate: currentDate,
    });
    
    // Then toggle the taken status
    togglePillTaken(pill.id);
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
      >
        <Animated.View
          style={[styles.pillContainer, { transform: [{ translateX }] }]}
        >
          <TouchableOpacity
            style={[
              styles.pillContent,
              pill.taken && styles.taken,
              isDeleteVisible && { borderRadius: 0 },
            ]}
            onPress={handlePillTaken}
            activeOpacity={0.7}
          >
            {pill.taken ? (
              <View>
                <Text style={styles.name}>{pill.name}</Text>
                <Text style={styles.takenText}>
                  Has already been taken today
                </Text>
              </View>
            ) : (
              <View>
                <Text style={styles.name}>{pill.name}</Text>
                <Text style={styles.details}>
                  Next dose: {pill.time}
                </Text>
              </View>
            )}

            <View style={[styles.status, pill.taken && styles.statusTaken]} />
          </TouchableOpacity>
          {isDeleteVisible && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deletePill(pill.id)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  pillContainer: {
    flexDirection: "row",
    width: "100%",
  },
  pillContent: {
    flex: 1,
    backgroundColor: THEME.cardPill,
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  taken: {
    backgroundColor: THEME.accent,
  },
  takenText: {
    fontSize: 14,
    fontWeight: "bold",
    color: THEME.white,
    marginTop: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    color: THEME.white,
  },
  details: {
    fontSize: 14,
    fontWeight: "bold",
    color: THEME.white,
  },
  status: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FFA000",
  },
  statusTaken: {
    backgroundColor: THEME.accent,
  },
  deleteButton: {
    backgroundColor: "#ff4444",
    width: 80,
    justifyContent: "center",
    alignItems: "center",
    borderBottomRightRadius: 15,
    borderTopRightRadius: 15,
  },
  deleteButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 20,
  },
});