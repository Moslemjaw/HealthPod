import React from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import { Screen } from "@/components/Screen";
import { colors, radius, spacing } from "@/constants/design";

export default function NotificationsScreen() {
  return (
    <Screen>
      <Text style={styles.title}>Notifications</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Medication Reminders</Text>
          <Switch value />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Device Alerts</Text>
          <Switch value />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Order Updates</Text>
          <Switch value={false} />
        </View>
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
  },
  label: {
    color: colors.textPrimary,
    fontWeight: "600",
  },
});

import { StyleSheet, Switch, Text, View } from "react-native";
import { Screen } from "@/components/Screen";
import { colors, radius, spacing } from "@/constants/design";

export default function NotificationsScreen() {
  return (
    <Screen>
      <Text style={styles.title}>Notifications</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Medication Reminders</Text>
          <Switch value />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Device Alerts</Text>
          <Switch value />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Order Updates</Text>
          <Switch value={false} />
        </View>
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
  },
  label: {
    color: colors.textPrimary,
    fontWeight: "600",
  },
});

