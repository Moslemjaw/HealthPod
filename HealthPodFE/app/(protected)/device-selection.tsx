import React from "react";
import { StyleSheet, Text, View, ScrollView, Pressable, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, shadow, spacing } from "@/constants/design";
import { routes } from "@/constants/routes";

export default function DeviceSelectionScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#1A1F3A", "#1A1F3A"]} style={styles.header}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Add Your Device</Text>
            <Text style={styles.subtitle}>Connect your HealthPod device to get started</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Pressable
            style={styles.deviceCard}
            onPress={() => router.push(routes.deviceSetup)}
          >
            <View style={styles.deviceIcon}>
              <Ionicons name="cube" size={32} color={colors.primary} />
            </View>
            <View style={styles.deviceInfo}>
              <Text style={styles.deviceName}>HealthPod Dispenser</Text>
              <Text style={styles.deviceDescription}>
                Smart medication dispenser with automatic scheduling
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </Pressable>

          <Pressable style={[styles.deviceCard, styles.deviceCardDisabled]} disabled>
            <View style={[styles.deviceIcon, styles.deviceIconDisabled]}>
              <Ionicons name="watch" size={32} color={colors.textMuted} />
            </View>
            <View style={styles.deviceInfo}>
              <Text style={[styles.deviceName, styles.deviceNameDisabled]}>HealthPod Band</Text>
              <Text style={styles.deviceDescriptionDisabled}>
                Coming soon - Health tracking wearable
              </Text>
            </View>
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>Soon</Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  headerContent: {
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.lightText,
    marginTop: spacing.sm,
  },
  subtitle: {
    marginTop: 6,
    color: "#CBD5E1",
    fontSize: 14,
    textAlign: "center",
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  card: {
    marginTop: -30,
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    paddingTop: spacing.xl,
    ...shadow.card,
  },
  deviceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  deviceCardDisabled: {
    opacity: 0.6,
  },
  deviceIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceTeal,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  deviceIconDisabled: {
    backgroundColor: colors.surfaceAlt,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  deviceNameDisabled: {
    color: colors.textMuted,
  },
  deviceDescription: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  deviceDescriptionDisabled: {
    color: colors.textMuted,
  },
  comingSoonBadge: {
    backgroundColor: colors.lightYellow,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
  },
  comingSoonText: {
    color: colors.warning,
    fontSize: 11,
    fontWeight: "600",
  },
});

