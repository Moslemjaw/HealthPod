import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View, ScrollView, SafeAreaView, RefreshControl, Modal, TextInput, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp, Layout, SlideInRight } from "react-native-reanimated";
import { colors, radius, shadow, spacing, typography } from "@/constants/design";
import { confirmSchedule, getMedications, getSchedules, addMedication } from "@/services/api";
import { Medication, ScheduleItem } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const REMINDERS_STORAGE_KEY = "@healthpod_reminders";

type Reminder = {
  id: string;
  name: string;
  dosage: string;
  time: string;
  days: string[];
  note?: string;
  isDispenser: false;
};

// Get next 7 days starting from today
const getWeekDays = () => {
  const days = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push({
      date: date,
      dayNum: date.getDate(),
      dayName: DAYS_SHORT[date.getDay()],
      isToday: i === 0,
      fullDate: date.toISOString().split('T')[0],
    });
  }
  return days;
};

export default function ScheduleScreen() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  
  // New reminder form state
  const [newReminder, setNewReminder] = useState({
    name: "",
    dosage: "",
    time: "09:00",
    days: [...DAYS_SHORT],
    note: "",
  });

  const weekDays = useMemo(() => getWeekDays(), []);
  const selectedDayName = DAYS_SHORT[selectedDate.getDay()];
  const isToday = selectedDate.toDateString() === new Date().toDateString();

  // Load reminders from storage
  const loadReminders = async () => {
    try {
      const stored = await AsyncStorage.getItem(REMINDERS_STORAGE_KEY);
      if (stored) {
        setReminders(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load reminders:", e);
    }
  };

  // Save reminders to storage
  const saveReminders = async (newReminders: Reminder[]) => {
    try {
      await AsyncStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(newReminders));
      setReminders(newReminders);
    } catch (e) {
      console.error("Failed to save reminders:", e);
    }
  };

  const fetchData = async () => {
    try {
      setError(null);
      const [scheduleData, medData] = await Promise.all([
        getSchedules(),
        getMedications(),
      ]);
      setSchedules(scheduleData);
      setMedications(medData);
      await loadReminders();
    } catch (err) {
      console.error("Error fetching schedule data:", err);
      setError("Failed to load schedule. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  // Filter schedules for selected day
  const filteredSchedules = useMemo(() => {
    console.log("[Schedule] Filtering for day:", selectedDayName);
    console.log("[Schedule] Total schedules:", schedules.length);
    
    return schedules.filter(schedule => {
      // First check schedule's days array (from backend)
      if (schedule.days && schedule.days.length > 0) {
        const match = schedule.days.includes(selectedDayName);
        console.log(`[Schedule] ${schedule.id} days:`, schedule.days, "match:", match);
        return match;
      }
      
      // Fallback: check medication's days
      const med = medications.find(m => m.id === schedule.medicationId);
      if (med?.days && med.days.length > 0) {
        return med.days.includes(selectedDayName);
      }
      
      return true; // Daily medication (no specific days)
    });
  }, [schedules, medications, selectedDayName]);

  // Filter reminders for selected day
  const filteredReminders = useMemo(() => {
    return reminders.filter(reminder => {
      if (reminder.days && reminder.days.length > 0) {
        return reminder.days.includes(selectedDayName);
      }
      return true;
    });
  }, [reminders, selectedDayName]);

  const allItems = useMemo(() => {
    const dispenserItems = filteredSchedules.map(schedule => {
      const med = medications.find(m => m.id === schedule.medicationId);
      return {
        id: schedule.id,
        name: med?.name || "Unknown",
        dosage: med?.dosage || "",
        time: schedule.time,
        isConfirmed: schedule.isConfirmed,
        isDispenser: true,
        frequency: schedule.frequency,
      };
    });

    const reminderItems = filteredReminders.map(reminder => ({
      id: reminder.id,
      name: reminder.name,
      dosage: reminder.dosage,
      time: reminder.time,
      isConfirmed: false,
      isDispenser: false,
      frequency: reminder.days.length === 7 ? "Daily" : reminder.days.join(", "),
      note: reminder.note,
    }));

    return [...dispenserItems, ...reminderItems].sort((a, b) => a.time.localeCompare(b.time));
  }, [filteredSchedules, filteredReminders, medications]);

  const confirmedCount = useMemo(
    () => allItems.filter((item) => item.isConfirmed).length,
    [allItems]
  );

  const handleConfirm = async (id: string, isDispenser: boolean) => {
    if (isDispenser) {
      try {
        const updated = await confirmSchedule(id);
        setSchedules((prev) => prev.map((item) => (item.id === id ? { ...item, ...updated } : item)));
      } catch (err) {
        console.error("Error confirming schedule:", err);
      }
    } else {
      // For reminders, just mark as done (stored locally for this session)
      // In a real app, you'd want to persist this
      Alert.alert("Reminder Completed", "Great job taking your medication!");
    }
  };

  const toggleDay = (day: string) => {
    if (newReminder.days.includes(day)) {
      setNewReminder(prev => ({ ...prev, days: prev.days.filter(d => d !== day) }));
    } else {
      setNewReminder(prev => ({ ...prev, days: [...prev.days, day] }));
    }
  };

  const handleAddReminder = async () => {
    if (!newReminder.name.trim()) {
      Alert.alert("Required", "Please enter medication name");
      return;
    }
    if (newReminder.days.length === 0) {
      Alert.alert("Required", "Please select at least one day");
      return;
    }

    const reminder: Reminder = {
      id: `reminder-${Date.now()}`,
      name: newReminder.name.trim(),
      dosage: newReminder.dosage.trim() || "As needed",
      time: newReminder.time,
      days: newReminder.days,
      note: newReminder.note.trim(),
      isDispenser: false,
    };

    const newReminders = [...reminders, reminder];
    await saveReminders(newReminders);
    
    setShowAddModal(false);
    setNewReminder({
      name: "",
      dosage: "",
      time: "09:00",
      days: [...DAYS_SHORT],
      note: "",
    });
    
    Alert.alert("Success", "Reminder added successfully!");
  };

  const handleDeleteReminder = (id: string) => {
    Alert.alert(
      "Delete Reminder",
      "Are you sure you want to delete this reminder?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            const newReminders = reminders.filter(r => r.id !== id);
            await saveReminders(newReminders);
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const progressPercent = allItems.length === 0 ? 0 : Math.round((confirmedCount / allItems.length) * 100);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView 
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* Header */}
          <Animated.View entering={FadeInDown.duration(500)}>
            <Text style={styles.title}>Schedule</Text>
            <Text style={styles.subtitle}>
              {isToday ? "Today's medication plan" : `${selectedDayName}, ${selectedDate.toLocaleDateString()}`}
            </Text>
          </Animated.View>

          {/* Calendar Strip */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.calendarStrip}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {weekDays.map((day, index) => {
                const isSelected = day.fullDate === selectedDate.toISOString().split('T')[0];
                return (
                  <Pressable
                    key={day.fullDate}
                    style={[
                      styles.dayCard,
                      isSelected && styles.dayCardSelected,
                      day.isToday && !isSelected && styles.dayCardToday,
                    ]}
                    onPress={() => setSelectedDate(day.date)}
                  >
                    <Text style={[
                      styles.dayName,
                      isSelected && styles.dayNameSelected,
                    ]}>
                      {day.dayName}
                    </Text>
                    <Text style={[
                      styles.dayNum,
                      isSelected && styles.dayNumSelected,
                    ]}>
                      {day.dayNum}
                    </Text>
                    {day.isToday && (
                      <View style={[styles.todayDot, isSelected && styles.todayDotSelected]} />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Animated.View>

          {/* Error Message */}
          {error && (
            <View style={styles.errorCard}>
              <Ionicons name="alert-circle" size={20} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Progress Card */}
          <Animated.View 
            entering={FadeInDown.delay(200).duration(500)} 
            style={styles.progressCard}
          >
            <View style={styles.progressContent}>
              <View>
                <Text style={styles.progressTitle}>
                  {isToday ? "Daily Progress" : `${selectedDayName}'s Schedule`}
                </Text>
                <Text style={styles.progressSubtitle}>
                  {confirmedCount} of {allItems.length} doses {isToday ? "taken" : "scheduled"}
                </Text>
              </View>
              <View style={styles.progressCircle}>
                <Text style={styles.progressPercent}>{progressPercent}%</Text>
              </View>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
            </View>
          </Animated.View>

          {/* Empty State */}
          {allItems.length === 0 && !error && (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={64} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No Medications for {selectedDayName}</Text>
              <Text style={styles.emptyText}>
                Add a reminder or configure your dispenser medications
              </Text>
            </View>
          )}

          {/* Timeline */}
          {allItems.length > 0 && (
            <View style={styles.timelineContainer}>
              <Text style={styles.sectionTitle}>
                {isToday ? "Today" : selectedDayName}'s Medications
              </Text>
              
              {allItems.map((item, index) => {
                const isLast = index === allItems.length - 1;

                return (
                  <Animated.View 
                    key={item.id}
                    entering={SlideInRight.delay(300 + index * 100).duration(400)}
                    layout={Layout.springify()}
                    style={styles.timelineItem}
                  >
                    {/* Timeline Left */}
                    <View style={styles.timelineLeft}>
                      <Text style={styles.timeText}>{item.time}</Text>
                      <View style={styles.timelineLineContainer}>
                        <View style={[
                          styles.timelineDot,
                          item.isConfirmed && styles.timelineDotDone
                        ]} />
                        {!isLast && (
                          <View style={[
                            styles.timelineLine,
                            item.isConfirmed && styles.timelineLineDone
                          ]} />
                        )}
                      </View>
                    </View>

                    {/* Card */}
                    <Pressable 
                      style={[styles.scheduleCard, item.isConfirmed && styles.scheduleCardDone]}
                      onLongPress={() => !item.isDispenser && handleDeleteReminder(item.id)}
                    >
                      <View style={styles.cardMain}>
                        <View style={[
                          styles.medIcon,
                          item.isConfirmed && styles.medIconDone,
                          !item.isDispenser && styles.medIconReminder
                        ]}>
                          <Ionicons 
                            name={item.isConfirmed ? "checkmark" : item.isDispenser ? "medical" : "notifications"} 
                            size={20} 
                            color={item.isConfirmed ? colors.success : item.isDispenser ? colors.primary : colors.accentOrange} 
                          />
                        </View>
                        <View style={styles.medInfo}>
                          <View style={styles.medNameRow}>
                            <Text style={[styles.medName, item.isConfirmed && styles.medNameDone]}>
                              {item.name}
                            </Text>
                            {!item.isDispenser && (
                              <View style={styles.reminderBadge}>
                                <Text style={styles.reminderBadgeText}>Reminder</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.medDose}>
                            {item.dosage} • {item.frequency}
                          </Text>
                          {item.note && (
                            <Text style={styles.medNote}>{item.note}</Text>
                          )}
                        </View>
                      </View>

                      {!item.isConfirmed && isToday && (
                        <Pressable
                          style={[styles.actionBtn, !item.isDispenser && styles.actionBtnReminder]}
                          onPress={() => handleConfirm(item.id, item.isDispenser)}
                        >
                          <Text style={styles.actionText}>
                            {item.isDispenser ? "Take" : "Done"}
                          </Text>
                        </Pressable>
                      )}
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>

      {/* FAB - Add Reminder */}
      <Animated.View 
        entering={FadeInUp.delay(600).duration(400)}
        style={styles.fabContainer}
      >
        <Pressable style={styles.fab} onPress={() => setShowAddModal(true)}>
          <Ionicons name="add" size={28} color={colors.lightText} />
        </Pressable>
      </Animated.View>

      {/* Add Reminder Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setShowAddModal(false)}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </Pressable>
            <Text style={styles.modalTitle}>Add Reminder</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalSubtitle}>
              Add a medication reminder (not linked to dispenser)
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Medication Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Vitamin D"
                value={newReminder.name}
                onChangeText={(text) => setNewReminder(prev => ({ ...prev, name: text }))}
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Dosage</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 1 pill"
                value={newReminder.dosage}
                onChangeText={(text) => setNewReminder(prev => ({ ...prev, dosage: text }))}
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Time</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 09:00"
                value={newReminder.time}
                onChangeText={(text) => setNewReminder(prev => ({ ...prev, time: text }))}
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Days</Text>
              <View style={styles.daysRow}>
                {DAYS_SHORT.map((day) => {
                  const isSelected = newReminder.days.includes(day);
                  return (
                    <Pressable 
                      key={day}
                      style={[styles.dayChip, isSelected && styles.dayChipSelected]}
                      onPress={() => toggleDay(day)}
                    >
                      <Text style={[styles.dayChipText, isSelected && styles.dayChipTextSelected]}>
                        {day}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Note (optional)</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                placeholder="e.g. Take with food"
                value={newReminder.note}
                onChangeText={(text) => setNewReminder(prev => ({ ...prev, note: text }))}
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={2}
              />
            </View>

            <Pressable style={styles.saveBtn} onPress={handleAddReminder}>
              <Text style={styles.saveBtnText}>Add Reminder</Text>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safe: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.xxs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  calendarStrip: {
    marginBottom: spacing.lg,
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  dayCard: {
    width: 52,
    height: 72,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  dayCardSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayCardToday: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  dayName: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  dayNameSelected: {
    color: colors.lightText,
  },
  dayNum: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  dayNumSelected: {
    color: colors.lightText,
  },
  todayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 4,
  },
  todayDotSelected: {
    backgroundColor: colors.lightText,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.lightRed,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
  errorText: {
    ...typography.small,
    color: colors.error,
    flex: 1,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
  },
  progressCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadow.sm,
  },
  progressContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  progressTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  progressSubtitle: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: 2,
  },
  progressCircle: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceTeal,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  progressPercent: {
    ...typography.h3,
    color: colors.primaryDark,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
  timelineContainer: {
    paddingTop: spacing.sm,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: spacing.md,
  },
  timelineLeft: {
    width: 60,
    alignItems: "flex-end",
    paddingRight: spacing.md,
  },
  timeText: {
    ...typography.small,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  timelineLineContainer: {
    alignItems: "center",
    width: 20,
    flex: 1,
    marginRight: -10,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.border,
    marginBottom: 4,
  },
  timelineDotDone: {
    backgroundColor: colors.success,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.borderLight,
  },
  timelineLineDone: {
    backgroundColor: colors.success,
    opacity: 0.3,
  },
  scheduleCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadow.sm,
  },
  scheduleCardDone: {
    backgroundColor: colors.surfaceAlt,
    borderColor: "transparent",
    shadowOpacity: 0,
    elevation: 0,
  },
  cardMain: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  medIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceTeal,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  medIconDone: {
    backgroundColor: colors.surfaceAlt,
  },
  medIconReminder: {
    backgroundColor: colors.surfaceOrange,
  },
  medInfo: {
    flex: 1,
  },
  medNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  medName: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  medNameDone: {
    color: colors.textMuted,
    textDecorationLine: "line-through",
  },
  medDose: {
    ...typography.small,
    color: colors.textSecondary,
  },
  medNote: {
    ...typography.tiny,
    color: colors.textMuted,
    fontStyle: "italic",
    marginTop: 2,
  },
  reminderBadge: {
    backgroundColor: colors.surfaceOrange,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  reminderBadgeText: {
    ...typography.tiny,
    color: colors.accentOrange,
    fontWeight: "600",
  },
  actionBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full,
    marginLeft: spacing.sm,
  },
  actionBtnReminder: {
    backgroundColor: colors.accentOrange,
  },
  actionText: {
    ...typography.caption,
    color: colors.lightText,
    fontWeight: "600",
  },
  fabContainer: {
    position: "absolute",
    right: spacing.lg,
    bottom: 100,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.lg,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  modalContent: {
    padding: spacing.lg,
  },
  modalSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.small,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    padding: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  daysRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  dayChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayChipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  dayChipTextSelected: {
    color: colors.lightText,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: "center",
    marginTop: spacing.lg,
  },
  saveBtnText: {
    ...typography.body,
    color: colors.lightText,
    fontWeight: "700",
  },
});
