import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Redirect, Stack } from "expo-router";
import { useHealth } from "@/context/HealthContext";
import { routes } from "@/constants/routes";
import { colors } from "@/constants/design";

export default function ProtectedLayout() {
  const { isAuthenticated, isLoading } = useHealth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href={routes.onboarding} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
});
