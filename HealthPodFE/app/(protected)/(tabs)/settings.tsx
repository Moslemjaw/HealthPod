import React from "react";
import { Pressable, StyleSheet, Text, View, ScrollView, SafeAreaView, Alert, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import * as ImagePicker from "expo-image-picker";
import { colors, radius, shadow, spacing, gradients, typography } from "@/constants/design";
import { routes } from "@/constants/routes";
import { useHealth } from "@/context/HealthContext";

type SettingRowProps = {
  icon: string;
  label: string;
  onPress?: () => void;
  badge?: string;
  color?: string;
  bg?: string;
  danger?: boolean;
};

const SettingRow = ({ icon, label, onPress, badge, color = colors.primary, bg = colors.surfaceTeal, danger = false }: SettingRowProps) => (
  <Pressable style={styles.row} onPress={onPress}>
    <View style={[styles.rowIcon, { backgroundColor: danger ? colors.lightRed : bg }]}>
      <Ionicons name={icon as any} size={20} color={danger ? colors.error : color} />
    </View>
    <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>{label}</Text>
    {badge ? (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{badge}</Text>
      </View>
    ) : (
      <Ionicons name="chevron-forward" size={20} color={danger ? colors.error : colors.textMuted} />
    )}
  </Pressable>
);

export default function SettingsScreen() {
  const router = useRouter();
  const { user, signOut, streak, updateProfile } = useHealth();

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        updateProfile({ avatarUri: result.assets[0].uri });
      }
    } catch (error) {
      Alert.alert("Error", "Could not select image.");
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out? Your data will be saved.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Sign Out", 
          style: "destructive",
          onPress: async () => {
            await signOut();
            router.replace(routes.onboarding);
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView 
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View entering={FadeInDown.duration(500)}>
            <Text style={styles.title}>Settings</Text>
          </Animated.View>

          {/* Profile Card */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)}>
            <Pressable style={styles.profileCard} onPress={() => router.push(routes.profile)}>
              <Pressable onPress={handlePickImage} style={styles.avatarContainer}>
                {user?.avatarUri ? (
                  <Image source={{ uri: user.avatarUri }} style={styles.avatarImage} />
                ) : (
                  <LinearGradient
                    colors={gradients.primary}
                    style={styles.avatar}
                  >
                    <Text style={styles.avatarText}>
                      {(user?.name || "A").charAt(0).toUpperCase()}
                    </Text>
                  </LinearGradient>
                )}
                <View style={styles.editBadge}>
                  <Ionicons name="camera" size={10} color="white" />
                </View>
              </Pressable>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user?.name || "HealthPod User"}</Text>
                <Text style={styles.profileEmail}>{user?.email || "user@healthpod.app"}</Text>
                <View style={styles.streakBadge}>
                  <Ionicons name="flame" size={14} color={colors.warning} />
                  <Text style={styles.streakText}>{streak.currentStreak} day streak</Text>
                </View>
              </View>
              <View style={styles.profileArrow}>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </View>
            </Pressable>
          </Animated.View>

          {/* Account Section */}
          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <Text style={styles.sectionLabel}>ACCOUNT</Text>
            <View style={styles.section}>
              <SettingRow 
                icon="person-outline" 
                label="Profile" 
                onPress={() => router.push(routes.profile)}
                color={colors.accentPurple}
                bg={colors.surfacePurple}
              />
              <SettingRow 
                icon="notifications-outline" 
                label="Notifications"
                onPress={() => router.push(routes.notifications)}
                color={colors.accentOrange}
                bg={colors.surfaceOrange}
              />
              <SettingRow 
                icon="shield-checkmark-outline" 
                label="Privacy"
                onPress={() => router.push(routes.privacy)}
                color={colors.accentBlue}
                bg={colors.surfaceBlue}
              />
            </View>
          </Animated.View>

          {/* Devices Section */}
          <Animated.View entering={FadeInDown.delay(300).duration(500)}>
            <Text style={styles.sectionLabel}>DEVICES</Text>
            <View style={styles.section}>
              <SettingRow 
                icon="watch-outline" 
                label="Connected Devices"
                onPress={() => router.push(routes.wearables)}
                badge="2"
              />
              <SettingRow 
                icon="add-circle-outline" 
                label="Add New Device"
                onPress={() => router.push(routes.addDevice)}
              />
            </View>
          </Animated.View>

          {/* Support Section */}
          <Animated.View entering={FadeInUp.delay(400).duration(500)}>
            <Text style={styles.sectionLabel}>SUPPORT</Text>
            <View style={styles.section}>
              <SettingRow 
                icon="chatbubbles-outline" 
                label="AI Health Assistant"
                onPress={() => router.push(routes.chat)}
                color={colors.accentPurple}
                bg={colors.surfacePurple}
              />
              <SettingRow 
                icon="help-circle-outline" 
                label="Help Center"
                onPress={() => router.push(routes.support)}
                color={colors.accentBlue}
                bg={colors.surfaceBlue}
              />
            </View>
          </Animated.View>

          {/* Sign Out Section */}
          <Animated.View entering={FadeInUp.delay(500).duration(500)}>
            <Text style={styles.sectionLabel}>SESSION</Text>
            <View style={styles.section}>
              <SettingRow 
                icon="log-out-outline" 
                label="Sign Out"
                onPress={handleLogout}
                danger
              />
            </View>
          </Animated.View>

          {/* App Info */}
          <Animated.View 
            entering={FadeInUp.delay(600).duration(500)}
            style={styles.appInfo}
          >
            <Text style={styles.appVersion}>HealthPod v1.0.0</Text>
            <Text style={styles.appCopy}>Made with ❤️ for your health</Text>
          </Animated.View>

          <View style={{ height: 120 }} />
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
  content: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.xl,
    ...shadow.md,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.card,
  },
  avatarText: {
    ...typography.h2,
    color: colors.lightText,
  },
  profileInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  profileName: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  profileEmail: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: 2,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
    marginTop: spacing.xs,
    backgroundColor: colors.lightYellow,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.full,
    alignSelf: "flex-start",
  },
  streakText: {
    ...typography.tiny,
    color: colors.warning,
    fontWeight: "600",
  },
  profileArrow: {
    padding: spacing.xs,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
    marginLeft: spacing.xs,
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.xs,
    marginBottom: spacing.md,
    ...shadow.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
    borderRadius: radius.md,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    flex: 1,
    ...typography.bodyMedium,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  rowLabelDanger: {
    color: colors.error,
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    minWidth: 28,
    alignItems: "center",
  },
  badgeText: {
    ...typography.tiny,
    color: colors.lightText,
    fontWeight: "700",
  },
  appInfo: {
    alignItems: "center",
    marginTop: spacing.xl,
  },
  appVersion: {
    ...typography.small,
    color: colors.textMuted,
  },
  appCopy: {
    ...typography.small,
    color: colors.textMuted,
    marginTop: spacing.xxs,
  },
});
