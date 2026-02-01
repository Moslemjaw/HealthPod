import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View, Pressable, KeyboardAvoidingView, Platform, Alert, Image } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, radius, shadow, spacing, typography } from "@/constants/design";
import { routes } from "@/constants/routes";
import { useHealth } from "@/context/HealthContext";

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useHealth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email.trim()) {
      Alert.alert("Email Required", "Please enter your email address.");
      return;
    }
    if (!password.trim()) {
      Alert.alert("Password Required", "Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      const success = await signIn(email.trim(), password);
      if (success) {
        router.replace(routes.tabs);
      } else {
        Alert.alert(
          "Sign In Failed",
          "Invalid email or password. Please try again.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <Animated.View 
            entering={FadeInDown.delay(100).duration(600).springify()}
            style={styles.header}
          >
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </Pressable>
            <View style={styles.titleContainer}>
              <View style={styles.logoWrapper}>
                <Image 
                  source={require("@/assets/HealthPodNewLogo.png")} 
                  style={styles.logoSmall} 
                  resizeMode="contain" 
                />
              </View>
              <Text style={styles.title}>Welcome back</Text>
              <Text style={styles.subtitle}>Please enter your details to sign in.</Text>
            </View>
          </Animated.View>

          <Animated.View 
            entering={FadeInUp.delay(300).duration(600).springify()}
            style={styles.form}
          >
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholderTextColor={colors.textMuted}
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  style={styles.input}
                  secureTextEntry={!showPassword}
                  placeholderTextColor={colors.textMuted}
                  editable={!loading}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                  <Ionicons 
                    name={showPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color={colors.textMuted} 
                  />
                </Pressable>
              </View>
            </View>

            <Pressable style={styles.forgotButton}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </Pressable>

            <View style={styles.buttonContainer}>
              <PrimaryButton
                title={loading ? "Signing In..." : "Sign In"}
                size="lg"
                onPress={handleSignIn}
                disabled={loading}
              />
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialRow}>
              <Pressable style={styles.socialButton}>
                <Ionicons name="logo-google" size={22} color={colors.textPrimary} />
              </Pressable>
              <Pressable style={styles.socialButton}>
                <Ionicons name="logo-apple" size={24} color={colors.textPrimary} />
              </Pressable>
            </View>

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Don't have an account?</Text>
              <Pressable onPress={() => router.replace(routes.register)}>
                <Text style={styles.footerLink}>Sign up</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: "center",
  },
  header: {
    marginBottom: spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    marginBottom: spacing.lg,
    marginLeft: -spacing.xs,
  },
  titleContainer: {
    gap: spacing.xs,
    alignItems: "center", // Center logo
  },
  logoWrapper: {
    width: 80,
    height: 80,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceTeal,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    ...shadow.sm,
    overflow: "hidden",
  },
  logoSmall: {
    width: 56,
    height: 56,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  form: {
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  label: {
    ...typography.small,
    fontWeight: "600",
    color: colors.textPrimary,
    marginLeft: spacing.xxs,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    height: 56,
  },
  inputIcon: {
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    height: "100%",
    color: colors.textPrimary,
    fontSize: 16,
  },
  eyeButton: {
    padding: spacing.md,
  },
  forgotButton: {
    alignSelf: "flex-end",
  },
  forgotText: {
    ...typography.small,
    fontWeight: "600",
    color: colors.primary,
  },
  buttonContainer: {
    marginTop: spacing.sm,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "500",
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  socialButton: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    ...shadow.sm,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.xs,
  },
  footerText: {
    ...typography.body,
    fontSize: 14,
    color: colors.textSecondary,
  },
  footerLink: {
    ...typography.body,
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },
});
