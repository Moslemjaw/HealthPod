import { Request, Response } from "express";
import { randomUUID } from "crypto";
import { DeviceInfo } from "../../models/Device";
import { arduinoService } from "../../services/arduino.service";

const devices: DeviceInfo[] = [];

function buildDefaultContainers() {
  return [1, 2, 3].map((number) => ({
    number,
    stockLevel: "LOW" as const,
  }));
}

export function getDevices(_req: Request, res: Response) {
  const arduinoStatus = arduinoService.getStatus();
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

  const device: DeviceInfo = {
    id: randomUUID(),
    type: "healthpod_dispenser",
    name,
    serialNumber: serialNumber || undefined,
    containers: buildDefaultContainers(),
  };

  devices.push(device);
  res.status(201).json(device);
}

export function updateDevice(req: Request, res: Response) {
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

  res.json(target);
}

export function deleteDevice(req: Request, res: Response) {
  const index = devices.findIndex((device) => device.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ message: "Device not found" });
    return;
  }
  devices.splice(index, 1);
  res.status(204).send();
}

export function updateContainer(req: Request, res: Response) {
  const device = devices.find((item) => item.id === req.params.id);
  if (!device) {
    res.status(404).json({ message: "Device not found" });
    return;
  }

  const number = Number(req.params.number);
  const container = device.containers.find((item) => item.number === number);
  if (!container) {
    res.status(404).json({ message: "Container not found" });
    return;
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
  if (typeof req.body?.reminderEnabled === "boolean") {
    container.reminderEnabled = req.body.reminderEnabled;
  }
  if (typeof req.body?.stockLevel === "string") {
    container.stockLevel = req.body.stockLevel;
  }

  res.json(container);
}

export async function dispenseFromContainer(req: Request, res: Response) {
  const device = devices.find((item) => item.id === req.params.id);
  if (!device) {
    res.status(404).json({ message: "Device not found" });
    return;
  }

  const number = Number(req.params.number);
  const command = String(req.body?.command || String(number)).trim();

  await arduinoService.dispense(command);
  res.json({ ok: true, command });
}


