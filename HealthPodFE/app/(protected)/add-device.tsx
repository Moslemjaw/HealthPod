import React, { useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp, SlideInRight } from "react-native-reanimated";
import { colors, radius, shadow, spacing, typography } from "@/constants/design";
import { createDevice, getArduinoStatus, resetArduinoConnection, addMedication, updateContainer } from "@/services/api";
import { PrimaryButton } from "@/components/PrimaryButton";

type MedInput = {
  name: string;
  frequency: string;
  dosage: string;
  time: string;
};

export default function AddDeviceScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [serialNumber, setSerialNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  
  const [meds, setMeds] = useState<MedInput[]>([
    { name: "", frequency: "Daily", dosage: "1 pill", time: "08:00" },
    { name: "", frequency: "Daily", dosage: "1 pill", time: "13:00" },
    { name: "", frequency: "Daily", dosage: "1 pill", time: "18:00" },
  ]);

  const handleConnectDevice = async () => {
    if (!serialNumber.trim()) {
      Alert.alert("Missing Serial Number", "Please enter the device serial number.");
      return;
    }
    setLoading(true);
    try {
      const device = await createDevice({ name: "HealthPod Dispenser", serialNumber: serialNumber.trim() });
      console.log("[AddDevice] Device created:", device);
      setDeviceId(device.id);
      
      const result = await getArduinoStatus() as { isConnected: boolean };
      setStatus(result?.isConnected ? "Connected" : "Disconnected");
      
      setTimeout(() => {
        setStep(2);
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error("[AddDevice] Error creating device:", error);
      Alert.alert("Connection Failed", "Could not connect to device. Please check the serial number and try again.");
      setLoading(false);
    }
  };

  const handleUpdateMed = (index: number, field: keyof MedInput, value: string) => {
    const newMeds = [...meds];
    newMeds[index] = { ...newMeds[index], [field]: value };
    setMeds(newMeds);
  };

  const handleFinishSetup = async () => {
    // Validate at least one med is entered
    const validMeds = meds.filter(m => m.name.trim());
    if (validMeds.length === 0) {
      Alert.alert("No Medications", "Please add at least one medication.");
      return;
    }

    if (!deviceId) {
      Alert.alert("Device Error", "Device ID is missing. Please go back and reconnect.");
      return;
    }

    setLoading(true);
    try {
      console.log("[AddDevice] Starting medication setup for", validMeds.length, "medications");
      
      // Process medications sequentially to ensure they're saved properly
      for (let index = 0; index < meds.length; index++) {
        const med = meds[index];
        if (!med.name.trim()) {
          console.log(`[AddDevice] Skipping empty medication at index ${index}`);
          continue;
        }

        console.log(`[AddDevice] Processing medication ${index + 1}:`, med.name);

        // 1. Create Medication Record
        try {
          const createdMed = await addMedication({
            name: med.name.trim(),
            dosage: med.dosage.trim(),
            schedule: `${med.frequency} at ${med.time}`,
            remaining: 30,
            total: 30,
            refillThreshold: 5,
          });
          console.log(`[AddDevice] Medication created:`, createdMed);

          // 2. Associate with Device Container
          try {
            await updateContainer(deviceId, index + 1, {
              medicationName: med.name.trim(),
              dosage: med.dosage.trim(),
              reminderEnabled: true,
              reminderTime: med.time,
              stockLevel: "FULL"
            });
            console.log(`[AddDevice] Container ${index + 1} updated successfully`);
          } catch (containerError) {
            console.error(`[AddDevice] Error updating container ${index + 1}:`, containerError);
            Alert.alert("Warning", `Medication "${med.name}" was saved but container ${index + 1} update failed.`);
          }
        } catch (medError) {
          console.error(`[AddDevice] Error creating medication "${med.name}":`, medError);
          Alert.alert("Error", `Failed to save medication "${med.name}". Please try again.`);
        }
      }

      console.log("[AddDevice] Setup complete!");
      Alert.alert("Setup Complete", "Your device and medications are ready!", [
        { text: "Go to Dashboard", onPress: () => router.replace("/(protected)/(tabs)") }
      ]);
    } catch (error) {
      console.error("[AddDevice] Setup error:", error);
      Alert.alert("Setup Error", "Some medications could not be saved. Please check your internet connection.");
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
            placeholder="e.g. HPD-2026-001"
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
          Add the medications you will place in the dispenser's 3 containers.
        </Text>
      </View>

      {meds.map((med, index) => (
        <View key={index} style={styles.medCard}>
          <View style={styles.medCardHeader}>
            <View style={styles.containerBadge}>
              <Text style={styles.containerBadgeText}>{index + 1}</Text>
            </View>
            <Text style={styles.medCardTitle}>Container {index + 1}</Text>
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
        </View>
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
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.md,
  },
  footer: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
});
