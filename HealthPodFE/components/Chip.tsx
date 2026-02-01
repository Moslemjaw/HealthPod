import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "@/constants/design";

type ChipProps = {
  label: string;
  tone?: "default" | "success" | "warning";
};

export function Chip({ label, tone = "default" }: ChipProps) {
  return (
    <View style={[styles.chip, toneStyles[tone]]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    alignSelf: "flex-start"
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textPrimary
  }
});

const toneStyles = StyleSheet.create({
  default: {
    backgroundColor: "#E2E8F0"
  },
  success: {
    backgroundColor: "#DCFCE7"
  },
  warning: {
    backgroundColor: "#FEF3C7"
  }
});

