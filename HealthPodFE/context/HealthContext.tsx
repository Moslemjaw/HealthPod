import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Storage keys
const STORAGE_KEYS = {
  USER: "@healthpod_user",
  MEDICATIONS: "@healthpod_medications",
  HEALTH: "@healthpod_health",
  STREAK: "@healthpod_streak",
  SCHEDULES: "@healthpod_schedules",
  AUTH: "@healthpod_auth",
};

type UserProfile = {
  name?: string;
  email?: string;
  password?: string;
  gender?: string;
  age?: number;
  height?: number;
  weight?: number;
  avatarUri?: string;
  profileComplete?: boolean;
  deviceSetupComplete?: boolean;
  createdAt?: string;
};

type Medication = {
  id?: string;
  name: string;
  dosage: string;
  schedule: string;
  remaining: number;
  total: number;
  refillThreshold?: number;
  cartridge?: "C1" | "C2" | "C3";
};

type HealthStats = {
  heartRate: number;
  steps: number;
  sleepHours: number;
  hydration: number;
  updatedAt: string;
};

type StreakData = {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string;
  totalXP: number;
  level: number;
};

type ScheduleReminder = {
  id: string;
  medicationId: string;
  time: string;
  frequency: string;
  isConfirmed: boolean;
  confirmedAt?: string;
};

type HealthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user?: UserProfile;
  medications: Medication[];
  health: HealthStats;
  streak: StreakData;
  schedules: ScheduleReminder[];
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, name?: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => void;
  addMedication: (medication: Medication) => void;
  updateMedication: (id: string, updates: Partial<Medication>) => void;
  deleteMedication: (id: string) => void;
  updateHealth: (health: Partial<HealthStats>) => void;
  confirmSchedule: (id: string) => void;
  addSchedule: (schedule: Omit<ScheduleReminder, "id">) => void;
  deleteAllUsers: () => Promise<void>;
};

const HealthContext = createContext<HealthContextValue | undefined>(undefined);

const defaultHealth: HealthStats = {
  heartRate: 72,
  steps: 5240,
  sleepHours: 6.7,
  hydration: 6,
  updatedAt: new Date().toISOString(),
};

const defaultStreak: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastCompletedDate: "",
  totalXP: 0,
  level: 1,
};

const defaultMedications: Medication[] = [];

export function HealthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | undefined>(undefined);
  const [health, setHealth] = useState<HealthStats>(defaultHealth);
  const [medications, setMedications] = useState<Medication[]>(defaultMedications);
  const [streak, setStreak] = useState<StreakData>(defaultStreak);
  const [schedules, setSchedules] = useState<ScheduleReminder[]>([]);

  // Load data from storage on mount
  useEffect(() => {
    loadStoredData();
  }, []);

  // Save data whenever it changes
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      saveUserData();
    }
  }, [user, medications, health, streak, schedules]);

  const loadStoredData = async () => {
    try {
      const [authData, userData, medsData, healthData, streakData, schedulesData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.AUTH),
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.MEDICATIONS),
        AsyncStorage.getItem(STORAGE_KEYS.HEALTH),
        AsyncStorage.getItem(STORAGE_KEYS.STREAK),
        AsyncStorage.getItem(STORAGE_KEYS.SCHEDULES),
      ]);

      if (authData === "true" && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);

        if (medsData) setMedications(JSON.parse(medsData));
        if (healthData) setHealth(JSON.parse(healthData));
        if (streakData) setStreak(JSON.parse(streakData));
        if (schedulesData) setSchedules(JSON.parse(schedulesData));
      }
    } catch (error) {
      console.error("Error loading stored data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUserData = async () => {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.AUTH, "true"),
        AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)),
        AsyncStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(medications)),
        AsyncStorage.setItem(STORAGE_KEYS.HEALTH, JSON.stringify(health)),
        AsyncStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(streak)),
        AsyncStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules)),
      ]);
    } catch (error) {
      console.error("Error saving user data:", error);
    }
  };

  const clearAllData = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.AUTH),
        AsyncStorage.removeItem(STORAGE_KEYS.USER),
        AsyncStorage.removeItem(STORAGE_KEYS.MEDICATIONS),
        AsyncStorage.removeItem(STORAGE_KEYS.HEALTH),
        AsyncStorage.removeItem(STORAGE_KEYS.STREAK),
        AsyncStorage.removeItem(STORAGE_KEYS.SCHEDULES),
      ]);
    } catch (error) {
      console.error("Error clearing data:", error);
    }
  };

  // Check if user exists (for login)
  const findUser = async (email: string): Promise<UserProfile | null> => {
    try {
      const allUsersData = await AsyncStorage.getItem("@healthpod_all_users");
      if (allUsersData) {
        const allUsers: UserProfile[] = JSON.parse(allUsersData);
        return allUsers.find((u) => u.email?.toLowerCase() === email.toLowerCase()) || null;
      }
      return null;
    } catch {
      return null;
    }
  };

  // Save user to all users list
  const saveUserToList = async (userProfile: UserProfile) => {
    try {
      const allUsersData = await AsyncStorage.getItem("@healthpod_all_users");
      let allUsers: UserProfile[] = allUsersData ? JSON.parse(allUsersData) : [];
      
      // Check if user exists
      const existingIndex = allUsers.findIndex(
        (u) => u.email?.toLowerCase() === userProfile.email?.toLowerCase()
      );
      
      if (existingIndex >= 0) {
        allUsers[existingIndex] = userProfile;
      } else {
        allUsers.push(userProfile);
      }
      
      await AsyncStorage.setItem("@healthpod_all_users", JSON.stringify(allUsers));
    } catch (error) {
      console.error("Error saving user to list:", error);
    }
  };

  const value = useMemo<HealthContextValue>(
    () => ({
      isAuthenticated,
      isLoading,
      user,
      medications,
      health,
      streak,
      schedules,

      signIn: async (email: string, password: string): Promise<boolean> => {
        const existingUser = await findUser(email);
        
        if (existingUser) {
          // Check password
          if (existingUser.password !== password) {
            return false; // Wrong password
          }
          
          // Login successful
          setUser(existingUser);
          setIsAuthenticated(true);
          await AsyncStorage.setItem(STORAGE_KEYS.AUTH, "true");
          await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(existingUser));
          
          // Load user-specific data
          const userMedsKey = `@healthpod_meds_${existingUser.email}`;
          const userStreakKey = `@healthpod_streak_${existingUser.email}`;
          const userSchedulesKey = `@healthpod_schedules_${existingUser.email}`;
          
          const [medsData, streakData, schedulesData] = await Promise.all([
            AsyncStorage.getItem(userMedsKey),
            AsyncStorage.getItem(userStreakKey),
            AsyncStorage.getItem(userSchedulesKey),
          ]);
          
          if (medsData) setMedications(JSON.parse(medsData));
          if (streakData) setStreak(JSON.parse(streakData));
          if (schedulesData) setSchedules(JSON.parse(schedulesData));
          
          return true;
        }
        
        return false; // User not found
      },

      signUp: async (email: string, password: string, name?: string): Promise<boolean> => {
        const existingUser = await findUser(email);
        
        if (existingUser) {
          return false; // User already exists
        }
        
        const newUser: UserProfile = {
          email,
          password,
          name: name || email.split("@")[0] || "HealthPod User",
          profileComplete: false,
          deviceSetupComplete: false,
          createdAt: new Date().toISOString(),
        };
        
        // Save to users list
        await saveUserToList(newUser);
        
        // Set current user
        setUser(newUser);
        setIsAuthenticated(true);
        setMedications([]);
        setStreak({ ...defaultStreak, currentStreak: 1 });
        setSchedules([]);
        
        await AsyncStorage.setItem(STORAGE_KEYS.AUTH, "true");
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
        
        return true;
      },

      signOut: async () => {
        // Save user data before signing out
        if (user?.email) {
          const userMedsKey = `@healthpod_meds_${user.email}`;
          const userStreakKey = `@healthpod_streak_${user.email}`;
          const userSchedulesKey = `@healthpod_schedules_${user.email}`;
          
          await Promise.all([
            AsyncStorage.setItem(userMedsKey, JSON.stringify(medications)),
            AsyncStorage.setItem(userStreakKey, JSON.stringify(streak)),
            AsyncStorage.setItem(userSchedulesKey, JSON.stringify(schedules)),
          ]);
          
          // Update user in list
          await saveUserToList(user);
        }
        
        setIsAuthenticated(false);
        setUser(undefined);
        setMedications([]);
        setStreak(defaultStreak);
        setSchedules([]);
        
        await clearAllData();
      },

      updateProfile: (profile: Partial<UserProfile>) => {
        setUser((prev) => {
          const updated = { ...prev, ...profile };
          // Also update in users list
          if (updated.email) {
            saveUserToList(updated);
          }
          return updated;
        });
      },

      addMedication: (medication: Medication) => {
        const newMed = {
          ...medication,
          id: medication.id || `med_${Date.now()}`,
          refillThreshold: medication.refillThreshold || 5,
        };
        setMedications((prev) => {
          const updated = [...prev, newMed];
          // Save user-specific data
          if (user?.email) {
            AsyncStorage.setItem(`@healthpod_meds_${user.email}`, JSON.stringify(updated));
          }
          return updated;
        });
      },

      updateMedication: (id: string, updates: Partial<Medication>) => {
        setMedications((prev) => {
          const updated = prev.map((m) => (m.id === id ? { ...m, ...updates } : m));
          if (user?.email) {
            AsyncStorage.setItem(`@healthpod_meds_${user.email}`, JSON.stringify(updated));
          }
          return updated;
        });
      },

      deleteMedication: (id: string) => {
        setMedications((prev) => {
          const updated = prev.filter((m) => m.id !== id);
          if (user?.email) {
            AsyncStorage.setItem(`@healthpod_meds_${user.email}`, JSON.stringify(updated));
          }
          return updated;
        });
      },

      updateHealth: (healthUpdate: Partial<HealthStats>) => {
        setHealth((prev) => ({
          ...prev,
          ...healthUpdate,
          updatedAt: new Date().toISOString(),
        }));
      },

      confirmSchedule: (id: string) => {
        setSchedules((prev) => {
          const updated = prev.map((s) =>
            s.id === id ? { ...s, isConfirmed: true, confirmedAt: new Date().toISOString() } : s
          );
          
          // Update streak when all schedules for today are confirmed
          const todaySchedules = updated.filter((s) => {
            // Simple check - in real app, check actual date
            return true;
          });
          const allConfirmed = todaySchedules.every((s) => s.isConfirmed);
          
          if (allConfirmed && todaySchedules.length > 0) {
            setStreak((prevStreak) => {
              const today = new Date().toDateString();
              const lastDate = prevStreak.lastCompletedDate;
              
              let newStreak = prevStreak.currentStreak;
              if (lastDate !== today) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                
                if (lastDate === yesterday.toDateString()) {
                  newStreak = prevStreak.currentStreak + 1;
                } else if (!lastDate) {
                  newStreak = 1;
                }
              }
              
              const newXP = prevStreak.totalXP + 10;
              const newLevel = Math.floor(newXP / 100) + 1;
              
              const newStreakData = {
                currentStreak: newStreak,
                longestStreak: Math.max(newStreak, prevStreak.longestStreak),
                lastCompletedDate: today,
                totalXP: newXP,
                level: newLevel,
              };
              
              if (user?.email) {
                AsyncStorage.setItem(`@healthpod_streak_${user.email}`, JSON.stringify(newStreakData));
              }
              
              return newStreakData;
            });
          }
          
          if (user?.email) {
            AsyncStorage.setItem(`@healthpod_schedules_${user.email}`, JSON.stringify(updated));
          }
          
          return updated;
        });
      },

      addSchedule: (schedule: Omit<ScheduleReminder, "id">) => {
        const newSchedule = {
          ...schedule,
          id: `schedule_${Date.now()}`,
        };
        setSchedules((prev) => {
          const updated = [...prev, newSchedule];
          if (user?.email) {
            AsyncStorage.setItem(`@healthpod_schedules_${user.email}`, JSON.stringify(updated));
          }
          return updated;
        });
      },

      deleteAllUsers: async () => {
        try {
          // Clear list of all users
          await AsyncStorage.removeItem("@healthpod_all_users");
          // Sign out and clear current session
          await value.signOut();
        } catch (error) {
          console.error("Error deleting all users:", error);
        }
      },
    }),
    [isAuthenticated, isLoading, user, medications, health, streak, schedules]
  );

  return <HealthContext.Provider value={value}>{children}</HealthContext.Provider>;
}

export function useHealth() {
  const ctx = useContext(HealthContext);
  if (!ctx) {
    throw new Error("useHealth must be used within HealthProvider");
  }
  return ctx;
}
