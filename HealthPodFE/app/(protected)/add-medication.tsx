import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View, ScrollView, SafeAreaView, Alert, KeyboardAvoidingView, Platform, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { colors, radius, spacing, typography } from "@/constants/design";
import { PrimaryButton } from "@/components/PrimaryButton";
import { addMedication } from "@/services/api";

export default function AddMedicationScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [schedule, setSchedule] = useState("Daily");
  const [total, setTotal] = useState("30");
  const [threshold, setThreshold] = useState("5");

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Missing Name", "Please enter the medication name.");
      return;
    }
    
    setLoading(true);
    try {
      await addMedication({
        name: name.trim(),
        dosage: dosage.trim() || "1 pill",
        schedule: schedule.trim(),
        remaining: parseInt(total) || 30,
        total: parseInt(total) || 30,
        refillThreshold: parseInt(threshold) || 5,
      });
      
      Alert.alert("Success", "Medication added successfully", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to add medication. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          {/* Header */}
          <Animated.View 
            entering={FadeInDown.duration(500)} 
            style={styles.header}
          >
            <Pressable style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </Pressable>
            <Text style={styles.title}>Add Medication</Text>
            <View style={{ width: 48 }} />
          </Animated.View>

          <ScrollView contentContainerStyle={styles.content}>
            <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.form}>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Medication Name</Text>
                <TextInput
                  placeholder="e.g. Metformin"
                  value={name}
                  onChangeText={setName}
                  style={styles.input}
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Dosage</Text>
                  <TextInput
                    placeholder="e.g. 500mg"
                    value={dosage}
                    onChangeText={setDosage}
                    style={styles.input}
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Schedule</Text>
                  <TextInput
                    placeholder="e.g. Daily"
                    value={schedule}
                    onChangeText={setSchedule}
                    style={styles.input}
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Total Quantity</Text>
                  <TextInput
                    placeholder="30"
                    value={total}
                    onChangeText={setTotal}
                    style={styles.input}
                    keyboardType="numeric"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Refill Alert At</Text>
                  <TextInput
                    placeholder="5"
                    value={threshold}
                    onChangeText={setThreshold}
                    style={styles.input}
                    keyboardType="numeric"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>

              <View style={styles.footer}>
                <PrimaryButton 
                  title={loading ? "Saving..." : "Save Medication"}
                  onPress={handleSave}
                  disabled={loading}
                  size="lg"
                />
              </View>

            </Animated.View>
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
  },
  form: {
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
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
  footer: {
    marginTop: spacing.md,
  },
});

