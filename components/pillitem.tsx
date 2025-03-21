import React, { useState, useRef } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native"
import {
  GestureHandlerRootView,
  PanGestureHandler,
  type PanGestureHandlerGestureEvent,
} from "react-native-gesture-handler"
import { usePills } from "../contexts/PillContext"
import { THEME } from "./Theme"
import { trackVisit } from "./Analytics/TrackVisit"
import MiniCalendar from "@/components/MiniCalendar"

interface Pill {
  id: string
  name: string
  time: string
  frequency: number
  taken: boolean
  lastTakenDate?: string
  actualTakenTime?: string
}

interface PillItemProps {
  pill: Pill
}

export default function PillItem({ pill }: PillItemProps) {
  const { togglePillTaken, deletePill, updatePill } = usePills()
  const translateX = useRef(new Animated.Value(0)).current
  const [isDeleteVisible, setIsDeleteVisible] = useState(false)
  const [lastTakenTime, setLastTakenTime] = useState<number | null>(null)
  const [canPress, setCanPress] = useState(true)

  // Function to handle pill press
  const handlePress = async () => {
    const currentTime = Date.now()

    // If pill is already taken, allow unchecking it
    if (pill.taken) {
      // Update pill with null lastTakenDate when unchecking
      const updatedPill = {
        ...pill,
        taken: false,
        lastTakenDate: null, // Reset the lastTakenDate when unchecking
      }
      updatePill(updatedPill)
      trackVisit(`Pill unchecked: ${pill.name} at ${new Date().toLocaleString()}`, "DaileUseFlow")
      setCanPress(true)
      setLastTakenTime(null)
      return
    }

    if (lastTakenTime) {
      const timeDifference = currentTime - lastTakenTime
      if (timeDifference < 43200000) {
        alert("You can only take this pill once every 24 hours.")
        return
      }
    }

    // Update the last taken time and store the date
    setLastTakenTime(currentTime)
    setCanPress(false)

    // Update pill with current date and actual taken time
    const currentDateTime = new Date()
    const updatedPill = {
      ...pill,
      taken: true,
      lastTakenDate: currentDateTime.toISOString(),
      actualTakenTime: currentDateTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }

    // Use updatePill instead of togglePillTaken to include the lastTakenDate
    updatePill(updatedPill)
    trackVisit(`Pill taken: ${pill.name} at ${currentDateTime.toLocaleString()}`, "DaileUseFlow")

    setTimeout(() => {
      setCanPress(true)
    }, 43200000)
  }

  const onGestureEvent = Animated.event<PanGestureHandlerGestureEvent>(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const resetPosition = () => {
    setIsDeleteVisible(false);
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      damping: 20,
      stiffness: 200,
    }).start();
  };

  const onHandlerStateChange = (event: PanGestureHandlerGestureEvent) => {
    if (event.nativeEvent.state === 4) { // END state
      const swipeThreshold = -80;
      if (event.nativeEvent.translationX < swipeThreshold) {
        setIsDeleteVisible(true);
        Animated.spring(translateX, {
          toValue: -80,
          useNativeDriver: true,
          damping: 20,
          stiffness: 200,
        }).start();
      } else {
        resetPosition();
      }
    }
  };

  // Add a function to handle delete with animation
  const handleDelete = () => {
    // First animate the item off screen
    Animated.timing(translateX, {
      toValue: -500, // Move far off screen to the left
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // Then call the actual delete function after animation completes
      deletePill(pill.id);
    });
    
    // Track deletion for analytics
    trackVisit(`Pill deleted: ${pill.name}`, "DaileUseFlow");
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <Animated.View
        style={[
          styles.deleteButtonContainer,
          {
            opacity: translateX.interpolate({
              inputRange: [-80, 0],
              outputRange: [1, 0],
            }),
          },
        ]}
      >
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete} // Use the new handleDelete function
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </Animated.View>

      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        activeOffsetX={[-10, 10]}
        failOffsetY={[-20, 20]}
      >
        <Animated.View
          style={[
            styles.pillContainer,
            {
              transform: [{
                translateX: translateX.interpolate({
                  inputRange: [-80, 0],
                  outputRange: [-80, 0],
                  extrapolate: 'clamp'
                })
              }]
            }
          ]}
        >
          <TouchableOpacity
            style={[styles.pillContent, pill.taken && styles.taken, !canPress && !pill.taken && styles.disabledButton]}
            onPress={handlePress}
            disabled={!canPress && !pill.taken}
            activeOpacity={0.8}
          >
            <View style={styles.pillInfo}>
              <View style={styles.contentWrapper}>
                <Text style={styles.name}>{pill.name}</Text>

                {pill.taken ? (
                  <>
                    <Text style={styles.takenText}>Taken today</Text>
                    <Text style={styles.uncheckHint}>Tap to uncheck if marked by mistake</Text>
                  </>
                ) : (
                  <Text style={styles.details}>
                    Every {pill.frequency === 1 ? "day" : `${pill.frequency} days`} at {pill.time}
                  </Text>
                )}

                <MiniCalendar lastTakenDate={pill.lastTakenDate} />
              </View>
            </View>

            <View style={styles.statusContainer}>
              <View style={[styles.status, pill.taken && styles.statusTaken]}>
                {pill.taken && (
                  <View style={styles.checkmark}>
                    <View style={styles.checkmarkLine1} />
                    <View style={styles.checkmarkLine2} />
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
  },
  deleteButtonContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.error,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    zIndex: -1,
  },
  pillContainer: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
  },
  pillContent: {
    backgroundColor: THEME.cardPill,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    borderRadius: 12,
  },
  disabledButton: {
    opacity: 0.8,
  },
  taken: {
    backgroundColor: THEME.accent,
  },
  takenText: {
    fontSize: 15,
    fontWeight: "bold",
    color: THEME.white,
    marginTop: 4,
  },
  uncheckHint: {
    fontSize: 13,
    fontStyle: "italic",
    color: THEME.white,
    marginTop: 2,
    opacity: 0.8,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
    color: THEME.white,
  },
  details: {
    fontSize: 15,
    fontWeight: "500",
    color: THEME.white,
    opacity: 0.9,
  },
  statusContainer: {
    paddingTop: 4,
  },
  status: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  statusTaken: {
    backgroundColor: THEME.success,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  checkmark: {
    width: 12,
    height: 12,
    position: "relative",
  },
  checkmarkLine1: {
    position: "absolute",
    width: 3,
    height: 6,
    backgroundColor: THEME.white,
    left: 0,
    top: 4,
    transform: [{ rotate: "45deg" }],
  },
  checkmarkLine2: {
    position: "absolute",
    width: 3,
    height: 10,
    backgroundColor: THEME.white,
    right: 0,
    top: 0,
    transform: [{ rotate: "-45deg" }],
  },
  deleteButton: {
    width: 80,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonText: {
    color: THEME.white,
    fontWeight: "bold",
    fontSize: 16,
  },
  contentWrapper: {
    flex: 1,
    paddingRight: 8,
  },
  pillInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
  },
})

