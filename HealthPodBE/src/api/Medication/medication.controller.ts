import { Request, Response } from "express";
import { randomUUID } from "crypto";
import { Medication } from "../../models/Medication";
import { db } from "../../utils/json-db";

export function getMedications(_req: Request, res: Response) {
  const meds = db.medications as Medication[];
  console.log("[Medication] GET - Returning", meds.length, "medications");
  res.json(meds);
}

export function createMedication(req: Request, res: Response) {
  console.log("[Medication] POST - Creating medication:", JSON.stringify(req.body));
  
  if (!req.body.name) {
    console.log("[Medication] POST - Missing name, rejecting");
    res.status(400).json({ message: "Medication name is required" });
    return;
  }

  // Parse time from schedule if not provided directly
  let time = req.body.time || "09:00";
  if (!req.body.time && req.body.schedule) {
    const timeMatch = req.body.schedule.match(/\d{1,2}:\d{2}/);
    if (timeMatch) time = timeMatch[0];
  }

  // Parse days - default to all days if not provided
  let days = req.body.days || ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  if (typeof days === "string") {
    days = days.split(",").map((d: string) => d.trim());
  }

  const med: Medication = {
    id: randomUUID(),
    name: String(req.body.name).trim(),
    dosage: String(req.body.dosage || "1 pill").trim(),
    schedule: String(req.body.schedule || `Daily at ${time}`).trim(),
    time: time,
    days: days,
    containerNumber: req.body.containerNumber || undefined,
    remaining: Number(req.body.remaining) || 30,
    total: Number(req.body.total) || 30,
    refillThreshold: Number(req.body.refillThreshold) || 5,
  };
  
  const meds = db.medications as Medication[];
  
  // Check if medication with same containerNumber already exists
  if (med.containerNumber) {
    const existingIndex = meds.findIndex(m => m.containerNumber === med.containerNumber);
    if (existingIndex >= 0) {
      // Update existing instead of creating duplicate
      meds[existingIndex] = { ...meds[existingIndex], ...med, id: meds[existingIndex].id };
      db.medications = meds;
      console.log("[Medication] POST - Updated existing medication for container", med.containerNumber);
      res.status(200).json(meds[existingIndex]);
      return;
    }
  }
  
  meds.push(med);
  db.medications = meds;
  console.log("[Medication] POST - Saved. Total medications:", db.medications.length);
  console.log("[Medication] POST - Created:", JSON.stringify(med));

  res.status(201).json(med);
}

export function updateMedication(req: Request, res: Response) {
  const meds = db.medications as Medication[];
  const index = meds.findIndex(m => m.id === req.params.id);
  
  if (index === -1) {
    res.status(404).json({ message: "Medication not found" });
    return;
  }

  const med = meds[index];
  
  if (req.body.name) med.name = String(req.body.name).trim();
  if (req.body.dosage) med.dosage = String(req.body.dosage).trim();
  if (req.body.schedule) med.schedule = String(req.body.schedule).trim();
  if (req.body.time) med.time = String(req.body.time).trim();
  if (req.body.days) med.days = req.body.days;
  if (typeof req.body.remaining === "number") med.remaining = req.body.remaining;
  if (typeof req.body.total === "number") med.total = req.body.total;

  db.medications = meds;
  console.log("[Medication] PUT - Updated medication:", med.id);

  res.json(med);
}

export function deleteMedication(req: Request, res: Response) {
  const meds = db.medications as Medication[];
  const index = meds.findIndex(m => m.id === req.params.id);
  
  if (index === -1) {
    res.status(404).json({ message: "Medication not found" });
    return;
  }

  meds.splice(index, 1);
  db.medications = meds;
  console.log("[Medication] DELETE - Deleted medication:", req.params.id);

  res.status(204).send();
}
