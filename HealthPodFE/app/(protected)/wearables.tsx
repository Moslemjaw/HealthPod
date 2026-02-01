import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { colors, radius, shadow, spacing } from "@/constants/design";
import { getDevices, resetArduinoConnection, deleteDevice } from "@/services/api";
import { DeviceInfo } from "@/types";

export default function WearablesScreen() {
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [reconnecting, setReconnecting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadDevices = () => {
    setLoading(true);
    getDevices()
      .then(setDevices)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDevices();
  }, []);

  const handleReconnect = async () => {
    setReconnecting(true);
    try {
      await resetArduinoConnection();
      loadDevices();
    } catch (error) {
      Alert.alert("Error", "Failed to reconnect.");
    } finally {
      setReconnecting(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Device",
      "Are you sure you want to delete this device? This will remove the device and its configuration.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteDevice(id);
              loadDevices();
            } catch (error) {
              Alert.alert("Error", "Failed to delete device.");
            } finally {
              setDeleting(false);
            }
          }
        }
      ]
    );
  };

  return (
    <Screen>
      <SectionHeader title="Connected Devices" subtitle="Manage your HealthPod devices." />
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : devices.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.deviceTitle}>No device found</Text>
          <Text style={styles.deviceMeta}>Add a device with your serial number.</Text>
        </View>
      ) : (
        devices.map((device) => (
          <View key={device.id} style={styles.deviceCard}>
            <View style={styles.deviceHeader}>
              <View style={styles.deviceIcon}>
                <Ionicons name="hardware-chip-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.deviceInfo}>
                <Text style={styles.deviceTitle}>{device.name}</Text>
                <Text style={styles.deviceMeta}>
                  {device.serialNumber ? `SN ${device.serialNumber}` : "No serial number"}
                </Text>
              </View>
              <View
                style={[
                  styles.statusPill,
                  device.isConnected ? styles.statusOn : styles.statusOff,
                ]}
              >
                <Text style={device.isConnected ? styles.statusOnText : styles.statusOffText}>
                  {device.isConnected ? "Connected" : "Disconnected"}
                </Text>
              </View>
            </View>
            
            <View style={styles.actionsRow}>
              {!device.isConnected && (
                <Pressable style={styles.reconnectBtn} onPress={handleReconnect} disabled={reconnecting}>
                  {reconnecting ? (
                    <ActivityIndicator color={colors.lightText} size="small" />
                  ) : (
                    <Text style={styles.reconnectText}>Reconnect</Text>
                  )}
                </Pressable>
              )}
              
              <Pressable 
                style={[styles.deleteBtn, device.isConnected && styles.deleteBtnFull]} 
                onPress={() => handleDelete(device.id)}
                disabled={deleting}
              >
                <Ionicons name="trash-outline" size={18} color={colors.error} />
                <Text style={styles.deleteText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  deviceCard: {
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    ...shadow.sm,
  },
  deviceHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  deviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surfaceTeal,
    alignItems: "center",
    justifyContent: "center",
  },
  deviceInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  deviceTitle: {
    fontWeight: "700",
    fontSize: 16,
    color: colors.textPrimary,
  },
  deviceMeta: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  statusPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusOn: {
    backgroundColor: "#D1FAE5",
  },
  statusOff: {
    backgroundColor: "#FEE2E2",
  },
  statusOnText: {
    color: colors.success,
    fontWeight: "600",
    fontSize: 12,
  },
  statusOffText: {
    color: colors.error,
    fontWeight: "600",
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  reconnectBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 40,
  },
  reconnectText: {
    color: colors.lightText,
    fontWeight: "600",
  },
  deleteBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: colors.lightRed,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    minHeight: 40,
  },
  deleteBtnFull: {
    // If it's the only button, let it take full width or whatever styling fits
  },
  deleteText: {
    color: colors.error,
    fontWeight: "600",
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: "center",
    ...shadow.sm,
  },
});