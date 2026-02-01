export const colors = {
  // Core backgrounds
  background: "#FFFFFF",
  card: "#FFFFFF",
  cardAlt: "#F8FAFC",
  
  // Primary palette - Refined Mint/Teal
  primary: "#00C49F", // Slightly deeper, more premium teal
  primaryDark: "#00967A",
  primaryLight: "#E6FFFA",
  
  // Accent colors
  secondary: "#3B82F6", // Royal Blue
  success: "#10B981",
  error: "#EF4444",
  warning: "#F59E0B",
  info: "#3B82F6",
  
  // Vibrant accents
  accentTeal: "#14B8A6",
  accentBlue: "#6366F1",
  accentPurple: "#8B5CF6",
  accentPink: "#EC4899",
  accentOrange: "#F97316",
  
  // Text hierarchy
  textPrimary: "#1E293B", // Slate 800 - Softer than black
  textSecondary: "#64748B", // Slate 500
  textMuted: "#94A3B8", // Slate 400
  textLight: "#CBD5E1",
  lightText: "#FFFFFF",
  
  // Borders and surfaces
  border: "#E2E8F0",
  borderLight: "#F1F5F9",
  surfaceAlt: "#F8FAFC",
  surfaceTeal: "#F0FDFA",
  surfaceBlue: "#EFF6FF",
  surfacePurple: "#F5F3FF",
  surfacePink: "#FDF2F8",
  surfaceOrange: "#FFF7ED",
  
  // Dark theme elements (for specific dark modes/sections)
  darkBackground: "#0F172A",
  darkCard: "#1E293B",
  darkSurface: "#334155",
  
  // Semantic surfaces
  mint: "#00C49F",
  lightGreen: "#DCFCE7",
  lightYellow: "#FEF9C3",
  lightRed: "#FEE2E2",
  
  // Glass effect
  glass: "rgba(255, 255, 255, 0.7)",
  glassBorder: "rgba(255, 255, 255, 0.5)",
  glassDark: "rgba(15, 23, 42, 0.6)",
};

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const radius = {
  xs: 6,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  full: 999,
};

export const shadow = {
  xs: {
    shadowColor: "#64748B",
    shadowOpacity: 0.04,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  sm: {
    shadowColor: "#64748B",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  md: {
    shadowColor: "#64748B",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  lg: {
    shadowColor: "#64748B",
    shadowOpacity: 0.1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  card: {
    shadowColor: "#64748B",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  glow: {
    shadowColor: "#00C49F",
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
};

export const gradients = {
  primary: ["#00C49F", "#00A085"] as const,
  primarySoft: ["#2DD4BF", "#0D9488"] as const,
  ocean: ["#06B6D4", "#3B82F6"] as const,
  sunset: ["#F97316", "#EC4899"] as const,
  purple: ["#8B5CF6", "#6366F1"] as const,
  dark: ["#1E293B", "#0F172A"] as const,
  glass: ["rgba(255,255,255,0.8)", "rgba(255,255,255,0.4)"] as const,
  subtle: ["#F8FAFC", "#FFFFFF"] as const,
};

export const typography = {
  hero: {
    fontSize: 40,
    fontWeight: "800" as const,
    lineHeight: 48,
    letterSpacing: -1,
  },
  h1: {
    fontSize: 32,
    fontWeight: "700" as const,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,
    fontWeight: "700" as const,
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  h3: {
    fontSize: 20,
    fontWeight: "600" as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
    lineHeight: 26,
  },
  bodyMedium: {
    fontSize: 16,
    fontWeight: "500" as const,
    lineHeight: 26,
  },
  small: {
    fontSize: 14,
    fontWeight: "400" as const,
    lineHeight: 22,
  },
  caption: {
    fontSize: 12,
    fontWeight: "500" as const,
    lineHeight: 18,
  },
  tiny: {
    fontSize: 10,
    fontWeight: "600" as const,
    lineHeight: 14,
  },
};
