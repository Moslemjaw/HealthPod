import { Request, Response } from "express";
import { randomUUID } from "crypto";
import { DeviceInfo } from "../../models/Device";
import { arduinoService } from "../../services/arduino.service";
import { db } from "../../utils/json-db";
import { Medication } from "../../models/Medication";

function buildDefaultContainers() {
  return [1, 2, 3].map((number) => ({
    number,
    stockLevel: "LOW" as const,
  }));
}

export function getDevices(_req: Request, res: Response) {
  const arduinoStatus = arduinoService.getStatus();
  const devices = db.devices as DeviceInfo[];
  
  // Log current stock levels for debugging
  if (devices.length > 0) {
    const stockLevels = devices[0].containers.map(c => `C${c.number}:${c.stockLevel}`).join(", ");
    console.log("[Device] GET - Stock levels:", stockLevels);
  }
  
  res.json(
    devices.map((device) => ({
      ...device,
      isConnected: arduinoStatus.isConnected,
    }))
  );
}

export function createDevice(req: Request, res: Response) {
  const name = String(req.body?.name || "HealthPod Dispenser").trim();
  const serialNumber = String(req.body?.serialNumber || "").trim();

  console.log("[Device] POST - Creating device:", name, serialNumber);

  const device: DeviceInfo = {
    id: randomUUID(),
    type: "healthpod_dispenser",
    name,
    serialNumber: serialNumber || undefined,
    containers: buildDefaultContainers(),
  };

  const devices = db.devices as DeviceInfo[];
  
  // Clear existing devices (only one dispenser supported for now)
  devices.length = 0;
  devices.push(device);
  db.devices = devices;
  
  // Also clear medications when new device is added
  db.medications = [];
  
  console.log("[Device] POST - Device created:", device.id);
  res.status(201).json(device);
}

export function updateDevice(req: Request, res: Response) {
  const devices = db.devices as DeviceInfo[];
  const target = devices.find((device) => device.id === req.params.id);
  
  if (!target) {
    res.status(404).json({ message: "Device not found" });
    return;
  }

  if (req.body?.name) {
    target.name = String(req.body.name).trim();
  }
  if (typeof req.body?.serialNumber === "string") {
    target.serialNumber = req.body.serialNumber.trim() || undefined;
  }

  db.devices = devices;
  console.log("[Device] PUT - Device updated:", target.id);
  res.json(target);
}

export function deleteDevice(req: Request, res: Response) {
  const devices = db.devices as DeviceInfo[];
  const index = devices.findIndex((device) => device.id === req.params.id);
  
  if (index === -1) {
    res.status(404).json({ message: "Device not found" });
    return;
  }
  
  devices.splice(index, 1);
  db.devices = devices;
  console.log("[Device] DELETE - Device deleted:", req.params.id);
  res.status(204).send();
}

export function updateContainer(req: Request, res: Response) {
  const devices = db.devices as DeviceInfo[];
  const device = devices.find((item) => item.id === req.params.id);
  
  if (!device) {
    console.log("[Device] PUT Container - Device not found:", req.params.id);
    res.status(404).json({ message: "Device not found" });
    return;
  }

  const number = Number(req.params.number);
  const container = device.containers.find((item) => item.number === number);
  
  if (!container) {
    console.log("[Device] PUT Container - Container not found:", number);
    res.status(404).json({ message: "Container not found" });
    return;
  }

  console.log("[Device] PUT Container - Updating container", number, "with:", JSON.stringify(req.body));

  // Update container fields
  if (typeof req.body?.medicationId === "string") {
    container.medicationId = req.body.medicationId;
  }
  if (typeof req.body?.medicationName === "string") {
    container.medicationName = req.body.medicationName.trim();
  }
  if (typeof req.body?.dosage === "string") {
    container.dosage = req.body.dosage.trim();
  }
  if (typeof req.body?.reminderTime === "string") {
    container.reminderTime = req.body.reminderTime.trim();
  }
  if (Array.isArray(req.body?.reminderDays)) {
    container.reminderDays = req.body.reminderDays;
  }
  if (typeof req.body?.reminderEnabled === "boolean") {
    container.reminderEnabled = req.body.reminderEnabled;
  }
  if (typeof req.body?.stockLevel === "string") {
    container.stockLevel = req.body.stockLevel;
  }

  db.devices = devices;
  console.log("[Device] PUT Container - Container updated successfully");
  res.json(container);
}

export async function dispenseFromContainer(req: Request, res: Response) {
  const devices = db.devices as DeviceInfo[];
  const device = devices.find((item) => item.id === req.params.id);
  
  if (!device) {
    res.status(404).json({ message: "Device not found" });
    return;
  }

  const number = Number(req.params.number);
  const command = String(req.body?.command || String(number)).trim();

  console.log("[Device] POST Dispense - Dispensing from container", number, "command:", command);
  
  await arduinoService.dispense(command);
  res.json({ ok: true, command });
}
