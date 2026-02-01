import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View, ScrollView, Pressable, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, radius, shadow, spacing } from "@/constants/design";
import { routes } from "@/constants/routes";
import { useHealth } from "@/context/HealthContext";

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
      <LinearGradient colors={["#1A1F3A", "#1A1F3A"]} style={styles.header}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Complete Your Profile</Text>
            <Text style={styles.subtitle}>Help us personalize your health journey</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>Gender (Optional)</Text>
          <View style={styles.genderRow}>
            {["Male", "Female", "Other"].map((g) => (
              <Pressable
                key={g}
                style={[styles.genderButton, gender === g && styles.genderButtonActive]}
                onPress={() => setGender(gender === g ? "" : g)}
              >
                <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>{g}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Age (Optional)</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              placeholder="Enter your age"
              value={age}
              onChangeText={setAge}
              style={styles.input}
              keyboardType="numeric"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <Text style={styles.label}>Height (Optional)</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="resize-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              placeholder="Height in cm"
              value={height}
              onChangeText={setHeight}
              style={styles.input}
              keyboardType="numeric"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <Text style={styles.label}>Weight (Optional)</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="barbell-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              placeholder="Weight in kg"
              value={weight}
              onChangeText={setWeight}
              style={styles.input}
              keyboardType="numeric"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <PrimaryButton title="Continue" onPress={handleContinue} />

          <Pressable style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip for now</Text>
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
  label: {
    fontWeight: "600",
    marginBottom: spacing.xs,
    marginTop: spacing.md,
    color: colors.textPrimary,
    fontSize: 14,
  },
  genderRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  genderButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  genderButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceTeal,
  },
  genderText: {
    color: colors.textSecondary,
    fontWeight: "600",
    fontSize: 14,
  },
  genderTextActive: {
    color: colors.primary,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
  },
  inputIcon: {
    marginRight: spacing.xs,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
    fontSize: 16,
  },
  skipButton: {
    marginTop: spacing.md,
    alignItems: "center",
  },
  skipText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});

