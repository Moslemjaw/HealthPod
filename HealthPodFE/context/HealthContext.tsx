import React, { createContext, useContext, useMemo, useState } from "react";

type UserProfile = {
  name?: string;
  email?: string;
  gender?: string;
  age?: number;
  height?: number;
  weight?: number;
  profileComplete?: boolean;
  deviceSetupComplete?: boolean;
};

type Medication = {
  id?: string;
  name: string;
  dosage: string;
  schedule: string;
  remaining: number;
  total: number;
  cartridge?: "C1" | "C2" | "C3";
};

type HealthStats = {
  heartRate: number;
  steps: number;
  sleepHours: number;
  hydration: number;
  updatedAt: string;
};

type HealthContextValue = {
  isAuthenticated: boolean;
  user?: UserProfile;
  medications: Medication[];
  health: HealthStats;
  signIn: (email: string, name?: string) => void;
  signOut: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  addMedication: (medication: Medication) => void;
};

const HealthContext = createContext<HealthContextValue | undefined>(undefined);

const defaultHealth: HealthStats = {
  heartRate: 72,
  steps: 5240,
  sleepHours: 6.7,
  hydration: 6,
  updatedAt: new Date().toISOString()
};

const defaultMedications: Medication[] = [
  { name: "Metformin", dosage: "500mg", schedule: "8:00 AM • Daily", remaining: 12, total: 30 },
  { name: "Atorvastatin", dosage: "20mg", schedule: "9:00 PM • Daily", remaining: 8, total: 30 }
];

export function HealthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | undefined>(undefined);
  const [health] = useState(defaultHealth);
  const [medications, setMedications] = useState<Medication[]>(defaultMedications);

  const value = useMemo<HealthContextValue>(
    () => ({
      isAuthenticated,
      user,
      medications,
      health,
      signIn: (email: string, name?: string) => {
        setUser({ 
          email, 
          name: name || email.split("@")[0] || "HealthPod User",
          profileComplete: false,
          deviceSetupComplete: false
        });
        setIsAuthenticated(true);
      },
      signOut: () => {
        setIsAuthenticated(false);
        setUser(undefined);
        setMedications(defaultMedications);
      },
      updateProfile: (profile: Partial<UserProfile>) => {
        setUser((prev) => ({ ...prev, ...profile }));
      },
      addMedication: (medication: Medication) => {
        setMedications((prev) => [...prev, medication]);
      }
    }),
    [isAuthenticated, user, medications, health]
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
