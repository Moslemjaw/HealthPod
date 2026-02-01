import { Router } from "express";
import { getMedications } from "./medication.controller";

export const medicationRouter = Router();

medicationRouter.get("/", getMedications);

