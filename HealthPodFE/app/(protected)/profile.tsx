import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/Screen";
import { colors, radius, spacing } from "@/constants/design";
import { useHealth } from "@/context/HealthContext";

export default function ProfileScreen() {
  const { user } = useHealth();

  return (
    <Screen>
      <Text style={styles.title}>Profile</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{user?.name || "HealthPod User"}</Text>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email || "user@healthpod.app"}</Text>
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
});

import { StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/Screen";
import { colors, radius, spacing } from "@/constants/design";
import { useHealth } from "@/context/HealthContext";

export default function ProfileScreen() {
  const { user } = useHealth();

  return (
    <Screen>
      <Text style={styles.title}>Profile</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{user?.name || "HealthPod User"}</Text>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email || "user@healthpod.app"}</Text>
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
});

