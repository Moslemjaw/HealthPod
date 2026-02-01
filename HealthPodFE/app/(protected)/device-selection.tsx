import React from "react";
import { StyleSheet, Text, View, ScrollView, Pressable, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { colors, radius, shadow, spacing, gradients, typography } from "@/constants/design";
import { routes } from "@/constants/routes";

const devices = [
  {
    id: "dispenser",
    name: "HealthPod Dispenser",
    description: "Smart medication dispenser with automatic scheduling",
    icon: "cube",
    color: colors.primary,
    bg: colors.surfaceTeal,
    available: true,
  },
  {
    id: "band",
    name: "HealthPod Band",
    description: "Health tracking wearable device",
    icon: "watch",
    color: colors.textMuted,
    bg: colors.surfaceAlt,
    available: false,
  },
];

export default function DeviceSelectionScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LinearGradient colors={gradients.dark} style={styles.header}>
        <SafeAreaView>
          <Animated.View 
            entering={FadeInDown.duration(500)} 
            style={styles.headerContent}
          >
            {/* Progress indicator */}
            <View style={styles.progressRow}>
              <View style={[styles.progressDot, styles.progressDotDone]} />
              <View style={[styles.progressLine, styles.progressLineDone]} />
              <View style={[styles.progressDot, styles.progressDotActive]} />
              <View style={styles.progressLine} />
              <View style={styles.progressDot} />
            </View>
            <Text style={styles.stepLabel}>Step 2 of 3</Text>
            <Text style={styles.title}>Add Your Device</Text>
            <Text style={styles.subtitle}>Connect your HealthPod device</Text>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>

      <Animated.View 
        entering={FadeInUp.delay(200).duration(500).springify()} 
        style={styles.card}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {devices.map((device, index) => (
            <Animated.View
              key={device.id}
              entering={FadeInDown.delay(300 + index * 100).duration(400)}
            >
              <Pressable
                style={[
                  styles.deviceCard,
                  !device.available && styles.deviceCardDisabled
                ]}
                onPress={() => device.available && router.push(routes.deviceSetup)}
                disabled={!device.available}
              >
                <View style={[styles.deviceIcon, { backgroundColor: device.bg }]}>
                  <Ionicons name={device.icon as any} size={32} color={device.color} />
                </View>
                <View style={styles.deviceInfo}>
                  <Text style={[
                    styles.deviceName,
                    !device.available && styles.deviceNameDisabled
                  ]}>
                    {device.name}
                  </Text>
                  <Text style={[
                    styles.deviceDesc,
                    !device.available && styles.deviceDescDisabled
                  ]}>
                    {device.description}
                  </Text>
                </View>
                {device.available ? (
                  <View style={styles.arrowBox}>
                    <Ionicons name="chevron-forward" size={20} color={colors.primary} />
                  </View>
                ) : (
                  <View style={styles.comingSoonBadge}>
                    <Text style={styles.comingSoonText}>Coming Soon</Text>
                  </View>
                )}
              </Pressable>
            </Animated.View>
          ))}

          {/* Info Card */}
          <Animated.View 
            entering={FadeInUp.delay(500).duration(400)}
            style={styles.infoCard}
          >
            <Ionicons name="information-circle" size={24} color={colors.accentBlue} />
            <Text style={styles.infoText}>
              You can add more devices later from Settings → Connected Devices
            </Text>
          </Animated.View>

          {/* Actions */}
          <Animated.View 
            entering={FadeInUp.delay(600).duration(400)}
            style={styles.actions}
          >
            <Pressable 
              style={styles.skipBtn} 
              onPress={() => router.replace(routes.tabs)}
            >
              <Text style={styles.skipText}>Skip for now</Text>
              <Ionicons name="arrow-forward" size={18} color={colors.textSecondary} />
            </Pressable>
          </Animated.View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  headerContent: {
    alignItems: "center",
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  progressDotActive: {
    backgroundColor: colors.primary,
  },
  progressDotDone: {
    backgroundColor: colors.success,
  },
  progressLine: {
    width: 40,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: spacing.xs,
  },
  progressLineDone: {
    backgroundColor: colors.success,
  },
  stepLabel: {
    ...typography.caption,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.h1,
    color: colors.lightText,
    textAlign: "center",
  },
  subtitle: {
    ...typography.body,
    color: colors.textLight,
    opacity: 0.8,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  card: {
    flex: 1,
    marginTop: -spacing.xl,
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    padding: spacing.xl,
    ...shadow.lg,
  },
  deviceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    ...shadow.sm,
  },
  deviceCardDisabled: {
    opacity: 0.6,
    borderColor: colors.borderLight,
  },
  deviceIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  deviceInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  deviceName: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  deviceNameDisabled: {
    color: colors.textMuted,
  },
  deviceDesc: {
    ...typography.small,
    color: colors.textSecondary,
  },
  deviceDescDisabled: {
    color: colors.textMuted,
  },
  arrowBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  comingSoonBadge: {
    backgroundColor: colors.lightYellow,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  comingSoonText: {
    ...typography.tiny,
    color: colors.warning,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surfaceBlue,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  infoText: {
    flex: 1,
    ...typography.small,
    color: colors.accentBlue,
  },
  actions: {
    marginTop: spacing.xl,
    alignItems: "center",
    paddingBottom: spacing.xl,
  },
  skipBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    padding: spacing.sm,
  },
  skipText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
