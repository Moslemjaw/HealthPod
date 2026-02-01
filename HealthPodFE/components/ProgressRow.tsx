import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "@/constants/design";

type ProgressRowProps = {
  title: string;
  subtitle: string;
  progress: number;
  warning?: boolean;
};

export function ProgressRow({ title, subtitle, progress, warning }: ProgressRowProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={[styles.subtitle, warning && styles.warning]}>{subtitle}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.max(0, Math.min(100, progress))}%` }, warning && styles.warningFill]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6
  },
  title: {
    fontWeight: "600",
    color: colors.textPrimary
  },
  subtitle: {
    color: colors.textSecondary
  },
  warning: {
    color: colors.warning
  },
  track: {
    height: 8,
    borderRadius: radius.sm,
    backgroundColor: "#E2E8F0"
  },
  fill: {
    height: "100%",
    borderRadius: radius.sm,
    backgroundColor: colors.secondary
  },
  warningFill: {
    backgroundColor: colors.warning
  }
});

