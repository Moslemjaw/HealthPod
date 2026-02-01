import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, radius, shadow, spacing } from "@/constants/design";
import { routes } from "@/constants/routes";

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <LinearGradient colors={["#1A1F3A", "#2D3550"]} style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>❤</Text>
        </View>
        <Text style={styles.title}>HealthPod</Text>
        <Text style={styles.subtitle}>
          Smart medication management powered by AI
        </Text>
      </View>

      <View style={styles.features}>
        <View style={styles.feature}>
          <View style={styles.featureIcon}>
            <Ionicons name="star-outline" size={20} color={colors.primary} />
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Smart Reminders</Text>
            <Text style={styles.featureText}>
              AI-powered scheduling that adapts to your routine
            </Text>
          </View>
        </View>
        <View style={styles.feature}>
          <View style={styles.featureIcon}>
            <Ionicons name="analytics-outline" size={20} color={colors.accentBlue} />
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Health Insights</Text>
            <Text style={styles.featureText}>
              Track trends and get personalized recommendations
            </Text>
          </View>
        </View>
        <View style={styles.feature}>
          <View style={styles.featureIcon}>
            <Ionicons name="hardware-chip-outline" size={20} color={colors.warning} />
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Device Sync</Text>
            <Text style={styles.featureText}>
              Connect your HealthPod dispenser for automation
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <PrimaryButton title="Get Started" onPress={() => router.replace(routes.register)} />
        <Text style={styles.footer}>
          Already have an account?{" "}
          <Text style={styles.link} onPress={() => router.replace(routes.login)}>
            Sign in
          </Text>
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: "space-between",
  },
  hero: {
    alignItems: "center",
    marginTop: spacing.xl * 2,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.card,
  },
  logoText: {
    fontSize: 28,
    color: colors.lightText,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.lightText,
    marginTop: spacing.md,
  },
  subtitle: {
    marginTop: spacing.sm,
    color: "#CBD5E1",
    textAlign: "center",
    fontSize: 15,
  },
  features: {
    gap: spacing.md,
  },
  feature: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: "center",
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    color: colors.lightText,
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 4,
  },
  featureText: {
    color: "#CBD5E1",
    fontSize: 14,
  },
  actions: {
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  footer: {
    textAlign: "center",
    color: "#CBD5E1",
    fontSize: 14,
  },
  link: {
    color: colors.primary,
    fontWeight: "600",
  },
});

