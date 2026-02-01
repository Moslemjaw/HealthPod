import React from "react";
import { Pressable, StyleSheet, Text, View, ScrollView, SafeAreaView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { colors, radius, shadow, spacing, typography } from "@/constants/design";
import { useHealth } from "@/context/HealthContext";

export default function PrivacyScreen() {
  const router = useRouter();
  const { signOut } = useHealth();

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            // In a real app, call delete API here
            await signOut();
            router.replace("/");
          } 
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <Animated.View 
          entering={FadeInDown.duration(500)} 
          style={styles.header}
        >
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.title}>Privacy & Security</Text>
          <View style={{ width: 40 }} />
        </Animated.View>

        <ScrollView contentContainerStyle={styles.content}>
          <Animated.View entering={FadeInDown.delay(100).duration(500)}>
            <View style={styles.infoBox}>
              <Ionicons name="shield-checkmark" size={32} color={colors.primary} style={{ marginBottom: spacing.sm }} />
              <Text style={styles.infoTitle}>Your data is secure</Text>
              <Text style={styles.infoText}>
                HealthPod uses end-to-end encryption to protect your personal health information. We never share your data with third parties without your explicit consent.
              </Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <Text style={styles.sectionTitle}>Data Management</Text>
            <View style={styles.card}>
              <Pressable style={styles.row}>
                <View>
                  <Text style={styles.label}>Export Health Data</Text>
                  <Text style={styles.subLabel}>Download a copy of your records</Text>
                </View>
                <Ionicons name="download-outline" size={20} color={colors.primary} />
              </Pressable>
              <View style={styles.divider} />
              <Pressable style={styles.row}>
                <View>
                  <Text style={styles.label}>Manage Permissions</Text>
                  <Text style={styles.subLabel}>Control app access to device features</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </Pressable>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).duration(500)}>
            <Text style={styles.sectionTitle}>Account Actions</Text>
            <View style={styles.card}>
              <Pressable style={styles.row} onPress={handleDeleteAccount}>
                <View>
                  <Text style={[styles.label, styles.dangerText]}>Delete Account</Text>
                  <Text style={styles.subLabel}>Permanently remove all your data</Text>
                </View>
                <Ionicons name="trash-outline" size={20} color={colors.error} />
              </Pressable>
            </View>
          </Animated.View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backBtn: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -8,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  content: {
    padding: spacing.lg,
  },
  infoBox: {
    alignItems: "center",
    backgroundColor: colors.surfaceTeal,
    padding: spacing.lg,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
  },
  infoTitle: {
    ...typography.h3,
    color: colors.primaryDark,
    marginBottom: spacing.xs,
  },
  infoText: {
    ...typography.body,
    color: colors.primaryDark,
    textAlign: "center",
    opacity: 0.8,
    lineHeight: 22,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
    marginLeft: spacing.xs,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
  },
  label: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  subLabel: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.xs,
  },
  dangerText: {
    color: colors.error,
  },
});
