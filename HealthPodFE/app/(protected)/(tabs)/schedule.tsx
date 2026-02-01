import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View, ScrollView, SafeAreaView, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import Animated, { FadeInDown, FadeInUp, Layout, SlideInRight } from "react-native-reanimated";
import { colors, radius, shadow, spacing, typography } from "@/constants/design";
import { confirmSchedule, getMedications, getSchedules } from "@/services/api";
import { Medication, ScheduleItem } from "@/types";

export default function ScheduleScreen() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setError(null);
      console.log("[Schedule Screen] Starting fetch...");
      const [scheduleData, medData] = await Promise.all([
        getSchedules(),
        getMedications(),
      ]);
      console.log("[Schedule Screen] Fetched schedules:", scheduleData);
      console.log("[Schedule Screen] Fetched medications:", medData);
      console.log("[Schedule Screen] Schedule count:", scheduleData.length);
      console.log("[Schedule Screen] Medication count:", medData.length);
      
      setSchedules(scheduleData);
      setMedications(medData);
    } catch (err) {
      console.error("[Schedule Screen] Error fetching schedule data:", err);
      setError(`Failed to load schedule: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const confirmedCount = useMemo(
    () => schedules.filter((item) => item.isConfirmed).length,
    [schedules]
  );

  const handleConfirm = async (id: string) => {
    try {
      const updated = await confirmSchedule(id);
      setSchedules((prev) => prev.map((item) => (item.id === id ? { ...item, ...updated } : item)));
    } catch (err) {
      console.error("Error confirming schedule:", err);
    }
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

  const progressPercent = schedules.length === 0 ? 0 : Math.round((confirmedCount / schedules.length) * 100);

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
            <Text style={styles.subtitle}>Today's medication plan</Text>
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
            entering={FadeInDown.delay(100).duration(500)} 
            style={styles.progressCard}
          >
            <View style={styles.progressContent}>
              <View>
                <Text style={styles.progressTitle}>Daily Progress</Text>
                <Text style={styles.progressSubtitle}>
                  {confirmedCount} of {schedules.length} doses taken
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
          {schedules.length === 0 && !error && (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={64} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No Medications Scheduled</Text>
              <Text style={styles.emptyText}>
                Add medications to your device to see them here
              </Text>
            </View>
          )}

          {/* Timeline */}
          {schedules.length > 0 && (
            <View style={styles.timelineContainer}>
              {schedules.map((item, index) => {
                const med = medications.find((m) => m.id === item.medicationId);
                const isConfirmed = item.isConfirmed;
                const isLast = index === schedules.length - 1;

                if (!med) {
                  console.warn("[Schedule Screen] Medication not found for schedule item:", item);
                  return null;
                }

                return (
                  <Animated.View 
                    key={item.id}
                    entering={SlideInRight.delay(200 + index * 100).duration(400)}
                    layout={Layout.springify()}
                    style={styles.timelineItem}
                  >
                    {/* Timeline Left */}
                    <View style={styles.timelineLeft}>
                      <Text style={styles.timeText}>{item.time}</Text>
                      <View style={styles.timelineLineContainer}>
                        <View style={[
                          styles.timelineDot,
                          isConfirmed && styles.timelineDotDone
                        ]} />
                        {!isLast && (
                          <View style={[
                            styles.timelineLine,
                            isConfirmed && styles.timelineLineDone
                          ]} />
                        )}
                      </View>
                    </View>

                    {/* Card */}
                    <View style={[styles.scheduleCard, isConfirmed && styles.scheduleCardDone]}>
                      <View style={styles.cardMain}>
                        <View style={[
                          styles.medIcon,
                          isConfirmed && styles.medIconDone
                        ]}>
                          <Ionicons 
                            name={isConfirmed ? "checkmark" : "medical"} 
                            size={20} 
                            color={isConfirmed ? colors.success : colors.primary} 
                          />
                        </View>
                        <View style={styles.medInfo}>
                          <Text style={[styles.medName, isConfirmed && styles.medNameDone]}>
                            {med.name}
                          </Text>
                          <Text style={styles.medDose}>
                            {med.dosage} • {item.frequency}
                          </Text>
                        </View>
                      </View>

                      {!isConfirmed && (
                        <Pressable
                          style={styles.actionBtn}
                          onPress={() => handleConfirm(item.id)}
                        >
                          <Text style={styles.actionText}>Take</Text>
                        </Pressable>
                      )}
                    </View>
                  </Animated.View>
                );
              })}
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>

      {/* FAB */}
      <Animated.View 
        entering={FadeInUp.delay(600).duration(400)}
        style={styles.fabContainer}
      >
        <Pressable style={styles.fab}>
          <Ionicons name="add" size={28} color={colors.lightText} />
        </Pressable>
      </Animated.View>
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
    marginBottom: spacing.lg,
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
    marginRight: -10, // Align with dot center
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
  medInfo: {
    flex: 1,
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
  actionBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full,
    marginLeft: spacing.sm,
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
});
