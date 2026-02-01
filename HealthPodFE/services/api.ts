import Constants from "expo-constants";
import {
  DeviceInfo,
  InventoryItem,
  Medication,
  ScheduleItem,
} from "@/types";

type ChatResponse = {
  text: string;
};

const devHost = Constants.expoConfig?.hostUri?.split(":")[0];
const API_PORT = process.env.EXPO_PUBLIC_API_PORT || "4000";
const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (devHost ? `http://${devHost}:${API_PORT}` : `http://localhost:${API_PORT}`);

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
    ...options,
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Request failed");
  }
  if (response.status === 204) {
    return {} as T;
  }
  return (await response.json()) as T;
}

export async function sendChatMessage(
  text: string,
  context?: Record<string, unknown>
): Promise<ChatResponse> {
  const data = await request<{ message: { text: string } }>("/api/chat", {
    method: "POST",
    body: JSON.stringify({ text, context }),
  });
  return { text: data?.message?.text || "Thanks for your message." };
}

export function getMedications() {
  return request<Medication[]>("/api/medications");
}

export function addMedication(payload: Partial<Omit<Medication, "id">>) {
  return request<Medication>("/api/medications", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateMedication(id: string, payload: Partial<Medication>) {
  return request<Medication>(`/api/medications/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function getInventory() {
  return request<InventoryItem[]>("/api/inventory");
}

export function getSchedules() {
  return request<ScheduleItem[]>("/api/schedules");
}

export function confirmSchedule(id: string) {
  return request<ScheduleItem>(`/api/schedules/${id}/confirm`, { method: "PATCH" });
}

export function getDevices() {
  return request<DeviceInfo[]>("/api/devices");
}

export function createDevice(payload: { name: string; serialNumber: string }) {
  return request<DeviceInfo>("/api/devices", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateDevice(id: string, payload: Partial<DeviceInfo>) {
  return request<DeviceInfo>(`/api/devices/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteDevice(id: string) {
  return request<void>(`/api/devices/${id}`, { method: "DELETE" });
}

export function updateContainer(
  deviceId: string,
  number: number,
  payload: Record<string, unknown>
) {
  return request(`/api/devices/${deviceId}/containers/${number}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function dispenseFromContainer(deviceId: string, number: number, command?: string) {
  return request(`/api/devices/${deviceId}/containers/${number}/dispense`, {
    method: "POST",
    body: JSON.stringify({ command: command || String(number) }),
  });
}

export function getArduinoStatus() {
  return request("/api/arduino/status");
}

export function resetArduinoConnection() {
  return request("/api/arduino/reset", { method: "POST" });
}

export function refreshStockLevels() {
  return request("/api/arduino/refresh", { method: "POST" });
}


