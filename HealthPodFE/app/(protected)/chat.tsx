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
import { colors, radius, shadow, spacing } from "@/constants/design";
import { ChatMessage } from "@/types";
import { useHealth } from "@/context/HealthContext";
import { sendChatMessage } from "@/services/api";

export default function ChatScreen() {
  const { user, medications, health } = useHealth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      from: "bot",
      text: `Hi ${user?.name || "there"}! 👋 I'm your HealthPod AI assistant. I know about your medications and health data, so feel free to ask me anything about your health routine, medication schedules, or general wellness tips.`,
      createdAt: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

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
      // Build context for DeepSeek
      const userContext = {
        name: user?.name,
        gender: user?.gender,
        age: user?.age,
        height: user?.height,
        weight: user?.weight,
        medications: medications.map((m) => ({
          name: m.name,
          dosage: m.dosage,
          schedule: m.schedule,
          remaining: m.remaining,
        })),
        health: {
          heartRate: health.heartRate,
          steps: health.steps,
          sleepHours: health.sleepHours,
          hydration: health.hydration,
        },
      };

      const response = await sendChatMessage(input.trim(), userContext);

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        from: "bot",
        text: response.text,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        from: "bot",
        text: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
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
              <Text
                style={[
                  styles.messageText,
                  message.from === "user" && styles.userText,
                ]}
              >
                {message.text}
              </Text>
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
              <Text style={styles.loadingText}>Thinking...</Text>
            </View>
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
    maxWidth: "75%",
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

