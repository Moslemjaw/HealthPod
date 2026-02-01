import { Router } from "express";
import {
  createDevice,
  deleteDevice,
  dispenseFromContainer,
  getDevices,
  updateContainer,
  updateDevice,
} from "./device.controller";

export const deviceRouter = Router();

deviceRouter.get("/", getDevices);
deviceRouter.post("/", createDevice);
deviceRouter.put("/:id", updateDevice);
deviceRouter.delete("/:id", deleteDevice);
deviceRouter.put("/:id/containers/:number", updateContainer);
deviceRouter.post("/:id/containers/:number/dispense", dispenseFromContainer);

