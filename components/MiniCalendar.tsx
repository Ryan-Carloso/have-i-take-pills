import React, { useEffect, useState } from "react"
import { View, Text, StyleSheet, Animated, Easing, ActivityIndicator } from "react-native"
import { THEME } from "./Theme"
import { subDays, isSameDay, parseISO, format } from "date-fns"
import { supabase } from "../lib/supabase"
import { getUserId } from "./Analytics/UserID"
import { MaterialCommunityIcons } from "@expo/vector-icons"

interface MiniCalendarProps {
  lastTakenDate?: string
  pillId?: string
  refreshTrigger?: number
  taken?: boolean
}

export default function MiniCalendar({ lastTakenDate, pillId, refreshTrigger = 0, taken = false }: MiniCalendarProps) {
  const today = new Date()
  const [pillHistory, setPillHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [fadeAnim] = useState(new Animated.Value(0))

  // Create array of the last 3 days (today and 2 days before)
  const threeDays = Array.from({ length: 3 }, (_, i) => subDays(today, 2 - i))

  // Fetch pill history from Supabase
  useEffect(() => {
    const fetchPillHistory = async () => {
      try {
        const userId = await getUserId()

        let query = supabase.from("pill_history").select("*").eq("user_id", userId)

        if (pillId) {
          query = query.eq("pill_id", pillId)
        }

        const { data, error } = await query

        if (error) {
          throw error
        }

        setPillHistory(data || [])

        // Fade in animation
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start()
      } catch (error) {
        console.error("Error fetching pill history for MiniCalendar:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPillHistory()
  }, [pillId, refreshTrigger])

  // Check if a pill was taken on a specific date
  const wasPillTakenOnDate = (date) => {
    // For today, use the current pill state directly
    if (isSameDay(date, today)) {
      return taken
    }

    // For other days, use the pill history
    if (pillHistory.length === 0) {
      // Fall back to prop if no history from Supabase yet
      return lastTakenDate && isSameDay(parseISO(lastTakenDate), date)
    }

    return pillHistory.some((record) => {
      const recordDate = parseISO(record.taken_at)
      return isSameDay(recordDate, date)
    })
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={THEME.white} />
      </View>
    )
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {threeDays.map((date, index) => {
        const isToday = isSameDay(date, today)
        const wasTaken = wasPillTakenOnDate(date)
        const dayNum = format(date, "d") // 1-31

        return (
          <View key={`day-${index}`} style={[styles.dayColumn, isToday && styles.todayColumn]}>
            <Text style={[styles.dayOfMonth, isToday && styles.todayText]}>{dayNum}</Text>
            <View style={styles.indicatorContainer}>
              {wasTaken ? (
                <MaterialCommunityIcons name="check-circle" size={14} color={THEME.success} style={styles.checkIcon} />
              ) : (
                <View style={[styles.emptyIndicator, isToday && styles.todayEmptyIndicator]} />
              )}
            </View>
          </View>
        )
      })}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 8,
    padding: 6,
    width: 90,
  },
  loadingContainer: {
    width: 90,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 8,
  },
  dayColumn: {
    alignItems: "center",
    justifyContent: "center",
    width: 24,
    paddingVertical: 4,
    borderRadius: 4,
  },
  todayColumn: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  dayOfMonth: {
    fontSize: 16,
    color: THEME.white,
    fontWeight: "600",
    marginBottom: 2,
  },
  todayText: {
    opacity: 1,
    color: THEME.white,
  },
  indicatorContainer: {
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.white,
    opacity: 0.3,
  },
  todayEmptyIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.5,
  },
  checkIcon: {
    shadowColor: THEME.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
  },
})

