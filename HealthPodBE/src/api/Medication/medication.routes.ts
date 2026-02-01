import { Router } from "express";
import { getMedications, createMedication, updateMedication, deleteMedication } from "./medication.controller";

export const medicationRouter = Router();

medicationRouter.get("/", getMedications);
medicationRouter.post("/", createMedication);
medicationRouter.put("/:id", updateMedication);
medicationRouter.delete("/:id", deleteMedication);
