import React from "react";
import { StyleSheet, Text, View, ScrollView, SafeAreaView, Pressable, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInRight, FadeInUp } from "react-native-reanimated";
import { colors, radius, shadow, spacing, gradients, typography } from "@/constants/design";

const { width } = Dimensions.get("window");

const recommended = [
  { id: "1", name: "Pill Organizer", price: "$12.99", icon: "grid-outline", color: colors.accentPurple, bg: colors.surfacePurple },
  { id: "2", name: "Extra Cartridges", price: "$24.99", icon: "layers-outline", color: colors.primary, bg: colors.surfaceTeal },
  { id: "3", name: "Travel Case", price: "$19.99", icon: "briefcase-outline", color: colors.accentBlue, bg: colors.surfaceBlue },
  { id: "4", name: "Cleaning Kit", price: "$9.99", icon: "sparkles-outline", color: colors.accentOrange, bg: colors.surfaceOrange },
];

const orders = [
  { id: "o1", name: "Metformin Cartridge Pack", date: "Jan 16, 2026", status: "Processing", icon: "cube" },
  { id: "o2", name: "Vitamin D Refill Pack", date: "Jan 8, 2026", status: "Shipped", icon: "airplane" },
];

export default function StoreScreen() {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView 
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View entering={FadeInDown.duration(500)}>
            <Text style={styles.title}>Store</Text>
            <Text style={styles.subtitle}>Refills and accessories</Text>
          </Animated.View>

          {/* Auto-Refill Banner */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)}>
            <LinearGradient
              colors={gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.banner}
            >
              <View style={styles.bannerContent}>
                <View style={styles.bannerIconBox}>
                  <Ionicons name="sync" size={24} color={colors.lightText} />
                </View>
                <View style={styles.bannerText}>
                  <Text style={styles.bannerTitle}>Auto-Refill Active</Text>
                  <Text style={styles.bannerSub}>Your meds refill automatically</Text>
                </View>
              </View>
              <Pressable style={styles.bannerBtn}>
                <Text style={styles.bannerBtnText}>Manage</Text>
              </Pressable>
            </LinearGradient>
          </Animated.View>

          {/* Recommended Products */}
          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recommended</Text>
              <Pressable>
                <Text style={styles.seeAll}>See all</Text>
              </Pressable>
            </View>
          </Animated.View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productsScroll}
          >
            {recommended.map((item, i) => (
              <Animated.View
                key={item.id}
                entering={FadeInRight.delay(300 + i * 80).duration(400)}
              >
                <Pressable style={styles.productCard}>
                  <View style={[styles.productIcon, { backgroundColor: item.bg }]}>
                    <Ionicons name={item.icon as any} size={28} color={item.color} />
                  </View>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productPrice}>{item.price}</Text>
                  <Pressable style={styles.addBtn}>
                    <Ionicons name="add" size={18} color={colors.lightText} />
                  </Pressable>
                </Pressable>
              </Animated.View>
            ))}
          </ScrollView>

          {/* Recent Orders */}
          <Animated.View entering={FadeInUp.delay(400).duration(500)}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Orders</Text>
              <Pressable>
                <Text style={styles.seeAll}>View all</Text>
              </Pressable>
            </View>
          </Animated.View>

          {orders.map((order, i) => (
            <Animated.View
              key={order.id}
              entering={FadeInUp.delay(500 + i * 100).duration(400)}
            >
              <Pressable style={styles.orderCard}>
                <View style={styles.orderIcon}>
                  <Ionicons name="cube-outline" size={24} color={colors.primary} />
                </View>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderName}>{order.name}</Text>
                  <Text style={styles.orderDate}>{order.date}</Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  order.status === "Processing" ? styles.statusProcessing : styles.statusShipped
                ]}>
                  <Ionicons 
                    name={order.status === "Processing" ? "time-outline" : "airplane-outline"} 
                    size={14} 
                    color={order.status === "Processing" ? colors.warning : colors.accentBlue}
                  />
                  <Text style={[
                    styles.statusText,
                    order.status === "Processing" ? styles.statusTextProcessing : styles.statusTextShipped
                  ]}>
                    {order.status}
                  </Text>
                </View>
              </Pressable>
            </Animated.View>
          ))}

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
  content: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.xxs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  banner: {
    borderRadius: radius.xl,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xl,
    ...shadow.md,
  },
  bannerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  bannerIconBox: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  bannerText: {},
  bannerTitle: {
    ...typography.bodyMedium,
    color: colors.lightText,
  },
  bannerSub: {
    ...typography.small,
    color: colors.lightText,
    opacity: 0.85,
    marginTop: 2,
  },
  bannerBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  bannerBtnText: {
    ...typography.small,
    fontWeight: "600",
    color: colors.lightText,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  seeAll: {
    ...typography.small,
    color: colors.primary,
    fontWeight: "600",
  },
  productsScroll: {
    paddingRight: spacing.lg,
    marginBottom: spacing.xl,
  },
  productCard: {
    width: 140,
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginRight: spacing.md,
    alignItems: "center",
    ...shadow.sm,
  },
  productIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  productName: {
    ...typography.small,
    fontWeight: "600",
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.xxs,
  },
  productPrice: {
    ...typography.bodyMedium,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
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
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceTeal,
    alignItems: "center",
    justifyContent: "center",
  },
  orderInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  orderName: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  orderDate: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.full,
  },
  statusProcessing: {
    backgroundColor: colors.lightYellow,
  },
  statusShipped: {
    backgroundColor: colors.surfaceBlue,
  },
  statusText: {
    ...typography.tiny,
    fontWeight: "600",
  },
  statusTextProcessing: {
    color: colors.warning,
  },
  statusTextShipped: {
    color: colors.accentBlue,
  },
});
