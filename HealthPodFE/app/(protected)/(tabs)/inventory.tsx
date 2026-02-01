import React, { useEffect, useState, useRef } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View, ScrollView, SafeAreaView, RefreshControl, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp, Layout, useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, cancelAnimation } from "react-native-reanimated";
import { colors, radius, shadow, spacing, typography } from "@/constants/design";
import { getMedications, getDevices, dispenseFromContainer, getArduinoStatus, resetArduinoConnection, refreshStockLevels } from "@/services/api";
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

  // Spinning animation for refresh button
  const rotation = useSharedValue(0);
  const animatedRefreshStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const startSpinning = () => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000, easing: Easing.linear }),
      -1, // infinite
      false
    );
  };

  const stopSpinning = () => {
    cancelAnimation(rotation);
    rotation.value = 0;
  };

  const fetchData = async () => {
    try {
      console.log("[Inventory] Fetching data...");
      
      // First refresh stock levels from Arduino to ensure DB is updated
      try {
        await refreshStockLevels();
        console.log("[Inventory] Stock levels refreshed from Arduino");
      } catch (e) {
        console.log("[Inventory] Could not refresh stock levels:", e);
      }
      
      // Then fetch all data
      const [medsData, devicesData, statusData] = await Promise.all([
        getMedications(),
        getDevices(),
        getArduinoStatus() as Promise<{ isConnected: boolean }>,
      ]);
      
      console.log("[Inventory] Medications:", medsData.length);
      console.log("[Inventory] Devices:", devicesData.length);
      if (devicesData[0]?.containers) {
        const stocks = devicesData[0].containers.map((c: any) => `C${c.number}:${c.stockLevel}`).join(", ");
        console.log("[Inventory] Stock levels:", stocks);
      }
      
      setMedications(medsData);
      setDevice(devicesData[0] || null);
      setIsConnected(!!statusData?.isConnected);
    } catch (error) {
      console.error("[Inventory] Failed to fetch data:", error);
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
      setTimeout(checkConnection, 2000);
    } catch (e) {
      Alert.alert("Connection Failed", "Could not reconnect to the device.");
      setCheckingStatus(false);
    }
  };

  useEffect(() => {
    fetchData().finally(() => setLoading(false));
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    startSpinning();
    try {
      await fetchData();
    } finally {
      setRefreshing(false);
      stopSpinning();
    }
  }, []);

  const handleRefreshPress = () => {
    onRefresh();
  };

  const handleDispense = async (containerNumber: number) => {
    if (!device) return;
    
    setDispensing(containerNumber);
    try {
      await dispenseFromContainer(device.id, containerNumber);
      Alert.alert(
        "Dispensing", 
        `Dispensing from Container ${containerNumber}...`,
        [{ text: "OK" }]
      );
      
      // Wait for dispensing to complete, then refresh multiple times
      // to catch the updated stock level from the sensor
      setTimeout(async () => {
        console.log("[Inventory] Refreshing after dispense (1)...");
        await fetchData();
      }, 2000);
      
      setTimeout(async () => {
        console.log("[Inventory] Refreshing after dispense (2)...");
        await fetchData();
        setDispensing(null);
      }, 4000);
      
    } catch (error) {
      Alert.alert("Error", "Failed to dispense. Check device connection.");
      setDispensing(null);
    }
  };

  const handleEdit = (containerNumber: number) => {
    if (!device) return;
    
    // Find the medication for this container
    const med = medications.find(m => m.containerNumber === containerNumber);
    const container = device.containers.find(c => c.number === containerNumber);
    
    router.push({
      pathname: "/(protected)/edit-container",
      params: { 
        deviceId: device.id, 
        containerNumber,
        medId: med?.id || "",
        medName: med?.name || container?.medicationName || "",
        dosage: med?.dosage || container?.dosage || "",
        time: med?.time || container?.reminderTime || "",
        days: med?.days?.join(",") || container?.reminderDays?.join(",") || ""
      }
    });
  };

  // Map sensor values to UI status
  const getStockStatus = (stockLevel: string) => {
    if (stockLevel === "FULL") return { label: "In Stock", color: colors.success, bg: colors.surfaceTeal, icon: "checkmark-circle" };
    if (stockLevel === "MED") return { label: "Available", color: colors.primary, bg: colors.surfaceBlue, icon: "information-circle" };
    return { label: "Empty", color: colors.error, bg: colors.lightRed, icon: "alert-circle" };
  };

  // Get medication info for a container
  const getMedForContainer = (containerNumber: number) => {
    return medications.find(m => m.containerNumber === containerNumber);
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
            <Pressable 
              onPress={handleRefreshPress} 
              style={[styles.refreshBtn, refreshing && styles.refreshBtnActive]}
              disabled={refreshing}
            >
              <Animated.View style={animatedRefreshStyle}>
                <Ionicons name="refresh" size={20} color={refreshing ? colors.lightText : colors.primary} />
              </Animated.View>
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
                    {device?.name || "No Device"}
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

          {/* No Device State */}
          {!device && (
            <View style={styles.emptyState}>
              <Ionicons name="cube-outline" size={64} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No Device Connected</Text>
              <Text style={styles.emptyText}>
                Add a HealthPod dispenser to manage your medications
              </Text>
              <Pressable 
                style={styles.addDeviceBtn}
                onPress={() => router.push("/(protected)/add-device")}
              >
                <Ionicons name="add" size={20} color={colors.lightText} />
                <Text style={styles.addDeviceBtnText}>Add Device</Text>
              </Pressable>
            </View>
          )}

          {/* Section 2: My Medications */}
          {device && device.containers && (
            <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.section}>
              <Text style={styles.sectionTitle}>My Medications</Text>
              
              {[1, 2, 3].map((num) => {
                const container = device.containers.find(c => c.number === num);
                const med = getMedForContainer(num);
                const isDispensing = dispensing === num;
                const status = getStockStatus(container?.stockLevel || "LOW");
                const hasMed = !!(med?.name || container?.medicationName);
                const isEmpty = status.label === "Empty";
                
                return (
                  <Animated.View 
                    key={num}
                    entering={FadeInUp.delay(300 + num * 100).duration(400)}
                    layout={Layout.springify()}
                    style={styles.medCard}
                  >
                    <View style={styles.medHeader}>
                      <View style={[styles.medIcon, { backgroundColor: hasMed ? status.bg : colors.surfaceAlt }]}>
                        <Ionicons 
                          name={hasMed ? "medical" : "add"} 
                          size={20} 
                          color={hasMed ? status.color : colors.textMuted} 
                        />
                      </View>
                      <View style={styles.medInfo}>
                        <View style={styles.medTitleRow}>
                          <Text style={styles.medName}>
                            {med?.name || container?.medicationName || `Container ${num}`}
                          </Text>
                          {hasMed && (
                            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                              <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.medDosage}>
                          {med?.dosage || container?.dosage || (hasMed ? "—" : "Empty slot")}
                        </Text>
                      </View>
                      <Pressable 
                        style={styles.editBtn}
                        onPress={() => handleEdit(num)}
                      >
                        <Ionicons name="pencil" size={16} color={colors.primary} />
                      </Pressable>
                    </View>

                    <View style={styles.cardFooter}>
                      <View style={styles.scheduleRow}>
                        <Ionicons name="time-outline" size={14} color={colors.textMuted} />
                        <Text style={styles.scheduleText}>
                          {med?.time 
                            ? `${med.time} • ${med.days?.length === 7 ? "Daily" : med.days?.join(", ") || "Daily"}`
                            : container?.reminderTime 
                              ? `${container.reminderTime} • ${container.reminderDays?.length === 7 || !container.reminderDays ? "Daily" : container.reminderDays.join(", ")}`
                              : "No Schedule"
                          }
                        </Text>
                      </View>

                      <Pressable 
                        style={[
                          styles.dispenseBtn, 
                          (isDispensing || !hasMed || isEmpty) && styles.dispenseBtnDisabled
                        ]}
                        onPress={() => handleDispense(num)}
                        disabled={isDispensing || !hasMed || isEmpty}
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
  refreshBtnActive: {
    backgroundColor: colors.primary,
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
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  addDeviceBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  addDeviceBtnText: {
    ...typography.body,
    color: colors.lightText,
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
    flex: 1,
    marginRight: spacing.sm,
  },
  scheduleText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
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
