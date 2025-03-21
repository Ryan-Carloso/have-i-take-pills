import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from './Theme';
import { format, subDays, isSameDay, parseISO } from 'date-fns';

interface MiniCalendarProps {
  lastTakenDate?: string;
}

export default function MiniCalendar({ lastTakenDate }: MiniCalendarProps) {
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => subDays(today, 6 - i));

  return (
    <View style={styles.container}>
      {last7Days.map((date) => {
        const isToday = isSameDay(date, today);
        const wasTaken = lastTakenDate && isSameDay(parseISO(lastTakenDate), date);

        return (
          <View key={date.toString()} style={styles.dayContainer}>
            <Text style={[styles.dayText, isToday && styles.todayText]}>
              {format(date, 'E')[0]}
            </Text>
            <View style={[
              styles.indicator,
              wasTaken && styles.taken,
              isToday && styles.today
            ]} />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  dayContainer: {
    alignItems: 'center',
    gap: 4,
  },
  dayText: {
    fontSize: 12,
    color: THEME.white,
    opacity: 0.8,
  },
  todayText: {
    fontWeight: 'bold',
    opacity: 1,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.white,
    opacity: 0.3,
  },
  taken: {
    opacity: 1,
    backgroundColor: THEME.success,
  },
  today: {
    width: 8,
    height: 8,
  },
});