import React from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { Screen } from "@/components/Screen";
import { colors, radius, spacing } from "@/constants/design";
import { useHealth } from "@/context/HealthContext";

export default function ProfileScreen() {
  const { user } = useHealth();

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Profile</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{user?.name || "HealthPod User"}</Text>
          
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email || "user@healthpod.app"}</Text>
          
          {user?.gender && (
            <>
              <Text style={styles.label}>Gender</Text>
              <Text style={styles.value}>{user.gender}</Text>
            </>
          )}
          
          {user?.age && (
            <>
              <Text style={styles.label}>Age</Text>
              <Text style={styles.value}>{user.age} years</Text>
            </>
          )}
          
          {user?.height && (
            <>
              <Text style={styles.label}>Height</Text>
              <Text style={styles.value}>{user.height} cm</Text>
            </>
          )}
          
          {user?.weight && (
            <>
              <Text style={styles.label}>Weight</Text>
              <Text style={styles.value}>{user.weight} kg</Text>
            </>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
  },
  title: {
    fontSize: 28,
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
    fontSize: 13,
  },
  value: {
    color: colors.textPrimary,
    marginTop: 4,
    fontSize: 16,
  },
});
