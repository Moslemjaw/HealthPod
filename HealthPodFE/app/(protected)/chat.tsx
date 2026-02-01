import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors, radius, shadow, spacing } from "@/constants/design";
import { ChatMessage } from "@/types";
import { useHealth } from "@/context/HealthContext";
import { sendChatMessage, getMedications, getDevices } from "@/services/api";

const REMINDERS_STORAGE_KEY = "@healthpod_reminders";

const FormattedText = ({ text, style }: { text: string; style: any }) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return (
    <Text style={style}>
      {parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <Text key={index} style={{ fontWeight: "700" }}>
              {part.slice(2, -2)}
            </Text>
          );
        }
        return part;
      })}
    </Text>
  );
};

export default function ChatScreen() {
  const { user, health, streak } = useHealth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [contextLoaded, setContextLoaded] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  // Load all context data on mount
  useEffect(() => {
    loadContextAndInit();
  }, []);

  const loadContextAndInit = async () => {
    // Initialize with welcome message
    setMessages([
      {
        id: "welcome",
        from: "bot",
        text: `Hi ${user?.name || "there"}! 👋 I'm your HealthPod AI assistant. I have access to your profile, medications, health data, and reminders. Feel free to ask me anything about:\n\n• Your medication schedule\n• Drug interactions\n• Health tips based on your data\n• Lifestyle recommendations\n• General wellness advice`,
        createdAt: new Date().toISOString(),
      },
    ]);
    setContextLoaded(true);
  };

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      from: "user",
      text: input.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Fetch latest data from backend
      const [dispenserMeds, devices, remindersData] = await Promise.all([
        getMedications().catch(() => []),
        getDevices().catch(() => []),
        AsyncStorage.getItem(REMINDERS_STORAGE_KEY),
      ]);

      const reminders = remindersData ? JSON.parse(remindersData) : [];
      const device = devices[0];

      // Build comprehensive context for AI
      const userContext = {
        // User Profile
        profile: {
          name: user?.name,
          email: user?.email,
          gender: user?.gender,
          age: user?.age,
          height: user?.height,
          weight: user?.weight,
          bmi: user?.height && user?.weight 
            ? (user.weight / Math.pow(user.height / 100, 2)).toFixed(1) 
            : null,
        },
        
        // Health Stats
        healthStats: {
          heartRate: health.heartRate,
          steps: health.steps,
          sleepHours: health.sleepHours,
          hydration: `${health.hydration}/8 glasses`,
        },
        
        // Streak & Progress
        progress: {
          currentStreak: streak.currentStreak,
          longestStreak: streak.longestStreak,
          totalXP: streak.totalXP,
          level: streak.level,
        },
        
        // Dispenser Medications (from backend)
        dispenserMedications: dispenserMeds.map((m: any) => ({
          name: m.name,
          dosage: m.dosage,
          schedule: m.schedule,
          time: m.time,
          days: m.days,
          containerNumber: m.containerNumber,
          remaining: m.remaining,
          total: m.total,
        })),
        
        // Device & Container Status
        dispenser: device ? {
          name: device.name,
          isConnected: device.isConnected,
          containers: device.containers?.map((c: any) => ({
            number: c.number,
            medication: c.medicationName || "Empty",
            dosage: c.dosage || "-",
            reminderTime: c.reminderTime,
            stockLevel: c.stockLevel,
          })),
        } : null,
        
        // Custom Reminders (non-dispenser)
        reminders: reminders.map((r: any) => ({
          name: r.name,
          dosage: r.dosage,
          time: r.time,
          days: r.days,
          note: r.note,
        })),
        
        // Current date/time for context
        currentDateTime: new Date().toLocaleString(),
        dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
      };

      console.log("[Chat] Sending context:", JSON.stringify(userContext, null, 2));

      const response = await sendChatMessage(input.trim(), userContext);

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        from: "bot",
        text: response.text,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("[Chat] Error:", error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        from: "bot",
        text: "Sorry, I'm having trouble connecting right now. Please check your internet connection and try again.",
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Quick suggestion buttons
  const suggestions = [
    "What medications should I take today?",
    "Any drug interactions I should know about?",
    "Health tips based on my data",
    "How is my medication adherence?",
  ];

  const handleSuggestion = (text: string) => {
    setInput(text);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Ionicons name="sparkles" size={20} color={colors.lightText} />
          </View>
          <View>
            <Text style={styles.headerTitle}>AI Health Assistant</Text>
            <Text style={styles.headerSubtitle}>Powered by DeepSeek</Text>
          </View>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.from === "user" ? styles.userBubble : styles.botBubble,
            ]}
          >
            {message.from === "bot" && (
              <View style={styles.botAvatar}>
                <Ionicons name="sparkles" size={14} color={colors.primary} />
              </View>
            )}
            <View
              style={[
                styles.messageContent,
                message.from === "user" ? styles.userContent : styles.botContent,
              ]}
            >
              <FormattedText
                text={message.text}
                style={[
                  styles.messageText,
                  message.from === "user" && styles.userText,
                ]}
              />
              <Text style={styles.messageTime}>{formatTime(message.createdAt)}</Text>
            </View>
          </View>
        ))}

        {loading && (
          <View style={[styles.messageBubble, styles.botBubble]}>
            <View style={styles.botAvatar}>
              <Ionicons name="sparkles" size={14} color={colors.primary} />
            </View>
            <View style={[styles.messageContent, styles.botContent, styles.loadingContent]}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Analyzing your data...</Text>
            </View>
          </View>
        )}

        {/* Quick Suggestions - show only when no user messages yet */}
        {messages.length === 1 && !loading && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Quick questions:</Text>
            {suggestions.map((suggestion, index) => (
              <Pressable
                key={index}
                style={styles.suggestionChip}
                onPress={() => handleSuggestion(suggestion)}
              >
                <Ionicons name="chatbubble-outline" size={14} color={colors.primary} />
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Ask about your health..."
            placeholderTextColor={colors.textMuted}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
          />
          <Pressable
            style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || loading}
          >
            <Ionicons
              name="send"
              size={20}
              color={input.trim() ? colors.lightText : colors.textMuted}
            />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: spacing.xxl + spacing.md,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: spacing.md,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  messageBubble: {
    flexDirection: "row",
    marginBottom: spacing.md,
  },
  userBubble: {
    justifyContent: "flex-end",
  },
  botBubble: {
    justifyContent: "flex-start",
  },
  botAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceTeal,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
    marginTop: 4,
  },
  messageContent: {
    maxWidth: "80%",
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  userContent: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: spacing.xs,
  },
  botContent: {
    backgroundColor: colors.card,
    borderBottomLeftRadius: spacing.xs,
    ...shadow.sm,
  },
  loadingContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  messageText: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  userText: {
    color: colors.lightText,
  },
  messageTime: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: spacing.xs,
    alignSelf: "flex-end",
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  suggestionsContainer: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
  },
  suggestionsTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  suggestionChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.card,
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  suggestionText: {
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
  },
  inputContainer: {
    padding: spacing.md,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    paddingVertical: spacing.sm,
    fontSize: 15,
    color: colors.textPrimary,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: colors.border,
  },
});
