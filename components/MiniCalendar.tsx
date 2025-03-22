import React from "react"
import { View, Text, StyleSheet } from "react-native"
import { THEME } from "./Theme"
import { subDays, isSameDay, parseISO } from "date-fns"

interface MiniCalendarProps {
  lastTakenDate?: string
}

export default function MiniCalendar({ lastTakenDate }: MiniCalendarProps) {
  const today = new Date()
  
  // Create array of the last 3 days (today and 2 days before)
  const threeDays = Array.from({ length: 3 }, (_, i) => subDays(today, 2 - i))

  // Day labels - show only the last 3 days
  const dayLabels = threeDays.map(date => {
    const day = date.getDay()
    return ["S", "M", "T", "W", "T", "F", "S"][day]
  })

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
          const wasTaken = lastTakenDate && isSameDay(parseISO(lastTakenDate), date)

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

