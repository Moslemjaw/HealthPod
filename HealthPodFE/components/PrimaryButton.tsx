import React from "react";
import { StyleSheet, Text, Pressable, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { colors, radius, spacing, shadow, gradients, typography } from "@/constants/design";

type PrimaryButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  disabled?: boolean;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PrimaryButton({ 
  title, 
  onPress, 
  variant = "primary",
  size = "md",
  icon,
  disabled = false,
}: PrimaryButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
    opacity.value = withTiming(0.9, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    opacity.value = withTiming(1, { duration: 100 });
  };

  const sizeStyles = {
    sm: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md, minHeight: 36 },
    md: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, minHeight: 48 },
    lg: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl, minHeight: 56 },
  };

  const textStyles = {
    sm: typography.small,
    md: typography.bodyMedium,
    lg: typography.h3,
  };

  if (variant === "outline") {
    return (
      <AnimatedPressable 
        onPress={onPress} 
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[animatedStyle, disabled && { opacity: 0.5 }]}
      >
        <View style={[styles.outlineButton, sizeStyles[size]]}>
          {icon && <View style={styles.iconLeft}>{icon}</View>}
          <Text style={[styles.outlineText, textStyles[size] as any]}>{title}</Text>
        </View>
      </AnimatedPressable>
    );
  }

  if (variant === "ghost") {
    return (
      <AnimatedPressable 
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[animatedStyle, disabled && { opacity: 0.5 }]}
      >
        <View style={[styles.ghostButton, sizeStyles[size]]}>
          {icon && <View style={styles.iconLeft}>{icon}</View>}
          <Text style={[styles.ghostText, textStyles[size] as any]}>{title}</Text>
        </View>
      </AnimatedPressable>
    );
  }

  if (variant === "secondary") {
    return (
      <AnimatedPressable 
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[animatedStyle, disabled && { opacity: 0.5 }]}
      >
        <View style={[styles.secondaryButton, sizeStyles[size]]}>
          {icon && <View style={styles.iconLeft}>{icon}</View>}
          <Text style={[styles.secondaryText, textStyles[size] as any]}>{title}</Text>
        </View>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable 
      onPress={onPress} 
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[styles.pressable, animatedStyle, disabled && { opacity: 0.5 }]}
    >
      <LinearGradient
        colors={gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.button, sizeStyles[size], shadow.glow]}
      >
        {icon && <View style={styles.iconLeft}>{icon}</View>}
        <Text style={[styles.text, textStyles[size] as any, size === 'lg' && { fontSize: 18 }]}>{title}</Text>
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: radius.full,
  },
  button: {
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  text: {
    color: colors.lightText,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  iconLeft: {
    marginRight: spacing.xs,
  },
  outlineButton: {
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    backgroundColor: "transparent",
  },
  outlineText: {
    color: colors.primary,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  ghostButton: {
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    backgroundColor: "transparent",
  },
  ghostText: {
    color: colors.primary,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  secondaryButton: {
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    backgroundColor: colors.surfaceTeal,
  },
  secondaryText: {
    color: colors.primaryDark,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});
