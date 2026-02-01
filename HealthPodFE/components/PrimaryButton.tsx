import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radius, spacing } from "@/constants/design";

type PrimaryButtonProps = {
  title: string;
  onPress?: () => void;
};

export function PrimaryButton({ title, onPress }: PrimaryButtonProps) {
  return (
    <Pressable onPress={onPress} style={styles.pressable}>
      <LinearGradient
        colors={["#00D4AA", "#00A085"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.button}
      >
        <Text style={styles.text}>{title}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: radius.md,
  },
  button: {
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: colors.lightText,
    fontWeight: "600",
    fontSize: 16,
  }
});

