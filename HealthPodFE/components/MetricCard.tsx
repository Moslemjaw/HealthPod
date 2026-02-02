import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, shadow, spacing } from "@/constants/design";

type MetricCardProps = {
  label: string;
  value: string;
  helper?: string;
};

export function MetricCard({ label, value, helper }: MetricCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {helper ? <Text style={styles.helper}>{helper}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    ...shadow.sm
  },
  label: {
    color: colors.textSecondary,
    fontWeight: "600"
  },
  value: {
    marginTop: spacing.xs,
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary
  },
  helper: {
    marginTop: spacing.xs,
    color: colors.textMuted
  }
});

import { StyleSheet, Text, View } from "react-native";
import { colors, radius, shadow, spacing } from "@/constants/design";

type MetricCardProps = {
  label: string;
  value: string;
  helper?: string;
};

export function MetricCard({ label, value, helper }: MetricCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {helper ? <Text style={styles.helper}>{helper}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    ...shadow.sm
  },
  label: {
    color: colors.textSecondary,
    fontWeight: "600"
  },
  value: {
    marginTop: spacing.xs,
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary
  },
  helper: {
    marginTop: spacing.xs,
    color: colors.textMuted
  }
});


