import { Achievement, ChatMessage, HealthSnapshot, Medication, Order, ScheduleItem, UserProfile } from "@/types";

export const mockUser: UserProfile = {
  name: "Ava James",
  email: "ava@example.com",
  streak: 6,
  level: 3,
  xp: 245
};

export const mockMedications: Medication[] = [
  {
    id: "med-1",
    name: "Metformin",
    dosage: "500mg",
    schedule: "8:00 AM • Daily",
    remaining: 12,
    total: 30,
    expiresOn: "2026-04-15",
    refillThreshold: 6
  },
  {
    id: "med-2",
    name: "Atorvastatin",
    dosage: "20mg",
    schedule: "9:00 PM • Daily",
    remaining: 8,
    total: 30,
    expiresOn: "2026-03-01",
    refillThreshold: 5
  },
  {
    id: "med-3",
    name: "Vitamin D",
    dosage: "1,000 IU",
    schedule: "7:30 AM • Mon/Wed/Fri",
    remaining: 18,
    total: 24,
    expiresOn: "2026-06-20",
    refillThreshold: 6
  }
];

export const mockSchedule: ScheduleItem[] = [
  {
    id: "schedule-1",
    medicationId: "med-1",
    time: "08:00",
    frequency: "Daily",
    isConfirmed: false
  },
  {
    id: "schedule-2",
    medicationId: "med-2",
    time: "21:00",
    frequency: "Daily",
    isConfirmed: true
  }
];

export const mockOrders: Order[] = [
  {
    id: "order-1",
    item: "Metformin Cartridge Pack",
    status: "processing",
    placedOn: "2026-01-16"
  },
  {
    id: "order-2",
    item: "Vitamin D Refill Pack",
    status: "shipped",
    placedOn: "2026-01-08"
  }
];

export const mockAchievements: Achievement[] = [
  {
    id: "ach-1",
    title: "7-Day Streak",
    description: "Take your meds for 7 days in a row.",
    earned: false
  },
  {
    id: "ach-2",
    title: "Early Bird",
    description: "Log a dose before 9 AM.",
    earned: true
  }
];

export const mockChat: ChatMessage[] = [
  {
    id: "chat-1",
    from: "bot",
    text: "Hi! I can help with dosage reminders or refill tips.",
    createdAt: "2026-01-21T09:00:00.000Z"
  }
];

export const mockHealth: HealthSnapshot = {
  heartRate: 72,
  steps: 5240,
  sleepHours: 6.7,
  updatedAt: "2026-01-21T07:45:00.000Z"
};

