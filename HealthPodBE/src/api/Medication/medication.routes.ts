import { Router } from "express";
import { getMedications, createMedication } from "./medication.controller";

export const medicationRouter = Router();

medicationRouter.get("/", getMedications);
medicationRouter.post("/", createMedication);
