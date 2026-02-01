import { Request, Response } from "express";
import { randomUUID } from "crypto";
import { Medication } from "../../models/Medication";

// Simple in-memory storage - will persist during server runtime
export const medications: Medication[] = [];

export function getMedications(_req: Request, res: Response) {
  console.log("[Medication] GET - Current medications in memory:", medications.length);
  console.log("[Medication] GET - Medications:", JSON.stringify(medications, null, 2));
  res.json(medications);
}

export function createMedication(req: Request, res: Response) {
  console.log("[Medication] POST - Request body:", JSON.stringify(req.body, null, 2));
  
  if (!req.body.name) {
    res.status(400).json({ message: "Medication name is required" });
    return;
  }

  const med: Medication = {
    id: randomUUID(),
    name: String(req.body.name).trim(),
    dosage: String(req.body.dosage || "").trim(),
    schedule: String(req.body.schedule || "").trim(),
    remaining: Number(req.body.remaining) || 30,
    total: Number(req.body.total) || 30,
    refillThreshold: Number(req.body.refillThreshold) || 5,
  };
  
  medications.push(med);
  console.log("[Medication] POST - Created medication:", JSON.stringify(med, null, 2));
  console.log("[Medication] POST - Total medications now:", medications.length);

  res.status(201).json(med);
}
