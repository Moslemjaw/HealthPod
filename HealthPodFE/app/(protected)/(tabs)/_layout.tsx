import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, shadow } from "@/constants/design";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: colors.card,
          borderTopWidth: 0,
          height: Platform.OS === "ios" ? 90 : 70,
          paddingBottom: Platform.OS === "ios" ? 28 : 8,
          paddingTop: 8,
          borderTopLeftRadius: radius.xxl,
          borderTopRightRadius: radius.xxl,
          ...shadow.glow,
          shadowColor: colors.primary,
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: -4 },
        },
        tabBarItemStyle: {
          height: 50,
          alignItems: "center",
          justifyContent: "center",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIcon]}>
              <Ionicons name={focused ? "home" : "home-outline"} color={focused ? colors.lightText : color} size={24} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: "Inventory",
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIcon]}>
              <Ionicons name={focused ? "medical" : "medical-outline"} color={focused ? colors.lightText : color} size={24} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: "Schedule",
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIcon]}>
              <Ionicons name={focused ? "calendar" : "calendar-outline"} color={focused ? colors.lightText : color} size={24} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="store"
        options={{
          title: "Store",
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIcon]}>
              <Ionicons name={focused ? "cart" : "cart-outline"} color={focused ? colors.lightText : color} size={24} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIcon]}>
              <Ionicons name={focused ? "settings" : "settings-outline"} color={focused ? colors.lightText : color} size={24} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  activeIcon: {
    backgroundColor: colors.primary,
    ...shadow.glow,
  },
});
