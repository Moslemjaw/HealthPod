import { Request, Response } from "express";
import { ScheduleItem } from "../../models/Schedule";
import { db } from "../../utils/json-db";
import { Medication } from "../../models/Medication";

export function getSchedules(_req: Request, res: Response) {
  const medications = db.medications as Medication[];
  console.log("[Schedule] GET - Found", medications.length, "medications to generate schedules from");
  
  // Return ALL medications as schedules - frontend will filter by selected day
  const generatedSchedules: ScheduleItem[] = medications.map((med) => {
    // Use the time field directly, or parse from schedule string
    let time = med.time || "09:00";
    if (!med.time && med.schedule) {
      const timeMatch = med.schedule.match(/\d{1,2}:\d{2}/);
      if (timeMatch) time = timeMatch[0];
    }
    
    // Normalize time to HH:MM format
    const [hours, minutes] = time.split(":");
    time = `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;

    // Determine frequency display
    const frequency = med.days?.length === 7 || !med.days 
      ? "Daily" 
      : med.days.join(", ");

    return {
      id: `sched-${med.id}`,
      medicationId: med.id,
      time: time,
      frequency: frequency,
      isConfirmed: false,
      days: med.days || ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], // Include days for frontend filtering
    };
  });

  // Sort by time
  generatedSchedules.sort((a, b) => a.time.localeCompare(b.time));
  console.log("[Schedule] GET - Returning", generatedSchedules.length, "schedules");

  res.json(generatedSchedules);
}

export function confirmSchedule(req: Request, res: Response) {
  const id = req.params.id;
  // In a real app, you'd store this confirmation in the database
  // For now, just return the confirmed state
  console.log("[Schedule] PATCH - Confirming schedule:", id);
  res.json({
    id,
    isConfirmed: true
  });
}
