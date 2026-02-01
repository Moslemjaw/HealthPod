import type { Request, Response } from "express";
import { config } from "../../config";

const SYSTEM_PROMPT = `You are HealthPod AI, a friendly and knowledgeable health assistant integrated with the HealthPod smart pill dispenser system. You have access to the user's complete health profile, medications, dispenser status, and reminders.

Your role is to:
1. Help users understand their medication schedules and remind them about upcoming doses
2. Provide general health advice based on their profile (age, weight, BMI, etc.)
3. Answer questions about their medications (but always advise consulting a doctor for medical decisions)
4. Offer lifestyle tips based on their health stats (sleep, steps, hydration)
5. Warn about potential issues like low stock in dispenser containers
6. Motivate users to maintain their medication adherence streak

Guidelines:
- Be warm, supportive, and encouraging
- Keep responses concise but helpful (2-3 paragraphs max)
- Use emojis sparingly to be friendly 💊
- If asked about drug interactions, always recommend consulting a pharmacist or doctor
- Acknowledge when information is outside your expertise
- Reference specific data from their profile when relevant
- If stock is LOW/empty, remind them to refill

IMPORTANT: Never provide specific medical diagnoses or change medication dosages. Always recommend professional consultation for medical decisions.`;

export function getChat(_req: Request, res: Response) {
  res.json({ messages: [] });
}

export async function postChat(req: Request, res: Response) {
  const text = String(req.body?.text || "").trim();
  const context = req.body?.context || {};

  if (!text) {
    return res.status(400).json({ message: "Message text is required." });
  }

  // Build context string for the AI
  const contextString = buildContextString(context);
  
  console.log("[Chat] User message:", text);
  console.log("[Chat] Context:", JSON.stringify(context, null, 2));

  try {
    // Check if API key is configured
    if (!config.deepseek.apiKey) {
      console.log("[Chat] No DeepSeek API key configured, using fallback response");
      return res.status(200).json({
        message: {
          text: generateFallbackResponse(text, context),
        },
      });
    }

    // Call DeepSeek API
    const response = await fetch(`${config.deepseek.baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${config.deepseek.apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: `${SYSTEM_PROMPT}\n\n--- USER DATA ---\n${contextString}`,
          },
          {
            role: "user",
            content: text,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Chat] DeepSeek API error:", response.status, errorText);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't process that request.";
    
    console.log("[Chat] AI response:", aiResponse);

    return res.status(200).json({
      message: {
        text: aiResponse,
      },
    });
  } catch (error) {
    console.error("[Chat] Error calling AI:", error);
    
    // Return a helpful fallback response
    return res.status(200).json({
      message: {
        text: generateFallbackResponse(text, context),
      },
    });
  }
}

function buildContextString(context: any): string {
  const parts: string[] = [];

  // Profile
  if (context.profile) {
    const p = context.profile;
    parts.push(`PROFILE:
- Name: ${p.name || "Unknown"}
- Age: ${p.age || "Not specified"}
- Gender: ${p.gender || "Not specified"}
- Height: ${p.height ? `${p.height} cm` : "Not specified"}
- Weight: ${p.weight ? `${p.weight} kg` : "Not specified"}
- BMI: ${p.bmi || "Not calculated"}`);
  }

  // Health Stats
  if (context.healthStats) {
    const h = context.healthStats;
    parts.push(`HEALTH STATS (Today):
- Heart Rate: ${h.heartRate} bpm
- Steps: ${h.steps}
- Sleep: ${h.sleepHours} hours
- Hydration: ${h.hydration}`);
  }

  // Progress/Streak
  if (context.progress) {
    const pr = context.progress;
    parts.push(`MEDICATION ADHERENCE:
- Current Streak: ${pr.currentStreak} days
- Longest Streak: ${pr.longestStreak} days
- Total XP: ${pr.totalXP}
- Level: ${pr.level}`);
  }

  // Dispenser Medications
  if (context.dispenserMedications && context.dispenserMedications.length > 0) {
    const meds = context.dispenserMedications.map((m: any) => 
      `  • ${m.name} (${m.dosage}) - Container ${m.containerNumber || "?"} - ${m.schedule || m.time || "No schedule"} - ${m.remaining}/${m.total} remaining`
    ).join("\n");
    parts.push(`DISPENSER MEDICATIONS:\n${meds}`);
  }

  // Dispenser Status
  if (context.dispenser) {
    const d = context.dispenser;
    const containers = d.containers?.map((c: any) => 
      `  • Container ${c.number}: ${c.medication} (${c.stockLevel || "Unknown"} stock) - ${c.reminderTime || "No time set"}`
    ).join("\n") || "No containers";
    parts.push(`DISPENSER STATUS:
- Device: ${d.name}
- Connected: ${d.isConnected ? "Yes" : "No"}
- Containers:
${containers}`);
  }

  // Reminders (non-dispenser)
  if (context.reminders && context.reminders.length > 0) {
    const reminders = context.reminders.map((r: any) => 
      `  • ${r.name} (${r.dosage}) - ${r.time} - ${r.days?.join(", ") || "Daily"}${r.note ? ` - Note: ${r.note}` : ""}`
    ).join("\n");
    parts.push(`OTHER MEDICATION REMINDERS:\n${reminders}`);
  }

  // Current Time
  if (context.currentDateTime) {
    parts.push(`CURRENT TIME: ${context.currentDateTime} (${context.dayOfWeek})`);
  }

  return parts.join("\n\n");
}

function generateFallbackResponse(text: string, context: any): string {
  const lowerText = text.toLowerCase();
  const userName = context.profile?.name || "there";
  
  // Check for specific intents
  if (lowerText.includes("medication") || lowerText.includes("take today") || lowerText.includes("schedule")) {
    const meds = context.dispenserMedications || [];
    const reminders = context.reminders || [];
    const today = context.dayOfWeek || new Date().toLocaleDateString('en-US', { weekday: 'long' });
    
    if (meds.length === 0 && reminders.length === 0) {
      return `Hi ${userName}! 👋 I don't see any medications scheduled in your profile yet. You can add medications through the device setup or create reminders in the Schedule tab.`;
    }
    
    let response = `Hi ${userName}! Here's your medication plan for ${today}:\n\n`;
    
    if (meds.length > 0) {
      response += "💊 **From Dispenser:**\n";
      meds.forEach((m: any) => {
        response += `• ${m.name} (${m.dosage}) at ${m.time || "scheduled time"}\n`;
      });
    }
    
    if (reminders.length > 0) {
      response += "\n⏰ **Reminders:**\n";
      reminders.forEach((r: any) => {
        response += `• ${r.name} (${r.dosage}) at ${r.time}\n`;
      });
    }
    
    return response + "\nRemember to take your medications as scheduled! 💪";
  }
  
  if (lowerText.includes("interaction") || lowerText.includes("drug")) {
    return `That's an important question, ${userName}! ⚠️ For specific drug interaction information, I strongly recommend:\n\n1. Consulting your pharmacist\n2. Speaking with your doctor\n3. Using a verified drug interaction checker\n\nI can help with general medication scheduling, but medical advice should come from healthcare professionals.`;
  }
  
  if (lowerText.includes("health") || lowerText.includes("tip") || lowerText.includes("advice")) {
    const health = context.healthStats;
    let tips = `Here are some personalized tips based on your data, ${userName}:\n\n`;
    
    if (health?.sleepHours < 7) {
      tips += "😴 **Sleep:** You're getting ${health.sleepHours} hours. Aim for 7-9 hours for optimal health.\n\n";
    }
    if (health?.hydration < 6) {
      tips += "💧 **Hydration:** Try to drink more water! You're at ${health.hydration}/8 glasses.\n\n";
    }
    if (health?.steps < 5000) {
      tips += "🚶 **Activity:** Great job on your steps! Keep moving throughout the day.\n\n";
    }
    
    tips += "Keep up with your medication routine - consistency is key! 🌟";
    return tips;
  }
  
  if (lowerText.includes("adherence") || lowerText.includes("streak")) {
    const progress = context.progress;
    if (progress) {
      return `Great question about your progress, ${userName}! 🌟\n\n📊 **Your Stats:**\n• Current Streak: ${progress.currentStreak} days\n• Longest Streak: ${progress.longestStreak} days\n• Level: ${progress.level}\n• Total XP: ${progress.totalXP}\n\nKeep taking your medications on time to build your streak! Every dose counts! 💪`;
    }
  }
  
  if (lowerText.includes("stock") || lowerText.includes("refill") || lowerText.includes("empty")) {
    const dispenser = context.dispenser;
    if (dispenser?.containers) {
      const lowStock = dispenser.containers.filter((c: any) => c.stockLevel === "LOW" || c.stockLevel === "EMPTY");
      if (lowStock.length > 0) {
        const names = lowStock.map((c: any) => `Container ${c.number} (${c.medication})`).join(", ");
        return `⚠️ ${userName}, I noticed some containers need refilling:\n\n${names}\n\nPlease refill these soon to ensure you don't miss any doses!`;
      }
      return `Good news, ${userName}! ✅ All your dispenser containers have adequate stock. Keep an eye on levels and refill when needed.`;
    }
  }
  
  // Default response
  return `Hi ${userName}! 👋 I'm your HealthPod AI assistant. I can help you with:\n\n• Your medication schedules\n• Health tips based on your data\n• Tracking your adherence streak\n• Checking dispenser stock levels\n\nWhat would you like to know?`;
}
