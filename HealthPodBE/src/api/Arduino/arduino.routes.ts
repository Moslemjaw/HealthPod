import { Router } from "express";
import {
  getArduinoStatus,
  resetArduinoConnection,
} from "./arduino.controller";

export const arduinoRouter = Router();

arduinoRouter.get("/status", getArduinoStatus);
arduinoRouter.post("/reset", resetArduinoConnection);

