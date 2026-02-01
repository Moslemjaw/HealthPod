import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View, ScrollView, SafeAreaView, RefreshControl, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import Animated, { FadeInDown, FadeInUp, Layout } from "react-native-reanimated";
import { colors, radius, shadow, spacing, typography } from "@/constants/design";
import { getMedications, getDevices, dispenseFromContainer, getArduinoStatus, resetArduinoConnection } from "@/services/api";
import { useRouter } from "expo-router";
import { DeviceInfo, Medication } from "@/types";

export default function InventoryScreen() {
  const router = useRouter();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [device, setDevice] = useState<DeviceInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dispensing, setDispensing] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const fetchData = async () => {
    try {
      console.log("[Inventory Screen] Starting fetch...");
      const [medsData, devicesData] = await Promise.all([
        getMedications(),
        getDevices(),
      ]);
      console.log("[Inventory Screen] Fetched medications:", medsData);
      console.log("[Inventory Screen] Fetched devices:", devicesData);
      console.log("[Inventory Screen] Medication count:", medsData.length);
      console.log("[Inventory Screen] Device count:", devicesData.length);
      
      setMedications(medsData);
      setDevice(devicesData[0] || null);
      
      checkConnection();
    } catch (error) {
      console.error("[Inventory Screen] Failed to fetch inventory data", error);
      Alert.alert("Error", `Failed to load inventory: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const checkConnection = async () => {
    setCheckingStatus(true);
    try {
      const status = await getArduinoStatus() as { isConnected: boolean };
      setIsConnected(!!status.isConnected);
    } catch (e) {
      setIsConnected(false);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleReconnect = async () => {
    setCheckingStatus(true);
    try {
      await resetArduinoConnection();
      // Wait a bit then check
      setTimeout(checkConnection, 2000);
    } catch (e) {
      Alert.alert("Connection Failed", "Could not reconnect to the device.");
      setCheckingStatus(false);
    }
  };

  useEffect(() => {
    fetchData().finally(() => setLoading(false));
  }, []);

  // Refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (!loading) {
        fetchData();
      }
    }, [loading])
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchData().finally(() => setRefreshing(false));
  }, []);

  const handleDispense = async (containerNumber: number) => {
    if (!device) return;
    
    setDispensing(containerNumber);
    try {
      await dispenseFromContainer(device.id, containerNumber);
      Alert.alert("Dispensing", `Dispensing from Container ${containerNumber}...`);
      setTimeout(() => {
        fetchData(); 
        setDispensing(null);
      }, 3000);
    } catch (error) {
      Alert.alert("Error", "Failed to dispense. Check device connection.");
      setDispensing(null);
    }
  };

  const handleEdit = (containerNumber: number, medName?: string, dosage?: string, schedule?: string) => {
    if (!device) return;
    router.push({
      pathname: "/(protected)/edit-container",
      params: { 
        deviceId: device.id, 
        containerNumber,
        medName: medName || "",
        dosage: dosage || "",
        schedule: schedule || ""
      }
    });
  };

  // Map sensor values to UI status
  const getStockStatus = (stockLevel: string) => {
    if (stockLevel === "FULL") return { label: "In Stock", color: colors.success, bg: colors.surfaceTeal, icon: "checkmark-circle" };
    if (stockLevel === "MED") return { label: "Available", color: colors.primary, bg: colors.surfaceBlue, icon: "information-circle" };
    return { label: "Empty", color: colors.error, bg: colors.lightRed, icon: "alert-circle" };
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView 
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* Header */}
          <Animated.View entering={FadeInDown.duration(500)} style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Inventory</Text>
              <Text style={styles.subtitle}>Manage dispenser & medications</Text>
            </View>
            <Pressable onPress={onRefresh} style={styles.refreshBtn}>
              <Ionicons name="refresh" size={20} color={colors.primary} />
            </Pressable>
          </Animated.View>

          {/* Section 1: Device Status */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.section}>
            <Text style={styles.sectionTitle}>Device Status</Text>
            <View style={[styles.statusCard, isConnected ? styles.statusConnected : styles.statusDisconnected]}>
              <View style={styles.statusInfo}>
                <Ionicons 
                  name={isConnected ? "bluetooth" : "alert-circle"} 
                  size={24} 
                  color={isConnected ? colors.success : colors.error} 
                />
                <View>
                  <Text style={styles.statusTitle}>
                    {isConnected ? "Connected" : "Disconnected"}
                  </Text>
                  <Text style={styles.statusSubtitle}>
                    {device?.name || "HealthPod Device"}
                  </Text>
                </View>
              </View>
              
              {!isConnected && (
                <Pressable 
                  style={styles.reconnectBtn} 
                  onPress={handleReconnect}
                  disabled={checkingStatus}
                >
                  {checkingStatus ? (
                    <ActivityIndicator size="small" color={colors.lightText} />
                  ) : (
                    <Text style={styles.reconnectText}>Reconnect</Text>
                  )}
                </Pressable>
              )}
            </View>
          </Animated.View>

          {/* Section 2: My Medications (Merged Stock Status) */}
          {device && device.containers && (
            <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.section}>
              <Text style={styles.sectionTitle}>My Medications</Text>
              
              {[1, 2, 3].map((num) => {
                const container = device.containers.find(c => c.number === num);
                // Find med details if available
                const medDetails = medications.find(m => m.name === container?.medicationName);
                const isDispensing = dispensing === num;
                const status = getStockStatus(container?.stockLevel || "FULL");
                
                return (
                  <Animated.View 
                    key={num}
                    entering={FadeInUp.delay(300 + num * 100).duration(400)}
                    layout={Layout.springify()}
                    style={styles.medCard}
                  >
                    <View style={styles.medHeader}>
                      <View style={[styles.medIcon, { backgroundColor: status.bg }]}>
                        <Ionicons name="medical" size={20} color={status.color} />
                      </View>
                      <View style={styles.medInfo}>
                        <View style={styles.medTitleRow}>
                          <Text style={styles.medName}>
                            {container?.medicationName || `Container ${num}`}
                          </Text>
                          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                          </View>
                        </View>
                        <Text style={styles.medDosage}>
                          {container?.dosage || "—"}
                        </Text>
                      </View>
                      <Pressable 
                        style={styles.editBtn}
                        onPress={() => handleEdit(num, container?.medicationName, container?.dosage, medDetails?.schedule)}
                      >
                        <Ionicons name="pencil" size={16} color={colors.primary} />
                      </Pressable>
                    </View>

                    <View style={styles.cardFooter}>
                      <View style={styles.scheduleRow}>
                        <Ionicons name="time-outline" size={14} color={colors.textMuted} />
                        <Text style={styles.scheduleText}>
                          {medDetails?.schedule || "No Schedule"}
                        </Text>
                      </View>

                      <Pressable 
                        style={[
                          styles.dispenseBtn, 
                          (isDispensing || !container?.medicationName) && styles.dispenseBtnDisabled
                        ]}
                        onPress={() => handleDispense(num)}
                        disabled={isDispensing || !container?.medicationName}
                      >
                        {isDispensing ? (
                          <ActivityIndicator size="small" color={colors.lightText} />
                        ) : (
                          <>
                            <Text style={styles.dispenseBtnText}>Dispense</Text>
                            <Ionicons name="arrow-down-circle-outline" size={16} color={colors.lightText} />
                          </>
                        )}
                      </Pressable>
                    </View>
                  </Animated.View>
                );
              })}
            </Animated.View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
      
      {/* FAB Removed as per request */}
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
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.lg,
  },
  refreshBtn: {
    padding: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.full,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.xxs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  statusCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    ...shadow.sm,
  },
  statusConnected: {
    borderColor: colors.success,
    backgroundColor: colors.surfaceTeal,
  },
  statusDisconnected: {
    borderColor: colors.error,
    backgroundColor: colors.lightRed,
  },
  statusInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  statusTitle: {
    ...typography.body,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  statusSubtitle: {
    ...typography.small,
    color: colors.textSecondary,
  },
  reconnectBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full,
  },
  reconnectText: {
    ...typography.caption,
    color: colors.lightText,
    fontWeight: "600",
  },
  containersGrid: {
    flexDirection: "row",
    gap: spacing.md,
  },
  stockCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadow.sm,
  },
  stockHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.sm,
  },
  stockTitle: {
    ...typography.small,
    fontWeight: "700",
  },
  stockBody: {
    padding: spacing.md,
    alignItems: "center",
  },
  stockStatus: {
    ...typography.small,
    fontWeight: "600",
  },
  medCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadow.sm,
  },
  medHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  medIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  medInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  medTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
  },
  medName: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  medDosage: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: 2,
  },
  editBtn: {
    padding: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.full,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.xs,
  },
  scheduleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  scheduleText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  dispenseBtn: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.md,
  },
  dispenseBtnDisabled: {
    backgroundColor: colors.textMuted,
    opacity: 0.5,
  },
  dispenseBtnText: {
    color: colors.lightText,
    fontSize: 12,
    fontWeight: "700",
  },
});
