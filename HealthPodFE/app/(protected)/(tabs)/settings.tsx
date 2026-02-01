import React from "react";
import { Pressable, StyleSheet, Text, View, ScrollView, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { colors, radius, shadow, spacing } from "@/constants/design";
import { routes } from "@/constants/routes";
import { useHealth } from "@/context/HealthContext";

const Row = ({
  icon,
  label,
  onPress,
  right,
}: {
  icon: string;
  label: string;
  onPress?: () => void;
  right?: React.ReactNode;
}) => (
  <Pressable style={styles.row} onPress={onPress}>
    <View style={styles.rowIcon}>
      <Ionicons name={icon as any} size={18} color={colors.primary} />
    </View>
    <Text style={styles.rowLabel}>{label}</Text>
    <View style={styles.rowRight}>{right || <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />}</View>
  </Pressable>
);

export default function SettingsScreen() {
  const router = useRouter();
  const { user } = useHealth();

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Settings</Text>

          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(user?.name || "A").charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name || "Apple User"}</Text>
              <Text style={styles.profileEmail}>{user?.email || "apple_0016614@healthpod.app"}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </View>

          <Text style={styles.sectionLabel}>ACCOUNT</Text>
          <View style={styles.card}>
            <Row icon="person-outline" label="Profile" onPress={() => router.push(routes.profile)} />
            <Row
              icon="notifications-outline"
              label="Notifications"
              onPress={() => router.push(routes.notifications)}
            />
            <Row icon="shield-checkmark-outline" label="Privacy" onPress={() => router.push(routes.privacy)} />
          </View>

          <Text style={styles.sectionLabel}>DEVICES</Text>
          <View style={styles.card}>
            <Row
              icon="watch-outline"
              label="Connected Devices"
              onPress={() => router.push(routes.wearables)}
              right={
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>2</Text>
                </View>
              }
            />
            <Row icon="add-circle-outline" label="Add New Device" onPress={() => router.push(routes.addDevice)} />
          </View>

          <Text style={styles.sectionLabel}>SUPPORT</Text>
          <View style={styles.card}>
            <Row icon="chatbubbles-outline" label="AI Health Assistant" onPress={() => router.push(routes.chat)} />
            <Row icon="help-circle-outline" label="Help Center" onPress={() => router.push(routes.support)} />
          </View>
        </ScrollView>
      </SafeAreaView>
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
  content: {
    padding: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.xl,
    ...shadow.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  avatarText: {
    color: colors.lightText,
    fontWeight: "700",
    fontSize: 20,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontWeight: "700",
    color: colors.textPrimary,
    fontSize: 16,
  },
  profileEmail: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  sectionLabel: {
    marginBottom: spacing.sm,
    marginTop: spacing.md,
    color: colors.textSecondary,
    textTransform: "uppercase",
    fontSize: 12,
    letterSpacing: 0.8,
    fontWeight: "600",
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.sm,
    marginBottom: spacing.lg,
    ...shadow.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.surfaceTeal,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  rowLabel: {
    flex: 1,
    fontWeight: "600",
    color: colors.textPrimary,
    fontSize: 15,
  },
  rowRight: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: "center",
  },
  badgeText: {
    color: colors.lightText,
    fontWeight: "700",
    fontSize: 12,
  },
});
