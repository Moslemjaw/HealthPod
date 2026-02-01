import { Router } from "express";
import {
  getArduinoStatus,
  resetArduinoConnection,
  refreshStockLevels,
} from "./arduino.controller";

export const arduinoRouter = Router();

arduinoRouter.get("/status", getArduinoStatus);
arduinoRouter.post("/reset", resetArduinoConnection);
arduinoRouter.post("/refresh", refreshStockLevels);

