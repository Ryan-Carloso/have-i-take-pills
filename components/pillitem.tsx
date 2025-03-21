import React, { useState, useRef } from "react";
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
}

interface PillItemProps {
  pill: Pill;
}

export default function PillItem({ pill }: PillItemProps) {
  const { togglePillTaken, deletePill, updatePill } = usePills();
  const translateX = useRef(new Animated.Value(0)).current;
  const [isDeleteVisible, setIsDeleteVisible] = useState(false);
  const [lastTakenTime, setLastTakenTime] = useState<number | null>(null);
  const [canPress, setCanPress] = useState(true);

  // Function to handle pill press
  const handlePress = async () => {
    const currentTime = Date.now();
    
    // If pill is already taken, allow unchecking it
    if (pill.taken) {
      togglePillTaken(pill.id);
      setCanPress(true);
      setLastTakenTime(null);
      return;
    }
    
    if (lastTakenTime) {
      const timeDifference = currentTime - lastTakenTime;
      if (timeDifference < 43200000) {
        alert("You can only take this pill once every 24 hours.");
        return;
      }
    }

    // Update the last taken time and store the date
    setLastTakenTime(currentTime);
    setCanPress(false);
    
    // Update pill with current date
    const updatedPill = {
      ...pill,
      taken: true,
      lastTakenDate: new Date().toISOString()
    };
    
    // Use updatePill instead of togglePillTaken to include the lastTakenDate
    updatePill(updatedPill);
    console.log(new Date().toString());

    setTimeout(() => {
      setCanPress(true);
    }, 43200000);
  };

  const onGestureEvent = Animated.event<PanGestureHandlerGestureEvent>(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: PanGestureHandlerGestureEvent) => {
    if (event.nativeEvent.oldState === 4) {
      console.log("Gesture ended", event.nativeEvent.translationX);
      if (event.nativeEvent.translationX < -50) {
        // If swiped more than 50 pixels to the left, show delete button
        setIsDeleteVisible(true);
        Animated.timing(translateX, {
          toValue: -10,
          duration: 200,
          useNativeDriver: true,
        }).start();
      } else {
        // Otherwise, reset position and hide delete button
        setIsDeleteVisible(false);
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
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
              !canPress && !pill.taken && styles.disabledButton // Only apply disabled style if not taken
            ]}
            onPress={handlePress} // Use the handlePress function
            disabled={!canPress && !pill.taken} // Only disable if not taken and can't press
          >
            {pill.taken ? (
              <View>
                <Text style={styles.name}>{pill.name}</Text>
                <Text style={styles.takenText}>
                  Has already been taken today
                </Text>
                <Text style={styles.uncheckHint}>
                  (Tap to uncheck if marked by mistake)
                </Text>
              </View>
            ) : (
              <View>
                <Text style={styles.name}>{pill.name}</Text>
                <Text style={styles.details}>
                  Every {pill.frequency} at {pill.time}
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
  disabledButton: {
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
  uncheckHint: {
    fontSize: 12,
    fontStyle: 'italic',
    color: THEME.white,
    marginTop: 2,
    opacity: 0.8,
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
    backgroundColor: "#fff",
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
