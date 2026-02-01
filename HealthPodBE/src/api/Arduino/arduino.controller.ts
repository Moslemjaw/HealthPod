import type { Request, Response } from "express";
import { arduinoService } from "../../services/arduino.service";

export function getArduinoStatus(_req: Request, res: Response) {
  // Force update stock levels before returning status
  arduinoService.forceUpdateStockLevels();
  res.json(arduinoService.getStatus());
}

export async function resetArduinoConnection(_req: Request, res: Response) {
  await arduinoService.resetConnection();
  res.json(arduinoService.getStatus());
}

export function refreshStockLevels(_req: Request, res: Response) {
  const stockLevels = arduinoService.forceUpdateStockLevels();
  res.json({ 
    success: !!stockLevels, 
    stockLevels,
    status: arduinoService.getStatus()
  });
}

