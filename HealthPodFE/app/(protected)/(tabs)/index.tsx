import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView, SafeAreaView, Pressable, Dimensions, RefreshControl } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInRight, FadeInUp } from "react-native-reanimated";
import { colors, radius, shadow, spacing, gradients, typography } from "@/constants/design";
import { useHealth } from "@/context/HealthContext";
import { useRouter } from "expo-router";
import { getMedications, getSchedules, confirmSchedule } from "@/services/api";
import { Medication, ScheduleItem } from "@/types";

const { width } = Dimensions.get("window");

const healthStats = [
  { key: "heart", icon: "heart", label: "Heart Rate", unit: "bpm", color: colors.error, bg: colors.lightRed },
  { key: "steps", icon: "footsteps", label: "Steps", unit: "steps", color: colors.accentOrange, bg: colors.surfaceOrange },
  { key: "sleep", icon: "moon", label: "Sleep", unit: "hours", color: colors.accentPurple, bg: colors.surfacePurple },
  { key: "water", icon: "water", label: "Hydration", unit: "glasses", color: colors.accentBlue, bg: colors.surfaceBlue },
];

const quickActions = [
  { icon: "chatbubbles-outline", label: "AI Chat", color: colors.accentPurple, bg: colors.surfacePurple, route: "/(protected)/chat" },
  { icon: "watch-outline", label: "Devices", color: colors.accentBlue, bg: colors.surfaceBlue, route: "/(protected)/device-selection" },
  { icon: "medical-outline", label: "Meds", color: colors.primary, bg: colors.surfaceTeal, route: "/(protected)/(tabs)/inventory" },
  { icon: "calendar-outline", label: "Schedule", color: colors.accentOrange, bg: colors.surfaceOrange, route: "/(protected)/(tabs)/schedule" },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user, health, streak } = useHealth();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [medsData, schedulesData] = await Promise.all([
        getMedications(),
        getSchedules()
      ]);
      console.log("[Home] Fetched", medsData.length, "medications");
      console.log("[Home] Fetched", schedulesData.length, "schedules");
      setMedications(medsData);
      setSchedules(schedulesData);
    } catch (error) {
      console.error("[Home] Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchData().finally(() => setRefreshing(false));
  }, []);

  // Get next upcoming medication
  const getNextMedication = () => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = days[now.getDay()];
    
    // Filter schedules for today
    const todaysSchedules = schedules.filter(s => 
      !s.days || s.days.length === 0 || s.days.includes(today)
    );

    // Find next unconfirmed schedule for today
    const upcoming = todaysSchedules
      .filter(s => !s.isConfirmed && s.time >= currentTime)
      .sort((a, b) => a.time.localeCompare(b.time))[0];
    
    if (upcoming) {
      const med = medications.find(m => m.id === upcoming.medicationId);
      return { schedule: upcoming, medication: med };
    }
    
    // If no upcoming today left, show first schedule of today (if any)
    if (todaysSchedules.length > 0) {
      todaysSchedules.sort((a, b) => a.time.localeCompare(b.time));
      const first = todaysSchedules[0];
      const med = medications.find(m => m.id === first.medicationId);
      return { schedule: first, medication: med };
    }
    
    return null;
  };

  const handleTakeMedication = async (scheduleId: string) => {
    try {
      await confirmSchedule(scheduleId);
      setSchedules(prev => prev.map(s => 
        s.id === scheduleId ? { ...s, isConfirmed: true } : s
      ));
    } catch (error) {
      console.error("[Home] Error confirming:", error);
    }
  };

  const getStatValue = (key: string) => {
    switch (key) {
      case "heart": return health.heartRate;
      case "steps": return health.steps.toLocaleString();
      case "sleep": return health.sleepHours.toFixed(1);
      case "water": return `${health.hydration}/8`;
      default: return "—";
    }
  };

  const nextMed = getNextMedication();
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <Animated.View 
          entering={FadeInDown.duration(600)} 
          style={styles.header}
        >
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.name}>{user?.name || "Friend"}</Text>
          </View>
          <Pressable 
            style={styles.notificationBtn}
            onPress={() => router.push("/(protected)/notifications")}
          >
            <Ionicons name="notifications-outline" size={24} color={colors.textPrimary} />
            {schedules.filter(s => !s.isConfirmed).length > 0 && (
              <View style={styles.notificationDot} />
            )}
          </Pressable>
        </Animated.View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* Streak Card */}
          <Animated.View 
            entering={FadeInUp.delay(100).duration(600).springify()} 
            style={styles.streakWrapper}
          >
            <LinearGradient
              colors={gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.streakCard}
            >
              <View style={styles.streakLeft}>
                <View style={styles.streakIconBox}>
                  <Ionicons name="flame" size={24} color={colors.warning} />
                </View>
                <View>
                  <Text style={styles.streakTitle}>{streak.currentStreak} Day Streak!</Text>
                  <Text style={styles.streakSub}>
                    {streak.currentStreak > 0 ? "You're on fire!" : "Start your streak today"}
                  </Text>
                </View>
              </View>
              <View style={styles.streakRight}>
                <Text style={styles.streakXP}>{streak.totalXP} XP</Text>
                <Text style={styles.streakLevel}>Lvl {streak.level}</Text>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickGrid}>
              {quickActions.map((action, i) => (
                <Animated.View
                  key={action.label}
                  entering={FadeInRight.delay(200 + i * 50).duration(400)}
                >
                  <Pressable 
                    style={styles.quickCard}
                    onPress={() => action.route && router.push(action.route as any)}
                  >
                    <View style={[styles.quickIcon, { backgroundColor: action.bg }]}>
                      <Ionicons name={action.icon as any} size={24} color={action.color} />
                    </View>
                    <Text style={styles.quickLabel}>{action.label}</Text>
                  </Pressable>
                </Animated.View>
              ))}
            </View>
          </View>

          {/* Today's Health */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Health</Text>
            <View style={styles.statsGrid}>
              {healthStats.map((stat, i) => (
                <Animated.View
                  key={stat.key}
                  entering={FadeInUp.delay(300 + i * 100).duration(500)}
                  style={styles.statCard}
                >
                  <View style={styles.statHeader}>
                    <View style={[styles.statIconBox, { backgroundColor: stat.bg }]}>
                      <Ionicons name={stat.icon as any} size={18} color={stat.color} />
                    </View>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </View>
                  <View style={styles.statContent}>
                    <Text style={styles.statValue}>{getStatValue(stat.key)}</Text>
                    <Text style={styles.statUnit}>{stat.unit}</Text>
                  </View>
                </Animated.View>
              ))}
            </View>
          </View>

          {/* Next Reminder */}
          <Animated.View 
            entering={FadeInUp.delay(500).duration(600)} 
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>Up Next</Text>
            {nextMed?.medication ? (
              <View style={styles.reminderCard}>
                <View style={styles.reminderHeader}>
                  <View style={styles.timeBadge}>
                    <Ionicons name="time-outline" size={16} color={colors.primaryDark} />
                    <Text style={styles.timeText}>{formatTime(nextMed.schedule.time)}</Text>
                  </View>
                  <View style={[
                    styles.statusBadge, 
                    { backgroundColor: nextMed.schedule.isConfirmed ? colors.surfaceAlt : colors.surfaceTeal }
                  ]}>
                    <Text style={[
                      styles.statusText, 
                      { color: nextMed.schedule.isConfirmed ? colors.textMuted : colors.primaryDark }
                    ]}>
                      {nextMed.schedule.isConfirmed ? "Taken" : "Upcoming"}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.reminderContent}>
                  <View style={styles.medIconBox}>
                    <Ionicons name="medical" size={24} color={colors.primary} />
                  </View>
                  <View style={styles.medInfo}>
                    <Text style={styles.medName}>{nextMed.medication.name}</Text>
                    <Text style={styles.medDose}>{nextMed.medication.dosage} • {nextMed.schedule.frequency}</Text>
                  </View>
                  {!nextMed.schedule.isConfirmed && (
                    <Pressable 
                      style={styles.checkBtn}
                      onPress={() => handleTakeMedication(nextMed.schedule.id)}
                    >
                      <Ionicons name="checkmark" size={20} color={colors.lightText} />
                    </Pressable>
                  )}
                </View>
              </View>
            ) : (
              <View style={styles.emptyReminderCard}>
                <Ionicons name="checkmark-circle-outline" size={32} color={colors.success} />
                <Text style={styles.emptyReminderText}>
                  {medications.length > 0 
                    ? "All medications taken for today!" 
                    : "No medications scheduled. Add a device to get started."}
                </Text>
              </View>
            )}
          </Animated.View>

          {/* Today's Medications */}
          {medications.length > 0 && (
            <Animated.View 
              entering={FadeInUp.delay(600).duration(600)} 
              style={styles.section}
            >
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Today's Medications</Text>
                <Pressable onPress={() => router.push("/(protected)/(tabs)/schedule")}>
                  <Text style={styles.seeAllText}>See All</Text>
                </Pressable>
              </View>
              <View style={styles.medsList}>
                {medications
                  .filter(med => {
                    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                    const today = days[new Date().getDay()];
                    return !med.days || med.days.length === 0 || med.days.includes(today);
                  })
                  .slice(0, 3).map((med, i) => {
                  const schedule = schedules.find(s => s.medicationId === med.id);
                  return (
                    <View key={med.id} style={styles.medRow}>
                      <View style={[styles.medRowIcon, { backgroundColor: colors.surfaceTeal }]}>
                        <Ionicons name="medical" size={16} color={colors.primary} />
                      </View>
                      <View style={styles.medRowInfo}>
                        <Text style={styles.medRowName}>{med.name}</Text>
                        <Text style={styles.medRowDetails}>
                          {med.dosage} • {schedule ? formatTime(schedule.time) : med.time || "—"}
                        </Text>
                      </View>
                      {schedule?.isConfirmed && (
                        <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                      )}
                    </View>
                  );
                })}
              </View>
            </Animated.View>
          )}

          {/* Bottom Padding for Tab Bar */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerLeft: {
    gap: 2,
  },
  greeting: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 16,
  },
  name: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadow.sm,
  },
  notificationDot: {
    position: "absolute",
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
    borderWidth: 1.5,
    borderColor: colors.card,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  streakWrapper: {
    marginBottom: spacing.lg,
  },
  streakCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: radius.xl,
    padding: spacing.md,
    ...shadow.glow,
  },
  streakLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  streakIconBox: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  streakTitle: {
    ...typography.h3,
    color: colors.lightText,
    fontSize: 18,
  },
  streakSub: {
    ...typography.small,
    color: colors.lightText,
    opacity: 0.9,
  },
  streakRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  streakXP: {
    ...typography.h3,
    color: colors.lightText,
    fontSize: 20,
  },
  streakLevel: {
    ...typography.caption,
    color: colors.lightText,
    opacity: 0.8,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.sm,
    overflow: "hidden",
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  seeAllText: {
    ...typography.small,
    color: colors.primary,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  quickGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickCard: {
    alignItems: "center",
    gap: spacing.xs,
    width: (width - spacing.lg * 2) / 4,
  },
  quickIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  quickLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  statCard: {
    width: (width - spacing.lg * 2 - spacing.md) / 2,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadow.sm,
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  statIconBox: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  statContent: {
    alignItems: "baseline",
    flexDirection: "row",
    gap: 4,
  },
  statValue: {
    ...typography.h2,
    color: colors.textPrimary,
    fontSize: 24,
  },
  statUnit: {
    ...typography.tiny,
    color: colors.textMuted,
    marginBottom: 4,
  },
  reminderCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadow.sm,
  },
  emptyReminderCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: "center",
    gap: spacing.sm,
  },
  emptyReminderText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
  },
  reminderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  timeText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  statusText: {
    ...typography.tiny,
    fontWeight: "700",
  },
  reminderContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  medIconBox: {
    width: 50,
    height: 50,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceTeal,
    alignItems: "center",
    justifyContent: "center",
  },
  medInfo: {
    flex: 1,
  },
  medName: {
    ...typography.h3,
    fontSize: 16,
    color: colors.textPrimary,
  },
  medDose: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: 2,
  },
  checkBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.success,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.sm,
  },
  medsList: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.xs,
  },
  medRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceAlt,
    gap: spacing.md,
  },
  medRowIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  medRowInfo: {
    flex: 1,
  },
  medRowName: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  medRowDetails: {
    ...typography.small,
    color: colors.textSecondary,
  },
});
