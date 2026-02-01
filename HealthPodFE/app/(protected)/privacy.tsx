import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/Screen";
import { colors, radius, spacing } from "@/constants/design";

export default function PrivacyScreen() {
  return (
    <Screen>
      <Text style={styles.title}>Privacy</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Data Sharing</Text>
        <Text style={styles.value}>Only share anonymized insights</Text>
        <Text style={styles.label}>Account Deletion</Text>
        <Pressable style={styles.dangerBtn}>
          <Text style={styles.dangerText}>Delete Account</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  label: {
    fontWeight: "600",
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  value: {
    color: colors.textPrimary,
    marginTop: 4,
  },
  dangerBtn: {
    marginTop: spacing.md,
    backgroundColor: "#FEE2E2",
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    alignItems: "center",
  },
  dangerText: {
    color: colors.error,
    fontWeight: "700",
  },
});

