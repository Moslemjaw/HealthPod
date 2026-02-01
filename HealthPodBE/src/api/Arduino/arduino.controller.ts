import type { Request, Response } from "express";
import { arduinoService } from "../../services/arduino.service";

export function getArduinoStatus(_req: Request, res: Response) {
  res.json(arduinoService.getStatus());
}

export async function resetArduinoConnection(_req: Request, res: Response) {
  await arduinoService.resetConnection();
  res.json(arduinoService.getStatus());
}

import { arduinoService } from "../../services/arduino.service";

export function getArduinoStatus(_req: Request, res: Response) {
  res.json(arduinoService.getStatus());
}

export async function resetArduinoConnection(_req: Request, res: Response) {
  await arduinoService.resetConnection();
  res.json(arduinoService.getStatus());
}

