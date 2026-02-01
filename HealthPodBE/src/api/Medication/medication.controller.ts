import { Request, Response } from "express";
import { Medication } from "../../models/Medication";

const medications: Medication[] = [
  {
    id: "med-1",
    name: "Metformin",
    dosage: "500mg",
    schedule: "8:00 AM • Daily",
    remaining: 12,
    total: 30,
    refillThreshold: 6
  },
  {
    id: "med-2",
    name: "Atorvastatin",
    dosage: "20mg",
    schedule: "9:00 PM • Daily",
    remaining: 8,
    total: 30,
    refillThreshold: 5
  }
];

export function getMedications(_req: Request, res: Response) {
  res.json(medications);
}

