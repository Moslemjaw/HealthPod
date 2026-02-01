import React, { useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View, ScrollView, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, radius, shadow, spacing } from "@/constants/design";
import { routes } from "@/constants/routes";
import { useHealth } from "@/context/HealthContext";
import { createDevice } from "@/services/api";

type MedicationInput = {
  name: string;
  dosage: string;
  schedule: string;
};

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
      { text: "OK", onPress: () => router.replace(routes.tabs) },
    ]);
  };

  if (step === "serial") {
    return (
      <View style={styles.container}>
        <LinearGradient colors={["#1A1F3A", "#1A1F3A"]} style={styles.header}>
          <SafeAreaView>
            <View style={styles.headerContent}>
              <Text style={styles.title}>Enter Serial Number</Text>
              <Text style={styles.subtitle}>Find the serial number on your HealthPod dispenser</Text>
            </View>
          </SafeAreaView>
        </LinearGradient>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <Text style={styles.label}>Serial Number *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="barcode-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                placeholder="HPD-2026-001"
                value={serialNumber}
                onChangeText={setSerialNumber}
                style={styles.input}
                autoCapitalize="characters"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <PrimaryButton
              title="Continue"
              onPress={handleSerialSubmit}
            />
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#1A1F3A", "#1A1F3A"]} style={styles.header}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Add Medications</Text>
            <Text style={styles.subtitle}>Configure medications for cartridges C1, C2, and C3</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.card}>
          {medications.map((med, index) => (
            <View key={index} style={styles.medicationCard}>
              <View style={styles.cartridgeHeader}>
                <View style={styles.cartridgeBadge}>
                  <Text style={styles.cartridgeText}>C{index + 1}</Text>
                </View>
                <Text style={styles.cartridgeLabel}>Cartridge {index + 1}</Text>
              </View>

              <Text style={styles.label}>Medication Name *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="medical-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  placeholder="e.g., Metformin"
                  value={med.name}
                  onChangeText={(text) => {
                    const updated = [...medications];
                    updated[index].name = text;
                    setMedications(updated);
                  }}
                  style={styles.input}
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <Text style={styles.label}>Dosage *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="flask-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  placeholder="e.g., 500mg"
                  value={med.dosage}
                  onChangeText={(text) => {
                    const updated = [...medications];
                    updated[index].dosage = text;
                    setMedications(updated);
                  }}
                  style={styles.input}
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <Text style={styles.label}>Schedule (Optional)</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="time-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  placeholder="e.g., 8:00 AM • Daily"
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
          ))}

          <PrimaryButton
            title="Complete Setup"
            onPress={handleMedicationsSubmit}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  headerContent: {
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.lightText,
    marginTop: spacing.sm,
  },
  subtitle: {
    marginTop: 6,
    color: "#CBD5E1",
    fontSize: 14,
    textAlign: "center",
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  card: {
    marginTop: -30,
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    paddingTop: spacing.xl,
    ...shadow.card,
  },
  label: {
    fontWeight: "600",
    marginBottom: spacing.xs,
    marginTop: spacing.md,
    color: colors.textPrimary,
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
  },
  inputIcon: {
    marginRight: spacing.xs,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
    fontSize: 16,
  },
  medicationCard: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cartridgeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  cartridgeBadge: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    marginRight: spacing.sm,
  },
  cartridgeText: {
    color: colors.lightText,
    fontWeight: "700",
    fontSize: 12,
  },
  cartridgeLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
});

