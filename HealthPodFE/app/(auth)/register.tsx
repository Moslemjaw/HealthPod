import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, radius, shadow, spacing } from "@/constants/design";
import { routes } from "@/constants/routes";
import { useHealth } from "@/context/HealthContext";

export default function RegisterScreen() {
  const router = useRouter();
  const { signIn } = useHealth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#1A1F3A", "#1A1F3A"]} style={styles.header}>
        <View style={styles.hero}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>❤</Text>
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Start your personalized health journey</Text>
        </View>
      </LinearGradient>

      <View style={styles.card}>
        <Text style={styles.label}>Full Name *</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            placeholder="John Doe"
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <Text style={styles.label}>Email *</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            placeholder="you@healthpod.app"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <Text style={styles.label}>Password *</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            placeholder="Min. 8 characters"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry={!showPassword}
            placeholderTextColor={colors.textMuted}
          />
          <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={18} color={colors.textSecondary} />
          </Pressable>
        </View>

        <Text style={styles.terms}>
          By creating an account, you agree to our{" "}
          <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
          <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>

        <PrimaryButton
          title="Create Account"
          onPress={() => {
            signIn(email || "new@healthpod.app", name || undefined);
            router.replace(routes.profileSetup);
          }}
        />

        <Text style={styles.orText}>or sign up with</Text>

        <View style={styles.socialRow}>
          <Pressable style={styles.socialButton}>
            <Text style={styles.socialText}>G</Text>
            <Text style={styles.socialLabel}>Google</Text>
          </Pressable>
          <Pressable style={styles.socialButton}>
            <Ionicons name="logo-apple" size={20} color={colors.primary} />
            <Text style={styles.socialLabel}>Apple</Text>
          </Pressable>
        </View>

        <Text style={styles.helper}>
          Already have an account?{" "}
          <Text style={styles.link} onPress={() => router.replace(routes.login)}>
            Sign in
          </Text>
        </Text>
      </View>
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
    paddingBottom: spacing.xl * 1.5,
    paddingHorizontal: spacing.lg,
  },
  hero: {
    alignItems: "center",
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
    ...shadow.sm,
  },
  logoText: {
    fontSize: 28,
    color: colors.lightText,
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
  },
  card: {
    flex: 1,
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
  eyeIcon: {
    padding: spacing.xs,
  },
  terms: {
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  termsLink: {
    color: colors.primary,
    fontWeight: "600",
  },
  orText: {
    textAlign: "center",
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    fontSize: 13,
  },
  socialRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  socialButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.xs,
  },
  socialText: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
  },
  socialLabel: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 14,
  },
  helper: {
    marginTop: spacing.sm,
    textAlign: "center",
    color: colors.textSecondary,
    fontSize: 14,
  },
  link: {
    color: colors.primary,
    fontWeight: "600",
  },
});

