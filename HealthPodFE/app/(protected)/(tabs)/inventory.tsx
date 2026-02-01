import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View, ScrollView, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, shadow, spacing } from "@/constants/design";
import { getMedications } from "@/services/api";
import { Medication } from "@/types";

export default function InventoryScreen() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMedications()
      .then(setMedications)
      .finally(() => setLoading(false));
  }, []);

  const inStock = useMemo(
    () => medications.filter((med) => med.remaining > med.refillThreshold),
    [medications]
  );

  const lowStock = useMemo(
    () => medications.filter((med) => med.remaining <= med.refillThreshold),
    [medications]
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safe}>
          <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Inventory</Text>
          <Text style={styles.subtitle}>Track your medication stock</Text>

          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, styles.summarySuccess]}>
              <Ionicons name="checkmark-circle" size={24} color={colors.success} />
              <Text style={styles.summaryValue}>{inStock.length}</Text>
              <Text style={styles.summaryLabel}>In Stock</Text>
            </View>
            <View style={[styles.summaryCard, styles.summaryWarning]}>
              <Ionicons name="warning" size={24} color={colors.warning} />
              <Text style={styles.summaryValue}>{lowStock.length}</Text>
              <Text style={styles.summaryLabel}>Low Stock</Text>
            </View>
          </View>

          {medications.map((med) => {
            const percent = Math.round((med.remaining / med.total) * 100);
            const isLowStock = med.remaining <= med.refillThreshold;
            return (
              <View key={med.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={[styles.medIcon, { backgroundColor: colors.surfaceTeal }]}>
                    <Text style={styles.medIconText}>*</Text>
                  </View>
                  <View style={styles.medInfo}>
                    <Text style={styles.medName}>{med.name}</Text>
                    <Text style={styles.medDosage}>{med.dosage}</Text>
                  </View>
                  {isLowStock && (
                    <View style={styles.reorderPill}>
                      <Ionicons name="warning" size={12} color={colors.warning} />
                      <Text style={styles.reorderText}>Reorder Soon</Text>
                    </View>
                  )}
                </View>

                <View style={styles.scheduleRow}>
                  <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.scheduleText}>{med.schedule}</Text>
                </View>

                <View style={styles.remainingRow}>
                  <Text style={styles.remainingLabel}>Remaining</Text>
                  <Text style={styles.remainingValue}>
                    {med.remaining} / {med.total}
                  </Text>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${percent}%` }]} />
                </View>

                <Pressable style={styles.refillButton}>
                  <Ionicons name="cart-outline" size={16} color={colors.primary} />
                  <Text style={styles.refillText}>Order Refill</Text>
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
  summaryRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  summaryCard: {
    flex: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: "center",
  },
  summarySuccess: {
    backgroundColor: colors.lightGreen,
  },
  summaryWarning: {
    backgroundColor: colors.lightYellow,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: spacing.xs,
    color: colors.textPrimary,
  },
  summaryLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow.sm,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  medIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.surfaceTeal,
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
    marginLeft: spacing.sm,
  },
  medName: {
    fontWeight: "700",
    color: colors.textPrimary,
    fontSize: 16,
  },
  medDosage: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  reorderPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.lightYellow,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
  },
  reorderText: {
    color: colors.warning,
    fontWeight: "600",
    fontSize: 11,
  },
  scheduleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: spacing.sm,
  },
  scheduleText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  remainingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  remainingLabel: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  remainingValue: {
    fontWeight: "600",
    color: colors.textPrimary,
    fontSize: 13,
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 999,
    marginTop: spacing.sm,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.warning,
    borderRadius: 999,
    minWidth: 4,
  },
  refillButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceTeal,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  refillText: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 14,
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
