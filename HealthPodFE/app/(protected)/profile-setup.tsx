import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View, ScrollView, Pressable, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, radius, shadow, spacing, gradients, typography } from "@/constants/design";
import { routes } from "@/constants/routes";
import { useHealth } from "@/context/HealthContext";

const genderOptions = [
  { value: "Male", icon: "male" },
  { value: "Female", icon: "female" },
  { value: "Other", icon: "person" },
];

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { user, updateProfile } = useHealth();
  const [gender, setGender] = useState(user?.gender || "");
  const [age, setAge] = useState(user?.age?.toString() || "");
  const [height, setHeight] = useState(user?.height?.toString() || "");
  const [weight, setWeight] = useState(user?.weight?.toString() || "");

  const handleContinue = () => {
    updateProfile({
      gender: gender || undefined,
      age: age ? parseInt(age) : undefined,
      height: height ? parseFloat(height) : undefined,
      weight: weight ? parseFloat(weight) : undefined,
      profileComplete: true,
    });
    router.replace(routes.deviceSelection);
  };

  const handleSkip = () => {
    updateProfile({ profileComplete: true });
    router.replace(routes.deviceSelection);
  };

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
              <View style={[styles.progressDot, styles.progressDotActive]} />
              <View style={styles.progressLine} />
              <View style={styles.progressDot} />
              <View style={styles.progressLine} />
              <View style={styles.progressDot} />
            </View>
            <Text style={styles.stepLabel}>Step 1 of 3</Text>
            <Text style={styles.title}>Complete Your Profile</Text>
            <Text style={styles.subtitle}>Help us personalize your experience</Text>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>

      <Animated.View 
        entering={FadeInUp.delay(200).duration(500).springify()} 
        style={styles.card}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Gender Selection */}
          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderRow}>
            {genderOptions.map((g) => (
              <Pressable
                key={g.value}
                style={[styles.genderOption, gender === g.value && styles.genderOptionActive]}
                onPress={() => setGender(gender === g.value ? "" : g.value)}
              >
                <View style={[
                  styles.genderIcon,
                  gender === g.value && styles.genderIconActive
                ]}>
                  <Ionicons 
                    name={g.icon as any} 
                    size={24} 
                    color={gender === g.value ? colors.lightText : colors.textMuted} 
                  />
                </View>
                <Text style={[
                  styles.genderText,
                  gender === g.value && styles.genderTextActive
                ]}>
                  {g.value}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Age */}
          <Text style={styles.label}>Age</Text>
          <View style={styles.inputContainer}>
            <View style={styles.inputIconBox}>
              <Ionicons name="calendar-outline" size={20} color={colors.textMuted} />
            </View>
            <TextInput
              placeholder="Enter your age"
              value={age}
              onChangeText={setAge}
              style={styles.input}
              keyboardType="numeric"
              placeholderTextColor={colors.textMuted}
            />
            <Text style={styles.inputSuffix}>years</Text>
          </View>

          {/* Height */}
          <Text style={styles.label}>Height</Text>
          <View style={styles.inputContainer}>
            <View style={styles.inputIconBox}>
              <Ionicons name="resize-outline" size={20} color={colors.textMuted} />
            </View>
            <TextInput
              placeholder="Enter your height"
              value={height}
              onChangeText={setHeight}
              style={styles.input}
              keyboardType="numeric"
              placeholderTextColor={colors.textMuted}
            />
            <Text style={styles.inputSuffix}>cm</Text>
          </View>

          {/* Weight */}
          <Text style={styles.label}>Weight</Text>
          <View style={styles.inputContainer}>
            <View style={styles.inputIconBox}>
              <Ionicons name="barbell-outline" size={20} color={colors.textMuted} />
            </View>
            <TextInput
              placeholder="Enter your weight"
              value={weight}
              onChangeText={setWeight}
              style={styles.input}
              keyboardType="numeric"
              placeholderTextColor={colors.textMuted}
            />
            <Text style={styles.inputSuffix}>kg</Text>
          </View>

          <View style={styles.actions}>
            <PrimaryButton title="Continue" size="lg" onPress={handleContinue} />
            <Pressable style={styles.skipBtn} onPress={handleSkip}>
              <Text style={styles.skipText}>Skip for now</Text>
            </Pressable>
          </View>
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
  progressLine: {
    width: 40,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: spacing.xs,
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
  label: {
    ...typography.small,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  genderRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  genderOption: {
    flex: 1,
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  genderOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  genderIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  genderIconActive: {
    backgroundColor: colors.primary,
  },
  genderText: {
    ...typography.small,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  genderTextActive: {
    color: colors.primary,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  inputIconBox: {
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    color: colors.textPrimary,
    fontSize: 16,
  },
  inputSuffix: {
    ...typography.body,
    color: colors.textMuted,
    paddingRight: spacing.md,
  },
  actions: {
    marginTop: spacing.xl,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  skipBtn: {
    alignItems: "center",
    padding: spacing.sm,
  },
  skipText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
