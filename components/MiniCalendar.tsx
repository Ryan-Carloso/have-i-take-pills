import React, { useEffect, useState } from "react"
import { View, Text, StyleSheet, ActivityIndicator } from "react-native"
import { THEME } from "./Theme"
import { subDays, isSameDay, parseISO } from "date-fns"
import { supabase } from "../lib/supabase"
import { getUserId } from "./Analytics/UserID"

interface MiniCalendarProps {
  lastTakenDate?: string
  pillId?: string // Optional pill ID to filter history
  refreshTrigger?: number // Add this prop to force refresh
  taken?: boolean // Add this to directly know the pill's current state
}

export default function MiniCalendar({ lastTakenDate, pillId, refreshTrigger = 0, taken = false }: MiniCalendarProps) {
  const today = new Date()
  const [pillHistory, setPillHistory] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Create array of the last 3 days (today and 2 days before)
  const threeDays = Array.from({ length: 3 }, (_, i) => subDays(today, 2 - i))

  // Fetch pill history from Supabase
  useEffect(() => {
    const fetchPillHistory = async () => {
      try {
        setLoading(true)
        const userId = await getUserId()
        
        let query = supabase
          .from('pill_history')
          .select('*')
          .eq('user_id', userId)
        
        // If pillId is provided, filter by that specific pill
        if (pillId) {
          query = query.eq('pill_id', pillId)
        }
        
        const { data, error } = await query
        
        if (error) {
          throw error
        }
        
        setPillHistory(data || [])
      } catch (error) {
        console.error('Error fetching pill history for MiniCalendar:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchPillHistory()
  }, [pillId, refreshTrigger]) // Add refreshTrigger to dependencies
  
  // Check if a pill was taken on a specific date
  const wasPillTakenOnDate = (date) => {
    // For today, use the current pill state directly
    if (isSameDay(date, today)) {
      return taken;
    }
    
    // For other days, use the pill history
    if (pillHistory.length === 0) {
      // Fall back to prop if no history from Supabase yet
      return lastTakenDate && isSameDay(parseISO(lastTakenDate), date)
    }
    
    return pillHistory.some(record => {
      const recordDate = parseISO(record.taken_at)
      return isSameDay(recordDate, date)
    })
  }

  // Day labels - show only the last 3 days
  const dayLabels = threeDays.map(date => {
    const day = date.getDay()
    return ["S", "M", "T", "W", "T", "F", "S"][day]
  })

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color={THEME.white} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.daysRow}>
        {dayLabels.map((day, index) => (
          <Text
            key={`label-${index}`}
            style={[styles.dayLabel, isSameDay(threeDays[index], today) && styles.todayLabel]}
          >
            {day}
          </Text>
        ))}
      </View>

      {/* Day indicators */}
      <View style={styles.dotsRow}>
        {threeDays.map((date, index) => {
          const isToday = isSameDay(date, today)
          const wasTaken = wasPillTakenOnDate(date)

          return (
            <View key={`dot-${index}`} style={[styles.dotContainer, isToday && styles.todayContainer]}>
              <View style={[styles.dot, wasTaken && styles.takenDot, isToday && styles.todayDot]} />
            </View>
          )
        })}
      </View>
    </View>
  )
}

// Keep your existing styles
const styles = StyleSheet.create({
  container: {
    width: 70, // Increased width for bigger calendar
    paddingVertical: 4, // More vertical padding
  },
  daysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4, // Increased spacing
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayLabel: {
    fontSize: 14, // Larger font size
    color: THEME.white,
    opacity: 0.7,
    width: 16, // Wider to accommodate larger text
    textAlign: "center",
  },
  todayLabel: {
    opacity: 1,
    fontWeight: "600",
  },
  dotContainer: {
    width: 16, // Larger container
    height: 16, // Larger container
    justifyContent: "center",
    alignItems: "center",
  },
  todayContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8, // Larger radius
  },
  dot: {
    width: 6, // Larger dot
    height: 6, // Larger dot
    borderRadius: 3,
    backgroundColor: THEME.white,
    opacity: 0.3,
  },
  takenDot: {
    opacity: 1,
    backgroundColor: THEME.success,
    width: 10, // Larger taken dot
    height: 10, // Larger taken dot
    borderRadius: 5,
  },
  todayDot: {
    width: 8, // Larger today dot
    height: 8, // Larger today dot
    borderRadius: 4,
  },
})

