import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View, Pressable, KeyboardAvoidingView, Platform, Alert, ScrollView, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, radius, shadow, spacing, typography } from "@/constants/design";
import { updateContainer, getDevices } from "@/services/api";

export default function EditContainerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const deviceId = params.deviceId as string;
  const containerNumber = parseInt(params.containerNumber as string, 10);
  
  const [medName, setMedName] = useState(params.medName as string || "");
  const [dosage, setDosage] = useState(params.dosage as string || "");
  // Try to extract time from schedule if possible, or default
  const [time, setTime] = useState(""); 
  const [loading, setLoading] = useState(false);

  // Initialize time from passed schedule if it exists
  React.useEffect(() => {
    if (params.schedule) {
      // Very naive parser: looks for a time like "08:00"
      const match = (params.schedule as string).match(/\d{2}:\d{2}/);
      if (match) setTime(match[0]);
    }
  }, [params.schedule]);

  const handleSave = async () => {
    if (!medName.trim()) {
      Alert.alert("Required", "Please enter medication name");
      return;
    }

    setLoading(true);
    try {
      await updateContainer(deviceId, containerNumber, {
        medicationName: medName,
        dosage: dosage,
        reminderTime: time,
        reminderEnabled: !!time
      });
      
      Alert.alert("Success", "Container updated successfully", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to update container");
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
          <View style={styles.form}>
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

            <PrimaryButton
              title={loading ? "Saving..." : "Save Changes"}
              onPress={handleSave}
              disabled={loading}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

import { SafeAreaView } from "react-native-safe-area-context";

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
  input: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    padding: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
