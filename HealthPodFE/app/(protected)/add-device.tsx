import React, { useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View, ScrollView, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { colors, radius, shadow, spacing } from "@/constants/design";
import { createDevice, getArduinoStatus, resetArduinoConnection } from "@/services/api";
import { routes } from "@/constants/routes";

export default function AddDeviceScreen() {
  const router = useRouter();
  const [serialNumber, setSerialNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!serialNumber.trim()) {
      Alert.alert("Missing Serial Number", "Please enter the device serial number.");
      return;
    }
    setLoading(true);
    try {
      await createDevice({ name: "HealthPod Dispenser", serialNumber: serialNumber.trim() });
      const result = await getArduinoStatus();
      setStatus(result?.isConnected ? "Connected" : "Disconnected");
      Alert.alert("Device Added", "Your HealthPod dispenser was saved.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("Add Device Failed", "Could not save device. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReconnect = async () => {
    setLoading(true);
    try {
      const result = await resetArduinoConnection();
      setStatus(result?.isConnected ? "Connected" : "Disconnected");
    } catch (error) {
      Alert.alert("Reconnect Failed", "Could not reconnect Arduino.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Add New Device</Text>
        <Text style={styles.subtitle}>Enter the serial number from your dispenser.</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Serial Number</Text>
          <TextInput
            placeholder="HPD-2026-001"
            value={serialNumber}
            onChangeText={setSerialNumber}
            style={styles.input}
            autoCapitalize="characters"
            placeholderTextColor={colors.textMuted}
          />
          <Pressable style={styles.primaryBtn} onPress={handleAdd} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={colors.lightText} />
            ) : (
              <Text style={styles.primaryText}>Add Device</Text>
            )}
          </Pressable>

          <Pressable style={styles.secondaryBtn} onPress={handleReconnect} disabled={loading}>
            <Text style={styles.secondaryText}>Reconnect Arduino</Text>
          </Pressable>

          {status ? <Text style={styles.status}>Status: {status}</Text> : null}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    fontSize: 14,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow.sm,
  },
  label: {
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
    color: colors.textPrimary,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    alignItems: "center",
  },
  primaryText: {
    color: colors.lightText,
    fontWeight: "600",
  },
  secondaryBtn: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    alignItems: "center",
  },
  secondaryText: {
    color: colors.primary,
    fontWeight: "600",
  },
  status: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
