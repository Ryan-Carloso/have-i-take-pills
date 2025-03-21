import React, { useState, useRef } from "react"
import { View, Text, StyleSheet } from "react-native"
import { THEME } from "./Theme"
import { format, subDays, isSameDay, parseISO } from "date-fns"

interface MiniCalendarProps {
  lastTakenDate?: string
}

export default function MiniCalendar({ lastTakenDate }: MiniCalendarProps) {
  const today = new Date()
  const last7Days = Array.from({ length: 7 }, (_, i) => subDays(today, 6 - i))

  return (
    <View style={styles.container}>
      {last7Days.map((date) => {
        const isToday = isSameDay(date, today)
        const wasTaken = lastTakenDate && isSameDay(parseISO(lastTakenDate), date)

        return (
          <View key={date.toString()} style={styles.dayContainer}>
            <Text style={[styles.dayText, isToday && styles.todayText]}>{format(date, "E")[0]}</Text>
            <View style={[styles.indicator, wasTaken && styles.taken, isToday && styles.today]} />
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    paddingBottom: 4,
    paddingHorizontal: 8,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.15)",
  },
  dayContainer: {
    alignItems: "center",
    gap: 6,
  },
  dayText: {
    fontSize: 13,
    color: THEME.white,
    opacity: 0.9,
    fontWeight: "500",
  },
  todayText: {
    fontWeight: "bold",
    opacity: 1,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.white,
    opacity: 0.3,
  },
  taken: {
    opacity: 1,
    backgroundColor: THEME.success,
  },
  today: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: THEME.white,
  },
})

