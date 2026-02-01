import React, { useState } from "react";
import { StyleSheet, Text, View, ScrollView, SafeAreaView, Pressable, Dimensions, Alert, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInRight, FadeInUp } from "react-native-reanimated";
import { colors, radius, shadow, spacing, typography } from "@/constants/design";

const { width } = Dimensions.get("window");

type Product = {
  id: string;
  name: string;
  description: string;
  price: string;
  priceValue: number;
  icon: string;
  color: string;
  bg: string;
  comingSoon?: boolean;
};

const products: Product[] = [
  { 
    id: "1", 
    name: "HealthPod Dispenser", 
    description: "Smart pill dispenser with 3 containers",
    price: "15 KD", 
    priceValue: 15,
    icon: "cube-outline", 
    color: colors.primary, 
    bg: colors.surfaceTeal 
  },
  { 
    id: "2", 
    name: "Extra Containers", 
    description: "Pack of 3 replacement containers",
    price: "3 KD", 
    priceValue: 3,
    icon: "layers-outline", 
    color: colors.accentPurple, 
    bg: colors.surfacePurple 
  },
  { 
    id: "3", 
    name: "HealthPod Band", 
    description: "Smart health tracking wearable",
    price: "Coming Soon", 
    priceValue: 0,
    icon: "watch-outline", 
    color: colors.accentBlue, 
    bg: colors.surfaceBlue,
    comingSoon: true
  },
];

export default function StoreScreen() {
  const [cart, setCart] = useState<{ id: string; quantity: number }[]>([]);

  const addToCart = (product: Product) => {
    if (product.comingSoon) {
      Alert.alert("Coming Soon", "The HealthPod Band will be available soon! Stay tuned.");
      return;
    }
    
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { id: product.id, quantity: 1 }]);
    }
    
    Alert.alert("Added to Cart", `${product.name} has been added to your cart.`);
  };

  const getCartQuantity = (productId: string) => {
    return cart.find(item => item.id === productId)?.quantity || 0;
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView 
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
            <View>
              <Text style={styles.title}>Store</Text>
              <Text style={styles.subtitle}>HealthPod products & accessories</Text>
            </View>
            {totalItems > 0 && (
              <Pressable style={styles.cartBtn}>
                <Ionicons name="cart-outline" size={24} color={colors.primary} />
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{totalItems}</Text>
                </View>
              </Pressable>
            )}
          </Animated.View>

          {/* Products Section */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)}>
            <Text style={styles.sectionTitle}>Our Products</Text>
          </Animated.View>

          <View style={styles.productsGrid}>
            {products.map((product, i) => (
              <Animated.View
                key={product.id}
                entering={FadeInUp.delay(200 + i * 100).duration(400)}
                style={styles.productCardWrapper}
              >
                <Pressable 
                  style={[styles.productCard, product.comingSoon && styles.productCardDisabled]}
                  onPress={() => addToCart(product)}
                >
                  <View style={[styles.productIcon, { backgroundColor: product.bg }]}>
                    <Ionicons name={product.icon as any} size={32} color={product.color} />
                  </View>
                  
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productDescription}>{product.description}</Text>
                  
                  <View style={styles.productFooter}>
                    <Text style={[
                      styles.productPrice, 
                      product.comingSoon && styles.productPriceDisabled
                    ]}>
                      {product.price}
                    </Text>
                    
                    {!product.comingSoon && (
                      <Pressable 
                        style={styles.addBtn}
                        onPress={() => addToCart(product)}
                      >
                        <Ionicons name="add" size={20} color={colors.lightText} />
                      </Pressable>
                    )}
                  </View>
                  
                  {getCartQuantity(product.id) > 0 && (
                    <View style={styles.quantityBadge}>
                      <Text style={styles.quantityText}>{getCartQuantity(product.id)}</Text>
                    </View>
                  )}
                </Pressable>
              </Animated.View>
            ))}
          </View>

          {/* Features Section */}
          <Animated.View entering={FadeInUp.delay(500).duration(500)} style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Why HealthPod?</Text>
            
            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: colors.surfaceTeal }]}>
                <Ionicons name="shield-checkmark-outline" size={24} color={colors.primary} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Smart Dispensing</Text>
                <Text style={styles.featureText}>Automated pill dispensing with sensor-based stock tracking</Text>
              </View>
            </View>
            
            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: colors.surfacePurple }]}>
                <Ionicons name="notifications-outline" size={24} color={colors.accentPurple} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Smart Reminders</Text>
                <Text style={styles.featureText}>Never miss a dose with customizable notifications</Text>
              </View>
            </View>
            
            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: colors.surfaceBlue }]}>
                <Ionicons name="analytics-outline" size={24} color={colors.accentBlue} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Health Insights</Text>
                <Text style={styles.featureText}>AI-powered analysis and medication tracking</Text>
              </View>
            </View>
          </Animated.View>

          {/* Recent Orders */}
          <Animated.View entering={FadeInUp.delay(600).duration(500)}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(700).duration(400)} style={styles.emptyOrders}>
            <View style={styles.emptyOrdersIcon}>
              <Ionicons name="receipt-outline" size={48} color={colors.textMuted} />
            </View>
            <Text style={styles.emptyOrdersTitle}>No Orders Yet</Text>
            <Text style={styles.emptyOrdersText}>
              Your order history will appear here once you make a purchase.
            </Text>
          </Animated.View>

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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.xxs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  cartBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceTeal,
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.error,
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadgeText: {
    ...typography.tiny,
    color: colors.lightText,
    fontWeight: "700",
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  productCardWrapper: {
    width: (width - spacing.lg * 2 - spacing.md) / 2,
  },
  productCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.md,
    alignItems: "center",
    ...shadow.sm,
    position: "relative",
    height: 260,
    width: "100%",
    justifyContent: "space-between",
  },
  productCardDisabled: {
    opacity: 1,
  },
  productIcon: {
    width: 80,
    height: 80,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  productName: {
    ...typography.bodyMedium,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.xxs,
  },
  productDescription: {
    ...typography.tiny,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.sm,
    flex: 1,
  },
  productFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  productPrice: {
    ...typography.h3,
    color: colors.primary,
  },
  productPriceDisabled: {
    color: colors.textMuted,
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
    width: "100%",
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityBadge: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityText: {
    ...typography.tiny,
    color: colors.lightText,
    fontWeight: "700",
  },
  featuresSection: {
    marginBottom: spacing.xl,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadow.sm,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  featureContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  featureTitle: {
    ...typography.bodyMedium,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  featureText: {
    ...typography.small,
    color: colors.textSecondary,
  },
  emptyOrders: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: "center",
    ...shadow.sm,
  },
  emptyOrdersIcon: {
    width: 80,
    height: 80,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  emptyOrdersTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptyOrdersText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
