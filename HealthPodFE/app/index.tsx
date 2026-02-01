import { Redirect } from "expo-router";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { routes } from "@/constants/routes";
import { useHealth } from "@/context/HealthContext";
import { colors } from "@/constants/design";

export default function Index() {
  const { isAuthenticated, isLoading } = useHealth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // If user is already authenticated, go directly to the main app
  if (isAuthenticated) {
    return <Redirect href={routes.tabs} />;
  }

  // Otherwise, show the onboarding
  return <Redirect href={routes.onboarding} />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
});
