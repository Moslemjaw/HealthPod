import React, { useState } from "react";
import { StyleSheet, Switch, Text, View, Pressable, ScrollView, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { colors, radius, shadow, spacing, typography } from "@/constants/design";

export default function NotificationsScreen() {
  const router = useRouter();
  const [medReminders, setMedReminders] = useState(true);
  const [deviceAlerts, setDeviceAlerts] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(false);
  const [news, setNews] = useState(false);

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
          <Text style={styles.title}>Notifications</Text>
          <View style={{ width: 40 }} />
        </Animated.View>

        <ScrollView contentContainerStyle={styles.content}>
          <Animated.View entering={FadeInDown.delay(100).duration(500)}>
            <Text style={styles.sectionTitle}>Alerts & Reminders</Text>
            <View style={styles.card}>
              <View style={styles.row}>
                <View style={styles.rowInfo}>
                  <Text style={styles.label}>Medication Reminders</Text>
                  <Text style={styles.subLabel}>Get alerts when it's time to take meds</Text>
                </View>
                <Switch 
                  value={medReminders} 
                  onValueChange={setMedReminders}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.card}
                />
              </View>
              <View style={styles.divider} />
              <View style={styles.row}>
                <View style={styles.rowInfo}>
                  <Text style={styles.label}>Device Alerts</Text>
                  <Text style={styles.subLabel}>Low battery and connection issues</Text>
                </View>
                <Switch 
                  value={deviceAlerts} 
                  onValueChange={setDeviceAlerts}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.card}
                />
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <Text style={styles.sectionTitle}>Updates</Text>
            <View style={styles.card}>
              <View style={styles.row}>
                <View style={styles.rowInfo}>
                  <Text style={styles.label}>Order Updates</Text>
                  <Text style={styles.subLabel}>Shipping and delivery status</Text>
                </View>
                <Switch 
                  value={orderUpdates} 
                  onValueChange={setOrderUpdates}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.card}
                />
              </View>
              <View style={styles.divider} />
              <View style={styles.row}>
                <View style={styles.rowInfo}>
                  <Text style={styles.label}>Health Tips & News</Text>
                  <Text style={styles.subLabel}>Weekly insights for better health</Text>
                </View>
                <Switch 
                  value={news} 
                  onValueChange={setNews}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.card}
                />
              </View>
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
  rowInfo: {
    flex: 1,
    paddingRight: spacing.md,
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
});
