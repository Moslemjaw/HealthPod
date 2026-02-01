import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView, SafeAreaView, Pressable, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInRight, FadeInUp } from "react-native-reanimated";
import { colors, radius, shadow, spacing, gradients, typography } from "@/constants/design";
import { useHealth } from "@/context/HealthContext";
import { useRouter } from "expo-router";
import { routes } from "@/constants/routes";
import { getMedications, getSchedules } from "@/services/api";
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
  const [nextMed, setNextMed] = useState<{ med: Medication; schedule: ScheduleItem } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [medsData, scheduleData] = await Promise.all([
          getMedications(),
          getSchedules(),
        ]);
        setMedications(medsData);
        setSchedules(scheduleData);
        
        // Find next upcoming medication
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        const upcoming = scheduleData
          .filter(s => !s.isConfirmed && s.time >= currentTime)
          .sort((a, b) => a.time.localeCompare(b.time))[0];
        
        if (upcoming) {
          const med = medsData.find(m => m.id === upcoming.medicationId);
          if (med) {
            setNextMed({ med, schedule: upcoming });
          }
        } else {
          // If no upcoming today, get first unconfirmed one
          const firstUnconfirmed = scheduleData
            .filter(s => !s.isConfirmed)
            .sort((a, b) => a.time.localeCompare(b.time))[0];
          if (firstUnconfirmed) {
            const med = medsData.find(m => m.id === firstUnconfirmed.medicationId);
            if (med) {
              setNextMed({ med, schedule: firstUnconfirmed });
            }
          }
        }
      } catch (error) {
        console.error("Error fetching home data:", error);
      }
    };
    
    fetchData();
  }, []);

  const getStatValue = (key: string) => {
    switch (key) {
      case "heart": return health.heartRate;
      case "steps": return health.steps.toLocaleString();
      case "sleep": return health.sleepHours.toFixed(1);
      case "water": return `${health.hydration}/8`;
      default: return "—";
    }
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
            <View style={styles.notificationDot} />
          </Pressable>
        </Animated.View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
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
          {nextMed && (
            <Animated.View 
              entering={FadeInUp.delay(500).duration(600)} 
              style={styles.section}
            >
              <Text style={styles.sectionTitle}>Up Next</Text>
              <View style={styles.reminderCard}>
                <View style={styles.reminderHeader}>
                  <View style={styles.timeBadge}>
                    <Ionicons name="time-outline" size={16} color={colors.primaryDark} />
                    <Text style={styles.timeText}>{nextMed.schedule.time}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: colors.surfaceTeal }]}>
                    <Text style={[styles.statusText, { color: colors.primaryDark }]}>Upcoming</Text>
                  </View>
                </View>
                
                <View style={styles.reminderContent}>
                  <View style={styles.medIconBox}>
                    <Ionicons name="medical" size={24} color={colors.primary} />
                  </View>
                  <View style={styles.medInfo}>
                    <Text style={styles.medName}>{nextMed.med.name}</Text>
                    <Text style={styles.medDose}>{nextMed.med.dosage} • Take with food</Text>
                  </View>
                  <Pressable style={styles.checkBtn}>
                    <Ionicons name="checkmark" size={20} color={colors.lightText} />
                  </Pressable>
                </View>
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
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
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
});
