import React from "react";
import { StyleSheet, Text, View, ScrollView, SafeAreaView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, shadow, spacing } from "@/constants/design";
import { useHealth } from "@/context/HealthContext";

export default function HomeScreen() {
  const { user, health, medications } = useHealth();

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#1A1F3A", "#1A1F3A"]} style={styles.header}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>Good morning,</Text>
              <Text style={styles.name}>{user?.name || "Apple User"} 👋</Text>
            </View>
            <View style={styles.bell}>
              <Ionicons name="notifications-outline" size={22} color={colors.lightText} />
              <View style={styles.dot} />
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <LinearGradient colors={["#00B894", "#00D4AA"]} style={styles.streakCard}>
          <View style={styles.streakIcon}>
            <Ionicons name="flame" size={20} color={colors.warning} />
          </View>
          <View style={styles.streakContent}>
            <Text style={styles.streakTitle}>6 Day Streak!</Text>
            <Text style={styles.streakSub}>Keep it up! You&apos;re doing great.</Text>
            <View style={styles.streakBar}>
              <View style={styles.streakFill} />
            </View>
            <Text style={styles.streakMeta}>245 / 300 XP to Level 4</Text>
          </View>
        </LinearGradient>

        <View style={styles.quickRow}>
          <View style={styles.quickCard}>
            <Text style={styles.quickIcon}>💬</Text>
            <Text style={styles.quickText}>AI Chat</Text>
          </View>
          <View style={styles.quickCard}>
            <Text style={styles.quickIcon}>⌚</Text>
            <Text style={styles.quickText}>Devices</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Today&apos;s Health</Text>
        <View style={styles.statGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIcon}>❤️</Text>
            </View>
            <Text style={styles.statLabel}>Heart Rate</Text>
            <Text style={styles.statValue}>{health.heartRate}</Text>
            <Text style={styles.statUnit}>bpm</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIcon}>👣</Text>
            </View>
            <Text style={styles.statLabel}>Steps</Text>
            <Text style={styles.statValue}>{health.steps.toLocaleString()}</Text>
            <Text style={styles.statUnit}>/ 10,000</Text>
          </View>
        </View>
        <View style={styles.statGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIcon}>🌙</Text>
            </View>
            <Text style={styles.statLabel}>Sleep</Text>
            <Text style={styles.statValue}>{health.sleepHours.toFixed(1)}</Text>
            <Text style={styles.statUnit}>hours</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIcon}>💧</Text>
            </View>
            <Text style={styles.statLabel}>Hydration</Text>
            <Text style={styles.statValue}>{health.hydration}</Text>
            <Text style={styles.statUnit}>/ 8 glasses</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Next Reminder</Text>
        <View style={styles.reminderCard}>
          <View style={styles.reminderIcon}>
            <Text style={styles.reminderIconText}>⏰</Text>
          </View>
          <View style={styles.reminderInfo}>
            <Text style={styles.reminderTime}>8:00 AM</Text>
            <Text style={styles.reminderMed}>
              {medications[0]?.name || "Metformin"} {medications[0]?.dosage || "500mg"}
            </Text>
          </View>
          <View style={styles.reminderPill}>
            <Text style={styles.reminderPillText}>In 2 hours</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 0,
    paddingBottom: spacing.lg,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  greeting: {
    color: "#CBD5E1",
    fontSize: 14,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.lightText,
    marginTop: 2,
  },
  bell: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  dot: {
    position: "absolute",
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  streakCard: {
    flexDirection: "row",
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
    marginBottom: spacing.lg,
    alignItems: "center",
  },
  streakIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  streakContent: {
    flex: 1,
  },
  streakTitle: {
    color: colors.lightText,
    fontWeight: "700",
    fontSize: 16,
  },
  streakSub: {
    color: colors.lightText,
    opacity: 0.9,
    marginTop: 2,
    fontSize: 13,
  },
  streakBar: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 999,
    marginTop: spacing.sm,
  },
  streakFill: {
    width: "82%",
    height: "100%",
    borderRadius: 999,
    backgroundColor: colors.warning,
  },
  streakMeta: {
    color: colors.lightText,
    opacity: 0.9,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  quickRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  quickCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: "center",
    ...shadow.sm,
  },
  quickIcon: {
    fontSize: 24,
  },
  quickText: {
    marginTop: spacing.xs,
    fontWeight: "600",
    color: colors.textPrimary,
    fontSize: 14,
  },
  statIconContainer: {
    marginBottom: spacing.xs,
  },
  statIcon: {
    fontSize: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  statGrid: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow.sm,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: spacing.xs,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  statUnit: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  reminderCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.lightGreen,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow.sm,
  },
  reminderIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.success,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTime: {
    fontWeight: "700",
    color: colors.textPrimary,
    fontSize: 16,
  },
  reminderMed: {
    color: colors.textSecondary,
    marginTop: 2,
    fontSize: 14,
  },
  reminderIconText: {
    fontSize: 18,
  },
  reminderPill: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
  },
  reminderPillText: {
    color: colors.lightText,
    fontWeight: "600",
    fontSize: 11,
  },
});
