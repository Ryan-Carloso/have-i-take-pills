import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { usePills } from '../../contexts/PillContext';
import { THEME } from '../../components/Theme';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, parseISO } from 'date-fns';

export default function Calendar() {
  const { pills } = usePills();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Get days in current month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Navigate to previous month
  const prevMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };
  
  // Navigate to next month
  const nextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };
  
  // Check if pills were taken on a specific date
  const getPillsTakenOnDate = (date) => {
    return pills.filter(pill => {
      if (pill.lastTakenDate) {
        const pillDate = parseISO(pill.lastTakenDate);
        return isSameDay(pillDate, date);
      }
      return false;
    });
  };
  
  // Get pills for selected date
  const pillsForSelectedDate = getPillsTakenOnDate(selectedDate);
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Medication History</Text>
      </View>
      
      <View style={styles.calendarHeader}>
        <TouchableOpacity onPress={prevMonth}>
          <Text style={styles.navButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.monthText}>{format(currentMonth, 'MMMM yyyy')}</Text>
        <TouchableOpacity onPress={nextMonth}>
          <Text style={styles.navButton}>→</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.weekdayLabels}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <Text key={day} style={styles.weekdayText}>{day}</Text>
        ))}
      </View>
      
      <View style={styles.daysContainer}>
        {daysInMonth.map((date) => {
          const pillsTaken = getPillsTakenOnDate(date);
          const isSelected = isSameDay(date, selectedDate);
          const dayIsToday = isToday(date);
          
          return (
            <TouchableOpacity
              key={date.toString()}
              style={[
                styles.dayCell,
                isSelected && styles.selectedDay,
                dayIsToday && styles.today
              ]}
              onPress={() => setSelectedDate(date)}
            >
              <Text style={[
                styles.dayText,
                isSelected && styles.selectedDayText,
                dayIsToday && styles.todayText
              ]}>
                {format(date, 'd')}
              </Text>
              {pillsTaken.length > 0 && (
                <View style={[
                  styles.pillIndicator,
                  pillsTaken.length === pills.length ? styles.allPillsTaken : styles.somePillsTaken
                ]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      
      <View style={styles.selectedDateInfo}>
        <Text style={styles.selectedDateText}>
          {format(selectedDate, 'MMMM d, yyyy')}
        </Text>
        {pillsForSelectedDate.length > 0 ? (
          <View style={styles.pillsList}>
            <Text style={styles.pillsHeader}>Pills taken:</Text>
            {pillsForSelectedDate.map(pill => (
              <View key={pill.id} style={styles.pillItem}>
                <View style={styles.pillDot} />
                <Text style={styles.pillName}>{pill.name}</Text>
                <Text style={styles.pillTime}>
                  taken at {pill.actualTakenTime || pill.time}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noPillsText}>No medications taken on this day</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME.primary,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  navButton: {
    fontSize: 24,
    color: THEME.primary,
    padding: 5,
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.text,
  },
  weekdayLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  weekdayText: {
    width: 40,
    textAlign: 'center',
    fontWeight: '500',
    color: THEME.textSecondary,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dayCell: {
    width: '14.28%',
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    position: 'relative',
  },
  dayText: {
    fontSize: 16,
    color: THEME.text,
  },
  selectedDay: {
    backgroundColor: THEME.primary,
    borderRadius: 20,
  },
  selectedDayText: {
    color: THEME.white,
    fontWeight: 'bold',
  },
  today: {
    borderWidth: 1,
    borderColor: THEME.accent,
    borderRadius: 20,
  },
  todayText: {
    fontWeight: 'bold',
  },
  pillIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    bottom: 5,
  },
  allPillsTaken: {
    backgroundColor: THEME.success,
  },
  somePillsTaken: {
    backgroundColor: THEME.accent,
  },
  selectedDateInfo: {
    marginTop: 20,
    padding: 15,
    backgroundColor: THEME.cardPill,
    borderRadius: 10,
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.white,
    marginBottom: 10,
  },
  pillsList: {
    marginTop: 5,
  },
  pillsHeader: {
    fontSize: 16,
    fontWeight: '500',
    color: THEME.white,
    marginBottom: 8,
  },
  pillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pillDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: THEME.white,
    marginRight: 8,
  },
  pillName: {
    fontSize: 16,
    color: THEME.white,
    fontWeight: '500',
    flex: 1,
  },
  pillTime: {
    fontSize: 14,
    color: THEME.white,
    opacity: 0.8,
  },
  noPillsText: {
    fontSize: 16,
    color: THEME.white,
    fontStyle: 'italic',
  },
});