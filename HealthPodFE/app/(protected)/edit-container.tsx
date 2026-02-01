import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View, Pressable, Alert, ScrollView, ActivityIndicator, SafeAreaView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, radius, shadow, spacing, typography } from "@/constants/design";
import { updateContainer, addMedication } from "@/services/api";

const ALL_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function EditContainerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const deviceId = params.deviceId as string;
  const containerNumber = parseInt(params.containerNumber as string, 10);
  const medId = params.medId as string || "";
  
  const [medName, setMedName] = useState(params.medName as string || "");
  const [dosage, setDosage] = useState(params.dosage as string || "");
  const [time, setTime] = useState(params.time as string || "09:00"); 
  const [days, setDays] = useState<string[]>(
    params.days ? (params.days as string).split(",").filter(Boolean) : [...ALL_DAYS]
  );
  const [loading, setLoading] = useState(false);

  const toggleDay = (day: string) => {
    if (days.includes(day)) {
      setDays(days.filter(d => d !== day));
    } else {
      setDays([...days, day]);
    }
  };

  const handleSave = async () => {
    if (!medName.trim()) {
      Alert.alert("Required", "Please enter medication name");
      return;
    }

    if (days.length === 0) {
      Alert.alert("Required", "Please select at least one day");
      return;
    }

    setLoading(true);
    try {
      const scheduleStr = days.length === 7 
        ? `Daily at ${time}` 
        : `${days.join(", ")} at ${time}`;

      // 1. Create/Update Medication record
      const medication = await addMedication({
        name: medName,
        dosage: dosage,
        schedule: scheduleStr,
        time: time,
        days: days,
        containerNumber: containerNumber,
        remaining: 30,
        total: 30,
        refillThreshold: 5,
      });
      
      // 2. Update device container
      await updateContainer(deviceId, containerNumber, {
        medicationId: medication.id,
        medicationName: medName,
        dosage: dosage,
        reminderTime: time,
        reminderDays: days,
        reminderEnabled: true
      });
      
      Alert.alert("Success", "Medication updated successfully", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error("[EditContainer] Error:", error);
      Alert.alert("Error", "Failed to update medication");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.title}>Edit Container {containerNumber}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Animated.View entering={FadeInDown.duration(400)} style={styles.form}>
            <View style={styles.containerBadge}>
              <View style={styles.badgeIcon}>
                <Text style={styles.badgeNumber}>{containerNumber}</Text>
              </View>
              <Text style={styles.badgeText}>Container {containerNumber} • Sensor C{containerNumber}</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Medication Name</Text>
              <TextInput
                value={medName}
                onChangeText={setMedName}
                style={styles.input}
                placeholder="e.g. Aspirin"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Dosage</Text>
              <TextInput
                value={dosage}
                onChangeText={setDosage}
                style={styles.input}
                placeholder="e.g. 500mg"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Reminder Time</Text>
              <TextInput
                value={time}
                onChangeText={setTime}
                style={styles.input}
                placeholder="e.g. 08:00"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Days</Text>
              <View style={styles.daysRow}>
                {ALL_DAYS.map((day) => {
                  const isSelected = days.includes(day);
                  return (
                    <Pressable 
                      key={day}
                      style={[styles.dayChip, isSelected && styles.dayChipSelected]}
                      onPress={() => toggleDay(day)}
                    >
                      <Text style={[styles.dayChipText, isSelected && styles.dayChipTextSelected]}>
                        {day}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <PrimaryButton
                title={loading ? "Saving..." : "Save Changes"}
                onPress={handleSave}
                disabled={loading}
                size="lg"
              />
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
    padding: spacing.lg,
    paddingBottom: spacing.sm,
  },
  backButton: {
    marginRight: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  form: {
    gap: spacing.lg,
  },
  containerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surfaceTeal,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
  },
  badgeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeNumber: {
    color: colors.lightText,
    fontWeight: "700",
    fontSize: 16,
  },
  badgeText: {
    ...typography.body,
    color: colors.primaryDark,
    fontWeight: "600",
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
  input: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    padding: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  daysRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  dayChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayChipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  dayChipTextSelected: {
    color: colors.lightText,
  },
  buttonContainer: {
    marginTop: spacing.md,
  },
});
