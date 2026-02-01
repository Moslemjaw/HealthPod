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

