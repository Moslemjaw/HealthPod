export type ChatMessage = {
  id: string;
  from: "user" | "bot";
  text: string;
  createdAt: string;
};

export type Medication = {
  id: string;
  name: string;
  dosage: string;
  schedule: string;
  remaining: number;
  total: number;
  refillThreshold: number;
};

export type InventoryItem = {
  id: string;
  medication: string;
  remaining: number;
  threshold: number;
};

export type ScheduleItem = {
  id: string;
  medicationId: string;
  time: string;
  frequency: string;
  isConfirmed: boolean;
};

export type StockLevel = "LOW" | "MED" | "FULL";

export type DeviceContainer = {
  number: number;
  medicationName?: string;
  dosage?: string;
  reminderTime?: string;
  reminderEnabled?: boolean;
  stockLevel: StockLevel;
};

export type DeviceInfo = {
  id: string;
  type: "healthpod_dispenser";
  name: string;
  serialNumber?: string;
  isConnected?: boolean;
  containers: DeviceContainer[];
};


  from: "user" | "bot";
  text: string;
  createdAt: string;
};

export type Medication = {
  id: string;
  name: string;
  dosage: string;
  schedule: string;
  remaining: number;
  total: number;
  refillThreshold: number;
};

export type InventoryItem = {
  id: string;
  medication: string;
  remaining: number;
  threshold: number;
};

export type ScheduleItem = {
  id: string;
  medicationId: string;
  time: string;
  frequency: string;
  isConfirmed: boolean;
};

export type StockLevel = "LOW" | "MED" | "FULL";

export type DeviceContainer = {
  number: number;
  medicationName?: string;
  dosage?: string;
  reminderTime?: string;
  reminderEnabled?: boolean;
  stockLevel: StockLevel;
};

export type DeviceInfo = {
  id: string;
  type: "healthpod_dispenser";
  name: string;
  serialNumber?: string;
  isConnected?: boolean;
  containers: DeviceContainer[];
};

