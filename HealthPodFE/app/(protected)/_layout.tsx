import React from "react";
import { Redirect, Stack } from "expo-router";
import { useHealth } from "@/context/HealthContext";
import { routes } from "@/constants/routes";

export default function ProtectedLayout() {
  const { isAuthenticated } = useHealth();

  if (!isAuthenticated) {
    return <Redirect href={routes.login} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

