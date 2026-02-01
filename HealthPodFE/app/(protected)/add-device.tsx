import React, { useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp, SlideInRight } from "react-native-reanimated";
import { colors, radius, shadow, spacing, typography } from "@/constants/design";
import { createDevice, getArduinoStatus, addMedication, updateContainer } from "@/services/api";
import { PrimaryButton } from "@/components/PrimaryButton";

const ALL_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type MedInput = {
  name: string;
  dosage: string;
  time: string;
  days: string[];
};

export default function AddDeviceScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [serialNumber, setSerialNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  
  const [meds, setMeds] = useState<MedInput[]>([
    { name: "", dosage: "1 pill", time: "08:00", days: [...ALL_DAYS] },
    { name: "", dosage: "1 pill", time: "13:00", days: [...ALL_DAYS] },
    { name: "", dosage: "1 pill", time: "18:00", days: [...ALL_DAYS] },
  ]);

  const handleConnectDevice = async () => {
    if (!serialNumber.trim()) {
      Alert.alert("Missing Serial Number", "Please enter the device serial number.");
      return;
    }
    setLoading(true);
    try {
      const device = await createDevice({ name: "HealthPod Dispenser", serialNumber: serialNumber.trim() });
      console.log("[AddDevice] Device created:", device.id);
      setDeviceId(device.id);
      
      const result = await getArduinoStatus() as { isConnected: boolean };
      setStatus(result?.isConnected ? "Connected" : "Disconnected");
      
      // Move to step 2 after a short delay
      setTimeout(() => {
        setStep(2);
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error("[AddDevice] Connection failed:", error);
      Alert.alert("Connection Failed", "Could not connect to device. Please check the serial number and try again.");
      setLoading(false);
    }
  };

  const handleUpdateMed = (index: number, field: keyof MedInput, value: string | string[]) => {
    const newMeds = [...meds];
    newMeds[index] = { ...newMeds[index], [field]: value };
    setMeds(newMeds);
  };

  const toggleDay = (index: number, day: string) => {
    const currentDays = meds[index].days;
    if (currentDays.includes(day)) {
      handleUpdateMed(index, "days", currentDays.filter(d => d !== day));
    } else {
      handleUpdateMed(index, "days", [...currentDays, day]);
    }
  };

  const handleFinishSetup = async () => {
    // Validate at least one medication is filled
    const filledMeds = meds.filter(med => med.name.trim());
    if (filledMeds.length === 0) {
      Alert.alert("Missing Medications", "Please add at least one medication.");
      return;
    }

    setLoading(true);
    console.log("[AddDevice] Starting setup for", filledMeds.length, "medications");
    
    try {
      // Process each medication sequentially to avoid race conditions
      for (let index = 0; index < meds.length; index++) {
        const med = meds[index];
        if (!med.name.trim()) {
          console.log("[AddDevice] Skipping empty container", index + 1);
          continue;
        }

        console.log("[AddDevice] Creating medication:", med.name, "for container", index + 1);

        // 1. Create Medication Record
        const scheduleStr = med.days.length === 7 
          ? `Daily at ${med.time}` 
          : `${med.days.join(", ")} at ${med.time}`;
        
        const createdMed = await addMedication({
          name: med.name,
          dosage: med.dosage,
          schedule: scheduleStr,
          time: med.time,
          days: med.days,
          containerNumber: index + 1,
          remaining: 30,
          total: 30,
          refillThreshold: 5,
        });
        console.log("[AddDevice] Medication created:", createdMed.id);

        // 2. Associate with Device Container
        if (deviceId) {
          console.log("[AddDevice] Updating container", index + 1, "for device", deviceId);
          await updateContainer(deviceId, index + 1, {
            medicationId: createdMed.id,
            medicationName: med.name,
            dosage: med.dosage,
            reminderTime: med.time,
            reminderDays: med.days,
            reminderEnabled: true,
            stockLevel: "FULL"
          });
          console.log("[AddDevice] Container updated successfully");
        }
      }

      console.log("[AddDevice] Setup complete!");
      Alert.alert("Setup Complete", "Your device and medications are ready!", [
        { text: "Go to Dashboard", onPress: () => router.replace("/(protected)/(tabs)") }
      ]);
    } catch (error) {
      console.error("[AddDevice] Setup error:", error);
      Alert.alert("Setup Error", "Some medications could not be saved. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <Animated.View entering={FadeInDown.duration(500)} style={styles.stepContainer}>
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="hardware-chip-outline" size={48} color={colors.primary} />
        </View>
        <Text style={styles.heroTitle}>Connect your HealthPod</Text>
        <Text style={styles.heroSub}>
          Enter the serial number found on the back of your device to pair it.
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Serial Number</Text>
          <TextInput
            placeholder="e.g. 115200"
            value={serialNumber}
            onChangeText={setSerialNumber}
            style={styles.input}
            autoCapitalize="characters"
            placeholderTextColor={colors.textMuted}
            editable={!loading}
          />
        </View>

        <PrimaryButton 
          title={loading ? "Connecting..." : "Connect Device"}
          onPress={handleConnectDevice}
          disabled={loading}
          size="lg"
        />
        
        {status && (
           <Text style={[styles.statusText, status === "Connected" ? styles.textSuccess : styles.textError]}>
             Status: {status}
           </Text>
        )}
      </View>
    </Animated.View>
  );

  const renderStep2 = () => (
    <Animated.View entering={SlideInRight.duration(500)} style={styles.stepContainer}>
      <View style={styles.headerTextContainer}>
        <Text style={styles.heroTitle}>Setup Medications</Text>
        <Text style={styles.heroSub}>
          Add the medications you will place in each container.
        </Text>
      </View>

      {meds.map((med, index) => (
        <Animated.View 
          key={index} 
          entering={FadeInUp.delay(index * 100).duration(400)}
          style={styles.medCard}
        >
          <View style={styles.medCardHeader}>
            <View style={styles.containerBadge}>
              <Text style={styles.containerBadgeText}>{index + 1}</Text>
            </View>
            <Text style={styles.medCardTitle}>Container {index + 1}</Text>
            <View style={[styles.sensorBadge, { backgroundColor: colors.surfaceTeal }]}>
              <Text style={styles.sensorText}>C{index + 1}</Text>
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Medication Name</Text>
            <TextInput
              placeholder="e.g. Vitamin C"
              value={med.name}
              onChangeText={(text) => handleUpdateMed(index, "name", text)}
              style={styles.input}
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Dosage</Text>
              <TextInput
                placeholder="e.g. 1 pill"
                value={med.dosage}
                onChangeText={(text) => handleUpdateMed(index, "dosage", text)}
                style={styles.input}
                placeholderTextColor={colors.textMuted}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Time</Text>
              <TextInput
                placeholder="e.g. 08:00"
                value={med.time}
                onChangeText={(text) => handleUpdateMed(index, "time", text)}
                style={styles.input}
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>

          {/* Days Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Days</Text>
            <View style={styles.daysRow}>
              {ALL_DAYS.map((day) => {
                const isSelected = med.days.includes(day);
                return (
                  <Pressable 
                    key={day}
                    style={[styles.dayChip, isSelected && styles.dayChipSelected]}
                    onPress={() => toggleDay(index, day)}
                  >
                    <Text style={[styles.dayChipText, isSelected && styles.dayChipTextSelected]}>
                      {day}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Animated.View>
      ))}

      <View style={styles.footer}>
        <PrimaryButton 
          title={loading ? "Saving Setup..." : "Finish Setup"}
          onPress={handleFinishSetup}
          disabled={loading}
          size="lg"
        />
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable style={styles.backBtn} onPress={() => step === 1 ? router.back() : setStep(1)}>
              <Ionicons name={step === 1 ? "close" : "arrow-back"} size={24} color={colors.textPrimary} />
            </Pressable>
            <Text style={styles.title}>
              {step === 1 ? "Add Device" : "Configure Meds"}
            </Text>
            <View style={{ width: 48 }} />
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            {step === 1 ? renderStep1() : renderStep2()}
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardView: {
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
    paddingBottom: spacing.xxl,
  },
  stepContainer: {
    gap: spacing.lg,
  },
  hero: {
    alignItems: "center",
    marginVertical: spacing.xl,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: radius.xxl,
    backgroundColor: colors.surfaceTeal,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  heroTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  heroSub: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: spacing.sm,
  },
  headerTextContainer: {
    alignItems: "center",
    marginBottom: spacing.md,
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
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
  },
  statusText: {
    textAlign: "center",
    fontWeight: "600",
    marginTop: spacing.sm,
  },
  textSuccess: {
    color: colors.success,
  },
  textError: {
    color: colors.error,
  },
  medCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow.sm,
  },
  medCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  containerBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  containerBadgeText: {
    color: colors.lightText,
    fontWeight: "700",
    fontSize: 14,
  },
  medCardTitle: {
    ...typography.h3,
    fontSize: 16,
    color: colors.textPrimary,
    flex: 1,
  },
  sensorBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  sensorText: {
    ...typography.tiny,
    fontWeight: "700",
    color: colors.primaryDark,
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.md,
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
  footer: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
});
