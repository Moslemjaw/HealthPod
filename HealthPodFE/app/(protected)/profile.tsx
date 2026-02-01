import React from "react";
import { StyleSheet, Text, View, ScrollView, SafeAreaView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { colors, radius, shadow, spacing, gradients, typography } from "@/constants/design";
import { useHealth } from "@/context/HealthContext";

const ProfileRow = ({ icon, label, value, color = colors.primary, bg = colors.surfaceTeal }: {
  icon: string;
  label: string;
  value: string;
  color?: string;
  bg?: string;
}) => (
  <View style={styles.profileRow}>
    <View style={[styles.profileRowIcon, { backgroundColor: bg }]}>
      <Ionicons name={icon as any} size={20} color={color} />
    </View>
    <View style={styles.profileRowContent}>
      <Text style={styles.profileRowLabel}>{label}</Text>
      <Text style={styles.profileRowValue}>{value}</Text>
    </View>
  </View>
);

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useHealth();

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
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={{ width: 40 }} />
        </Animated.View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Animated.View 
            entering={FadeInDown.delay(100).duration(500)} 
            style={styles.avatarSection}
          >
            <View style={styles.avatarContainer}>
              <LinearGradient colors={gradients.primary} style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(user?.name || "H").charAt(0).toUpperCase()}
                </Text>
              </LinearGradient>
              <Pressable style={styles.cameraBtn}>
                <Ionicons name="camera" size={16} color={colors.lightText} />
              </Pressable>
            </View>
            <Text style={styles.userName}>{user?.name || "HealthPod User"}</Text>
            <Text style={styles.userEmail}>{user?.email || "user@healthpod.app"}</Text>
          </Animated.View>

          <Animated.View 
            entering={FadeInUp.delay(200).duration(500).springify()} 
            style={styles.formSection}
          >
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <View style={styles.card}>
              <ProfileRow 
                icon="person" 
                label="Full Name" 
                value={user?.name || "Not set"}
                color={colors.accentPurple}
                bg={colors.surfacePurple}
              />
              <View style={styles.divider} />
              <ProfileRow 
                icon="mail" 
                label="Email" 
                value={user?.email || "Not set"}
                color={colors.accentBlue}
                bg={colors.surfaceBlue}
              />
              <View style={styles.divider} />
              {user?.gender && (
                <ProfileRow 
                  icon={user.gender === "Male" ? "male" : user.gender === "Female" ? "female" : "person"}
                  label="Gender" 
                  value={user.gender}
                  color={colors.accentPink}
                  bg={colors.surfacePink}
                />
              )}
            </View>

            {(user?.height || user?.weight) && (
              <>
                <Text style={styles.sectionTitle}>Body Metrics</Text>
                <View style={styles.metricsRow}>
                  {user?.height && (
                    <View style={styles.metricCard}>
                      <View style={[styles.metricIcon, { backgroundColor: colors.surfaceTeal }]}>
                        <Ionicons name="resize-outline" size={20} color={colors.primary} />
                      </View>
                      <Text style={styles.metricValue}>{user.height}</Text>
                      <Text style={styles.metricUnit}>cm</Text>
                      <Text style={styles.metricLabel}>Height</Text>
                    </View>
                  )}
                  {user?.weight && (
                    <View style={styles.metricCard}>
                      <View style={[styles.metricIcon, { backgroundColor: colors.surfacePurple }]}>
                        <Ionicons name="barbell-outline" size={20} color={colors.accentPurple} />
                      </View>
                      <Text style={styles.metricValue}>{user.weight}</Text>
                      <Text style={styles.metricUnit}>kg</Text>
                      <Text style={styles.metricLabel}>Weight</Text>
                    </View>
                  )}
                </View>
              </>
            )}

            <Pressable style={styles.editBtn}>
              <Text style={styles.editBtnText}>Edit Profile</Text>
            </Pressable>
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
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.glow,
  },
  avatarText: {
    ...typography.hero,
    color: colors.lightText,
    fontSize: 40,
  },
  cameraBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryDark,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.background,
  },
  userName: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  userEmail: {
    ...typography.body,
    color: colors.textSecondary,
  },
  formSection: {
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textMuted,
    letterSpacing: 1,
    marginLeft: spacing.xs,
    marginTop: spacing.sm,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow.sm,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  profileRowIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  profileRowContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  profileRowLabel: {
    ...typography.small,
    color: colors.textSecondary,
  },
  profileRowValue: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    marginTop: 2,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginLeft: 56, // Align with text start
  },
  metricsRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: "center",
    ...shadow.sm,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  metricValue: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  metricUnit: {
    ...typography.small,
    color: colors.textMuted,
    marginTop: -4,
    marginBottom: spacing.xs,
  },
  metricLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  editBtn: {
    backgroundColor: colors.surfaceAlt,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: "center",
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  editBtnText: {
    ...typography.bodyMedium,
    color: colors.primary,
    fontWeight: "600",
  },
});
