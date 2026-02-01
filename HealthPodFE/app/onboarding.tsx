import React from "react";
import { StyleSheet, Text, View, Dimensions, Image } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  FadeIn,
  SlideInRight,
} from "react-native-reanimated";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, radius, shadow, spacing, gradients, typography } from "@/constants/design";
import { routes } from "@/constants/routes";

const { width, height } = Dimensions.get("window");

const features = [
  { 
    icon: "calendar-outline", 
    color: colors.primary,
    bg: colors.surfaceTeal,
    title: "Smart Scheduling", 
    text: "AI-adapted reminders for your routine" 
  },
  { 
    icon: "stats-chart-outline", 
    color: colors.accentBlue,
    bg: colors.surfaceBlue,
    title: "Health Insights", 
    text: "Track your adherence and well-being" 
  },
  { 
    icon: "bluetooth-outline", 
    color: colors.accentPurple,
    bg: colors.surfacePurple,
    title: "Seamless Sync", 
    text: "Connects with your HealthPod dispenser" 
  },
];

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Background Decor */}
      <View style={styles.backgroundDecor}>
        <LinearGradient
          colors={[colors.primaryLight, "transparent"]}
          style={styles.blob1}
        />
        <LinearGradient
          colors={[colors.surfaceBlue, "transparent"]}
          style={styles.blob2}
        />
      </View>

      <View style={styles.content}>
        {/* Header / Hero */}
        <Animated.View 
          entering={FadeInDown.delay(100).duration(800).springify()} 
          style={styles.hero}
        >
          <View style={styles.logoContainer}>
            <View style={styles.logoRing}>
              <Image 
                source={require("@/assets/HealthPodNewLogo.png")} 
                style={styles.logoImage} 
                resizeMode="contain" 
              />
            </View>
          </View>
          
          <Text style={styles.title}>HealthPod</Text>
          <Text style={styles.subtitle}>
            Your personal companion for{"\n"}better health management.
          </Text>
        </Animated.View>

        {/* Features List */}
        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <Animated.View 
              key={feature.title}
              entering={SlideInRight.delay(400 + index * 100).duration(600).springify()} 
              style={styles.featureRow}
            >
              <View style={[styles.iconBox, { backgroundColor: feature.bg }]}>
                <Ionicons name={feature.icon as any} size={24} color={feature.color} />
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDesc}>{feature.text}</Text>
              </View>
            </Animated.View>
          ))}
        </View>

        {/* Action Buttons */}
        <Animated.View 
          entering={FadeInUp.delay(800).duration(600).springify()} 
          style={styles.footer}
        >
          <PrimaryButton 
            title="Get Started" 
            size="lg" 
            onPress={() => router.push(routes.register)}
          />
          
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <Text 
              style={styles.loginLink}
              onPress={() => router.push(routes.login)}
            >
              Sign In
            </Text>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backgroundDecor: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
    zIndex: -1,
  },
  blob1: {
    position: "absolute",
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: 999,
    top: -width * 0.6,
    left: -width * 0.3,
    opacity: 0.6,
  },
  blob2: {
    position: "absolute",
    width: width * 1,
    height: width * 1,
    borderRadius: 999,
    bottom: -width * 0.4,
    right: -width * 0.4,
    opacity: 0.4,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xl,
    justifyContent: "space-between",
  },
  hero: {
    alignItems: "center",
    marginTop: spacing.xl,
  },
  logoContainer: {
    marginBottom: spacing.lg,
  },
  logoRing: {
    width: 120,
    height: 120,
    borderRadius: radius.xxl,
    backgroundColor: colors.surfaceTeal,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.primaryLight,
    ...shadow.sm,
    overflow: "hidden", // Ensure image stays within ring
  },
  logoImage: {
    width: 96,
    height: 96,
  },
  title: {
    ...typography.hero,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    maxWidth: 280,
  },
  featuresContainer: {
    gap: spacing.lg,
    marginVertical: spacing.xl,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.6)",
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    ...typography.h3,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  featureDesc: {
    ...typography.small,
    color: colors.textSecondary,
  },
  footer: {
    gap: spacing.lg,
  },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.xs,
  },
  loginText: {
    ...typography.body,
    fontSize: 14,
    color: colors.textSecondary,
  },
  loginLink: {
    ...typography.body,
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },
});
