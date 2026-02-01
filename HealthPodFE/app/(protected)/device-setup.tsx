import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View, ScrollView, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, radius, shadow, spacing, gradients, typography } from "@/constants/design";
import { routes } from "@/constants/routes";
import { useHealth } from "@/context/HealthContext";
import { createDevice } from "@/services/api";

type MedicationInput = {
  name: string;
  dosage: string;
  schedule: string;
};

const cartridgeColors = [colors.primary, colors.accentPurple, colors.accentBlue];

export default function DeviceSetupScreen() {
  const router = useRouter();
  const { addMedication, updateProfile } = useHealth();
  const [step, setStep] = useState<"serial" | "medications">("serial");
  const [serialNumber, setSerialNumber] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [medications, setMedications] = useState<MedicationInput[]>([
    { name: "", dosage: "", schedule: "" },
    { name: "", dosage: "", schedule: "" },
    { name: "", dosage: "", schedule: "" },
  ]);

  const handleSerialSubmit = async () => {
    if (!serialNumber.trim()) {
      Alert.alert("Missing Serial Number", "Please enter the device serial number.");
      return;
    }
    setLoading(true);
    try {
      await createDevice({ name: "HealthPod Dispenser", serialNumber: serialNumber.trim() });
      setStep("medications");
    } catch (error) {
      Alert.alert("Add Device Failed", "Could not save device. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleMedicationsSubmit = () => {
    const validMeds = medications.filter((m) => m.name.trim() && m.dosage.trim());
    
    if (validMeds.length === 0) {
      Alert.alert("Missing Medications", "Please add at least one medication.");
      return;
    }

    validMeds.forEach((med, index) => {
      addMedication({
        name: med.name.trim(),
        dosage: med.dosage.trim(),
        schedule: med.schedule.trim() || "Daily",
        remaining: 30,
        total: 30,
        cartridge: index === 0 ? "C1" : index === 1 ? "C2" : "C3",
      });
    });

    updateProfile({ deviceSetupComplete: true });
    Alert.alert("Setup Complete", "Your HealthPod dispenser is ready!", [
      { text: "Let's Go!", onPress: () => router.replace(routes.tabs) },
    ]);
  };

  if (step === "serial") {
    return (
      <View style={styles.container}>
        <LinearGradient colors={gradients.dark} style={styles.header}>
          <SafeAreaView>
            <Animated.View 
              entering={FadeInDown.duration(500)} 
              style={styles.headerContent}
            >
              <View style={styles.progressRow}>
                <View style={[styles.progressDot, styles.progressDotDone]} />
                <View style={[styles.progressLine, styles.progressLineDone]} />
                <View style={[styles.progressDot, styles.progressDotDone]} />
                <View style={[styles.progressLine, styles.progressLineDone]} />
                <View style={[styles.progressDot, styles.progressDotActive]} />
              </View>
              <Text style={styles.stepLabel}>Step 3 of 3</Text>
              <Text style={styles.title}>Connect Device</Text>
              <Text style={styles.subtitle}>Enter the serial number from your dispenser</Text>
            </Animated.View>
          </SafeAreaView>
        </LinearGradient>

        <Animated.View 
          entering={FadeInUp.delay(200).duration(500).springify()} 
          style={styles.card}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Device Illustration */}
            <View style={styles.deviceIllustration}>
              <View style={styles.deviceBox}>
                <Ionicons name="cube" size={48} color={colors.primary} />
              </View>
              <Text style={styles.deviceLabel}>HealthPod Dispenser</Text>
            </View>

            <Text style={styles.label}>Serial Number</Text>
            <View style={styles.inputContainer}>
              <View style={styles.inputIconBox}>
                <Ionicons name="barcode-outline" size={20} color={colors.textMuted} />
              </View>
              <TextInput
                placeholder="HPD-2026-XXXXX"
                value={serialNumber}
                onChangeText={setSerialNumber}
                style={styles.input}
                autoCapitalize="characters"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.helpCard}>
              <Ionicons name="help-circle" size={20} color={colors.accentBlue} />
              <Text style={styles.helpText}>
                Find the serial number on the bottom of your device or on the packaging
              </Text>
            </View>

            <View style={styles.actions}>
              <PrimaryButton 
                title={loading ? "Connecting..." : "Connect Device"} 
                size="lg" 
                onPress={handleSerialSubmit}
                disabled={loading}
              />
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={gradients.dark} style={styles.header}>
        <SafeAreaView>
          <Animated.View 
            entering={FadeInDown.duration(500)} 
            style={styles.headerContent}
          >
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={32} color={colors.success} />
            </View>
            <Text style={styles.title}>Device Connected!</Text>
            <Text style={styles.subtitle}>Now add your medications to the cartridges</Text>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>

      <Animated.View 
        entering={FadeInUp.delay(200).duration(500).springify()} 
        style={styles.card}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {medications.map((med, index) => (
            <Animated.View 
              key={index}
              entering={FadeInDown.delay(300 + index * 100).duration(400)}
              style={styles.cartridgeCard}
            >
              <View style={styles.cartridgeHeader}>
                <View style={[styles.cartridgeBadge, { backgroundColor: cartridgeColors[index] }]}>
                  <Text style={styles.cartridgeNumber}>C{index + 1}</Text>
                </View>
                <Text style={styles.cartridgeTitle}>Cartridge {index + 1}</Text>
                {med.name.trim() && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                )}
              </View>

              <View style={styles.cartridgeInputs}>
                <View style={styles.inputRow}>
                  <View style={[styles.inputContainer, styles.inputFlex]}>
                    <TextInput
                      placeholder="Medication name"
                      value={med.name}
                      onChangeText={(text) => {
                        const updated = [...medications];
                        updated[index].name = text;
                        setMedications(updated);
                      }}
                      style={styles.inputSmall}
                      placeholderTextColor={colors.textMuted}
                    />
                  </View>
                  <View style={[styles.inputContainer, { width: 100 }]}>
                    <TextInput
                      placeholder="Dosage"
                      value={med.dosage}
                      onChangeText={(text) => {
                        const updated = [...medications];
                        updated[index].dosage = text;
                        setMedications(updated);
                      }}
                      style={styles.inputSmall}
                      placeholderTextColor={colors.textMuted}
                    />
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <View style={styles.inputIconBox}>
                    <Ionicons name="time-outline" size={18} color={colors.textMuted} />
                  </View>
                  <TextInput
                    placeholder="Schedule (e.g., 8:00 AM • Daily)"
                    value={med.schedule}
                    onChangeText={(text) => {
                      const updated = [...medications];
                      updated[index].schedule = text;
                      setMedications(updated);
                    }}
                    style={styles.input}
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>
            </Animated.View>
          ))}

          <View style={styles.actions}>
            <PrimaryButton
              title="Complete Setup"
              size="lg"
              onPress={handleMedicationsSubmit}
            />
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  headerContent: {
    alignItems: "center",
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  progressDotActive: {
    backgroundColor: colors.primary,
  },
  progressDotDone: {
    backgroundColor: colors.success,
  },
  progressLine: {
    width: 40,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: spacing.xs,
  },
  progressLineDone: {
    backgroundColor: colors.success,
  },
  stepLabel: {
    ...typography.caption,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  successIcon: {
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h1,
    color: colors.lightText,
    textAlign: "center",
  },
  subtitle: {
    ...typography.body,
    color: colors.textLight,
    opacity: 0.8,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  card: {
    flex: 1,
    marginTop: -spacing.xl,
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    padding: spacing.xl,
    ...shadow.lg,
  },
  deviceIllustration: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  deviceBox: {
    width: 100,
    height: 100,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceTeal,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  deviceLabel: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  label: {
    ...typography.small,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.md,
  },
  inputIconBox: {
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingRight: spacing.md,
    color: colors.textPrimary,
    fontSize: 16,
  },
  inputSmall: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    color: colors.textPrimary,
    fontSize: 15,
  },
  inputFlex: {
    flex: 1,
    marginRight: spacing.sm,
  },
  inputRow: {
    flexDirection: "row",
    marginBottom: spacing.sm,
  },
  helpCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surfaceBlue,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  helpText: {
    flex: 1,
    ...typography.small,
    color: colors.accentBlue,
  },
  cartridgeCard: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cartridgeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  cartridgeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.sm,
    marginRight: spacing.sm,
  },
  cartridgeNumber: {
    ...typography.caption,
    fontWeight: "700",
    color: colors.lightText,
  },
  cartridgeTitle: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    flex: 1,
  },
  cartridgeInputs: {},
  actions: {
    marginTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
});
