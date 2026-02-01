import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, radius, shadow, spacing } from "@/constants/design";
import { routes } from "@/constants/routes";
import { useHealth } from "@/context/HealthContext";

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useHealth();
  const [email, setEmail] = useState("");

  return (
    <Screen>
      <View style={styles.hero}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>❤</Text>
        </View>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to your HealthPod account</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          placeholder="you@healthpod.app"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <PrimaryButton
          title="Sign In"
          onPress={() => {
            signIn(email || "user@healthpod.app");
            router.replace(routes.tabs);
          }}
        />
        <Text style={styles.helper}>
          Don&apos;t have an account?{" "}
          <Text style={styles.link} onPress={() => router.replace(routes.register)}>
            Create account
          </Text>
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: colors.mint,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
    ...shadow.sm,
  },
  logoText: {
    fontSize: 26,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
  },
  card: {
    marginTop: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.sm,
  },
  label: {
    fontWeight: "600",
    marginBottom: spacing.xs,
    color: colors.textPrimary
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md
  },
  helper: {
    marginTop: spacing.md,
    color: colors.textSecondary
  },
  link: {
    color: colors.primary,
    fontWeight: "600"
  }
});


import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, radius, shadow, spacing } from "@/constants/design";
import { routes } from "@/constants/routes";
import { useHealth } from "@/context/HealthContext";

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useHealth();
  const [email, setEmail] = useState("");

  return (
    <Screen>
      <View style={styles.hero}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>❤</Text>
        </View>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to your HealthPod account</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          placeholder="you@healthpod.app"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <PrimaryButton
          title="Sign In"
          onPress={() => {
            signIn(email || "user@healthpod.app");
            router.replace(routes.tabs);
          }}
        />
        <Text style={styles.helper}>
          Don&apos;t have an account?{" "}
          <Text style={styles.link} onPress={() => router.replace(routes.register)}>
            Create account
          </Text>
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: colors.mint,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
    ...shadow.sm,
  },
  logoText: {
    fontSize: 26,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
  },
  card: {
    marginTop: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.sm,
  },
  label: {
    fontWeight: "600",
    marginBottom: spacing.xs,
    color: colors.textPrimary
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md
  },
  helper: {
    marginTop: spacing.md,
    color: colors.textSecondary
  },
  link: {
    color: colors.primary,
    fontWeight: "600"
  }
});

