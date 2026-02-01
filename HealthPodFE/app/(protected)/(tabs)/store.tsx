import React from "react";
import { StyleSheet, Text, View, ScrollView, SafeAreaView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, shadow, spacing } from "@/constants/design";

const recommended = [
  { id: "1", name: "Pill Organizer", price: "$12.99", icon: "grid-outline", available: false },
  { id: "2", name: "Extra Cartridges", price: "$24.99", icon: "layers-outline", available: true },
  { id: "3", name: "Travel Case", price: "$19.99", icon: "briefcase-outline", available: true },
];

const orders = [
  { id: "o1", name: "Metformin Cartridge Pack", date: "Placed on 2026-01-16", status: "Processing" },
  { id: "o2", name: "Vitamin D Refill Pack", date: "Placed on 2026-01-08", status: "Shipped" },
];

export default function StoreScreen() {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Store</Text>
          <Text style={styles.subtitle}>Refills and accessories</Text>

          <View style={styles.autoRefillBanner}>
            <View style={styles.autoRefillContent}>
              <Text style={styles.autoRefillTitle}>Auto-Refill Enabled</Text>
              <Text style={styles.autoRefillSub}>Never run out of your medications.</Text>
            </View>
            <Ionicons name="refresh" size={24} color={colors.lightText} />
          </View>

          <Text style={styles.sectionTitle}>Recommended for You</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recommendedScroll}>
            {recommended.map((item) => (
              <View key={item.id} style={styles.recommendedCard}>
                <View style={[styles.recommendedIcon, !item.available && styles.recommendedIconDisabled]}>
                  <Ionicons
                    name={item.icon as any}
                    size={24}
                    color={item.available ? colors.primary : colors.textMuted}
                  />
                </View>
                <Text style={[styles.recommendedName, !item.available && styles.recommendedNameDisabled]}>
                  {item.name}
                </Text>
                <Text style={[styles.recommendedPrice, !item.available && styles.recommendedPriceDisabled]}>
                  {item.price}
                </Text>
              </View>
            ))}
          </ScrollView>

          <Text style={styles.sectionTitle}>Recent Orders</Text>
          {orders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderIcon}>
                <Ionicons name="cube-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.orderInfo}>
                <Text style={styles.orderName}>{order.name}</Text>
                <Text style={styles.orderDate}>{order.date}</Text>
                <View
                  style={[
                    styles.orderStatus,
                    order.status === "Processing" ? styles.statusWarning : styles.statusSuccess,
                  ]}
                >
                  <Ionicons
                    name={order.status === "Processing" ? "time-outline" : "airplane-outline"}
                    size={12}
                    color={order.status === "Processing" ? colors.warning : colors.accentBlue}
                  />
                  <Text
                    style={[
                      styles.orderStatusText,
                      order.status === "Processing" ? styles.statusWarningText : styles.statusSuccessText,
                    ]}
                  >
                    {order.status}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </View>
          ))}
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
  content: {
    padding: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    fontSize: 14,
  },
  autoRefillBanner: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xl,
    ...shadow.sm,
  },
  autoRefillContent: {
    flex: 1,
  },
  autoRefillTitle: {
    color: colors.lightText,
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 4,
  },
  autoRefillSub: {
    color: colors.lightText,
    opacity: 0.9,
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  recommendedScroll: {
    marginBottom: spacing.lg,
  },
  recommendedCard: {
    width: 140,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: "center",
    marginRight: spacing.md,
    ...shadow.sm,
  },
  recommendedIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.surfaceTeal,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  recommendedIconDisabled: {
    backgroundColor: colors.surfaceAlt,
  },
  recommendedName: {
    textAlign: "center",
    fontWeight: "600",
    color: colors.textPrimary,
    fontSize: 14,
    marginBottom: 4,
  },
  recommendedNameDisabled: {
    color: colors.textMuted,
  },
  recommendedPrice: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 14,
  },
  recommendedPriceDisabled: {
    color: colors.textMuted,
  },
  orderCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow.sm,
  },
  orderIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surfaceTeal,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  orderInfo: {
    flex: 1,
  },
  orderName: {
    fontWeight: "600",
    color: colors.textPrimary,
    fontSize: 15,
  },
  orderDate: {
    color: colors.textSecondary,
    marginTop: 2,
    fontSize: 13,
  },
  orderStatus: {
    marginTop: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  statusWarning: {
    backgroundColor: colors.lightYellow,
  },
  statusSuccess: {
    backgroundColor: "#DBEAFE",
  },
  orderStatusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  statusWarningText: {
    color: colors.warning,
  },
  statusSuccessText: {
    color: colors.accentBlue,
  },
});
