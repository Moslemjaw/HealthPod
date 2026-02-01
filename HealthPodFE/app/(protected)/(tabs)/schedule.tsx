import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View, ScrollView, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, shadow, spacing } from "@/constants/design";
import { confirmSchedule, getMedications, getSchedules } from "@/services/api";
import { Medication, ScheduleItem } from "@/types";

export default function ScheduleScreen() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSchedules(), getMedications()])
      .then(([scheduleData, medData]) => {
        setSchedules(scheduleData);
        setMedications(medData);
      })
      .finally(() => setLoading(false));
  }, []);

  const confirmedCount = useMemo(
    () => schedules.filter((item) => item.isConfirmed).length,
    [schedules]
  );

  const handleConfirm = async (id: string) => {
    const updated = await confirmSchedule(id);
    setSchedules((prev) => prev.map((item) => (item.id === id ? updated : item)));
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safe}>
          <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        </SafeAreaView>
      </View>
    );
  }

  const progressPercent = schedules.length === 0 ? 0 : Math.round((confirmedCount / schedules.length) * 100);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Schedule</Text>
          <Text style={styles.subtitle}>Today&apos;s medication reminders</Text>

          <View style={styles.progressCard}>
            <View>
              <Text style={styles.progressTitle}>Today&apos;s Progress</Text>
              <Text style={styles.progressMeta}>
                {confirmedCount} of {schedules.length} doses taken
              </Text>
            </View>
            <View style={styles.progressCircleContainer}>
              <View style={styles.progressCircleOuter}>
                <View
                  style={[
                    styles.progressCircleMask,
                    {
                      transform: [
                        { rotate: `${(progressPercent / 100) * 360 - 90}deg` },
                      ],
                      borderTopColor: progressPercent > 0 ? colors.primary : "transparent",
                      borderRightColor: progressPercent > 25 ? colors.primary : "transparent",
                      borderBottomColor: progressPercent > 50 ? colors.primary : "transparent",
                      borderLeftColor: progressPercent > 75 ? colors.primary : "transparent",
                    },
                  ]}
                />
                <View style={styles.progressCircleInner}>
                  <Text style={styles.progressPercent}>{progressPercent}%</Text>
                </View>
              </View>
            </View>
          </View>

          {schedules.map((item) => {
            const med = medications.find((m) => m.id === item.medicationId);
            const isConfirmed = item.isConfirmed;
            return (
              <View key={item.id} style={styles.card}>
                <View style={styles.timeRow}>
                  <Text style={styles.timeText}>{item.time}</Text>
                  <Text style={styles.timeMeta}>{item.frequency}</Text>
                </View>
                <View style={styles.medRow}>
                  <View style={styles.medIcon}>
                    {isConfirmed ? (
                      <Ionicons name="checkmark" size={18} color={colors.success} />
                    ) : (
                      <Text style={styles.medIconText}>*</Text>
                    )}
                  </View>
                  <View style={styles.medInfo}>
                    <Text style={styles.medName}>{med?.name || "Medication"}</Text>
                    <Text style={styles.medDose}>{med?.dosage || "-"}</Text>
                  </View>
                </View>

                <Pressable
                  style={[styles.actionBtn, isConfirmed && styles.actionDone]}
                  onPress={() => !isConfirmed && handleConfirm(item.id)}
                  disabled={isConfirmed}
                >
                  <Ionicons
                    name={isConfirmed ? "checkmark-circle" : "checkmark"}
                    size={18}
                    color={isConfirmed ? colors.success : colors.lightText}
                  />
                  <Text style={[styles.actionText, isConfirmed && styles.actionTextDone]}>
                    {isConfirmed ? "Completed" : "Take Now"}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </ScrollView>
      </SafeAreaView>

      <Pressable style={styles.fab}>
        <Ionicons name="add" size={26} color={colors.lightText} />
      </Pressable>
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
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    fontSize: 14,
  },
  progressCard: {
    backgroundColor: colors.lightGreen,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  progressTitle: {
    fontWeight: "700",
    color: colors.textPrimary,
    fontSize: 16,
  },
  progressMeta: {
    color: colors.textSecondary,
    marginTop: 4,
    fontSize: 13,
  },
  progressCircleContainer: {
    width: 64,
    height: 64,
  },
  progressCircleOuter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: "#E0F2F1",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.lightText,
    position: "relative",
    overflow: "hidden",
  },
  progressCircleMask: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderWidth: 4,
    borderColor: "transparent",
    borderRadius: 32,
    top: -4,
    left: -4,
  },
  progressCircleInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.lightText,
    zIndex: 1,
  },
  progressPercent: {
    fontWeight: "700",
    color: colors.primary,
    fontSize: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow.sm,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  timeText: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  timeMeta: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  medRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  medIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.lightGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  medIconText: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: "700",
  },
  medInfo: {
    flex: 1,
  },
  medName: {
    fontWeight: "700",
    color: colors.textPrimary,
    fontSize: 16,
  },
  medDose: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  actionBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  actionDone: {
    backgroundColor: colors.lightGreen,
  },
  actionText: {
    color: colors.lightText,
    fontWeight: "600",
    fontSize: 14,
  },
  actionTextDone: {
    color: colors.success,
  },
  fab: {
    position: "absolute",
    right: spacing.lg,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.card,
  },
});
