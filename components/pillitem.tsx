import React, { useRef } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native"
import {
  GestureHandlerRootView,
  PanGestureHandler,
  type PanGestureHandlerGestureEvent,
} from "react-native-gesture-handler"
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons"
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

  // Function to handle pill press
  const handlePress = async () => {
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
      return
    }

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
  }

  const onGestureEvent = Animated.event<PanGestureHandlerGestureEvent>(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true },
  )

  const resetPosition = () => {
    translateX.setValue(0)
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      damping: 20,
      stiffness: 200,
    }).start()
  }

  const onHandlerStateChange = (event: PanGestureHandlerGestureEvent) => {
    if (event.nativeEvent.state === 4) {
      // END state
      const swipeThreshold = -80
      if (event.nativeEvent.translationX < swipeThreshold) {
        Animated.spring(translateX, {
          toValue: -100,
          useNativeDriver: true,
          damping: 20,
          stiffness: 200,
        }).start()
      } else {
        resetPosition()
      }
    }
  }

  // Add a function to handle delete with animation
  const handleDelete = () => {
    // First animate the item off screen
    Animated.timing(translateX, {
      toValue: -500, // Move far off screen to the left
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // Then call the actual delete function after animation completes
      deletePill(pill.id)
    })

    // Track deletion for analytics
    trackVisit(`Pill deleted: ${pill.name}`, "DaileUseFlow")
  }

  // Format frequency text
  const getFrequencyText = () => {
    return `Every days`
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <Animated.View
        style={[
          styles.deleteButtonContainer,
          {
            opacity: translateX.interpolate({
              inputRange: [-100, 0],
              outputRange: [1, 0],
            }),
          },
        ]}
      >
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} activeOpacity={0.7}>
          <MaterialIcons name="delete" size={24} color={THEME.white} />
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
              transform: [
                {
                  translateX: translateX.interpolate({
                    inputRange: [-100, 0],
                    outputRange: [-100, 0],
                    extrapolate: "clamp",
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.pillContent, pill.taken && styles.taken]}
            onPress={handlePress}
            activeOpacity={0.7}
          >
            {/* Status indicator */}
            <View style={[styles.statusIndicator, pill.taken && styles.statusIndicatorTaken]}>
              {pill.taken ? (
                <MaterialIcons name="check" size={18} color={THEME.white} />
              ) : (
                <MaterialCommunityIcons name="pill" size={18} color={THEME.white} />
              )}
            </View>

            {/* Pill information */}
            <View style={styles.pillInfo}>
              <Text style={[styles.name, pill.taken && styles.nameTaken]}>{pill.name}</Text>

              {pill.taken ? (
                <View style={styles.takenInfoContainer}>
                  <Text style={styles.takenText}>Taken today</Text>
                  {pill.actualTakenTime && <Text style={styles.takenTimeText}>at {pill.actualTakenTime}</Text>}
                </View>
              ) : (
                <View style={styles.scheduleContainer}>
                  <MaterialIcons name="schedule" size={14} color={THEME.white} style={styles.scheduleIcon} />
                  <Text style={styles.scheduleText}>
                    EveryDay At • {pill.time}
                  </Text>
                </View>
              )}
            </View>

            {/* Mini calendar */}
            <View style={styles.calendarContainer}>
              <MiniCalendar lastTakenDate={pill.lastTakenDate} />
            </View>
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
  },
  deleteButtonContainer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 100,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: THEME.error,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    zIndex: -1,
  },
  pillContainer: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  pillContent: {
    backgroundColor: THEME.cardPill,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
  },
  taken: {
    backgroundColor: THEME.accent,
  },
  statusIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  statusIndicatorTaken: {
    backgroundColor: THEME.success,
  },
  pillInfo: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: THEME.white,
    marginBottom: 4,
  },
  nameTaken: {
    opacity: 0.9,
  },
  scheduleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  scheduleIcon: {
    marginRight: 4,
    opacity: 0.8,
  },
  scheduleText: {
    fontSize: 14,
    color: THEME.white,
    opacity: 0.8,
  },
  takenInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  takenText: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.white,
    marginRight: 4,
  },
  takenTimeText: {
    fontSize: 14,
    color: THEME.white,
    opacity: 0.8,
  },
  calendarContainer: {
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    width: 100,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
})

