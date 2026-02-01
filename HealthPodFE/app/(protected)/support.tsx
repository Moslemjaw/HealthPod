import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { colors, spacing } from "@/constants/design";

const faq = [
  {
    question: "How do reminders work?",
    answer: "Reminders are simulated for Phase 1 and trigger local alerts on schedule."
  },
  {
    question: "Can I connect a wearable?",
    answer: "Device data is mocked for now. Real integrations will come in later phases."
  },
  {
    question: "How do I refill cartridges?",
    answer: "Use the store tab to simulate orders and track status."
  }
];

export default function SupportScreen() {
  return (
    <Screen>
      <SectionHeader title="Support & FAQ" subtitle="Quick answers and troubleshooting." />
      {faq.map((item) => (
        <View key={item.question} style={styles.card}>
          <Text style={styles.question}>{item.question}</Text>
          <Text style={styles.answer}>{item.answer}</Text>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: 16,
    marginBottom: spacing.md,
    gap: spacing.xs
  },
  question: {
    fontWeight: "700",
    color: colors.textPrimary
  },
  answer: {
    color: colors.textSecondary
  }
});

