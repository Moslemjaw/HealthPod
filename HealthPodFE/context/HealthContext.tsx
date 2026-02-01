import React, { createContext, useContext, useMemo, useState } from "react";

type UserProfile = {
  name?: string;
  email?: string;
  gender?: string;
  age?: number;
  height?: number;
  weight?: number;
};

type Medication = {
  name: string;
  dosage: string;
  schedule: string;
  remaining: number;
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
  signIn: (email: string) => void;
  signOut: () => void;
};

const HealthContext = createContext<HealthContextValue | undefined>(undefined);

const defaultHealth: HealthStats = {
  heartRate: 72,
  steps: 4820,
  sleepHours: 6.8,
  hydration: 1.4,
  updatedAt: new Date().toISOString()
};

const defaultMedications: Medication[] = [
  { name: "Metformin", dosage: "500mg", schedule: "Morning", remaining: 22 },
  { name: "Vitamin D", dosage: "1000 IU", schedule: "Evening", remaining: 15 }
];

export function HealthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | undefined>(undefined);
  const [health] = useState(defaultHealth);
  const [medications] = useState(defaultMedications);

  const value = useMemo<HealthContextValue>(
    () => ({
      isAuthenticated,
      user,
      medications,
      health,
      signIn: (email: string) => {
        setUser({ email, name: email.split("@")[0] || "HealthPod User" });
        setIsAuthenticated(true);
      },
      signOut: () => {
        setIsAuthenticated(false);
        setUser(undefined);
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


type UserProfile = {
  name?: string;
  email?: string;
  gender?: string;
  age?: number;
  height?: number;
  weight?: number;
};

type Medication = {
  name: string;
  dosage: string;
  schedule: string;
  remaining: number;
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
  signIn: (email: string) => void;
  signOut: () => void;
};

const HealthContext = createContext<HealthContextValue | undefined>(undefined);

const defaultHealth: HealthStats = {
  heartRate: 72,
  steps: 4820,
  sleepHours: 6.8,
  hydration: 1.4,
  updatedAt: new Date().toISOString()
};

const defaultMedications: Medication[] = [
  { name: "Metformin", dosage: "500mg", schedule: "Morning", remaining: 22 },
  { name: "Vitamin D", dosage: "1000 IU", schedule: "Evening", remaining: 15 }
];

export function HealthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | undefined>(undefined);
  const [health] = useState(defaultHealth);
  const [medications] = useState(defaultMedications);

  const value = useMemo<HealthContextValue>(
    () => ({
      isAuthenticated,
      user,
      medications,
      health,
      signIn: (email: string) => {
        setUser({ email, name: email.split("@")[0] || "HealthPod User" });
        setIsAuthenticated(true);
      },
      signOut: () => {
        setIsAuthenticated(false);
        setUser(undefined);
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

