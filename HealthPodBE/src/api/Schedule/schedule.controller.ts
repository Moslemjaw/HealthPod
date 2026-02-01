import { Request, Response } from "express";
import { ScheduleItem } from "../../models/Schedule";
import { medications } from "../Medication/medication.controller";

export function getSchedules(_req: Request, res: Response) {
  console.log("[Schedule] GET - Medications available:", medications.length);
  console.log("[Schedule] GET - Medications:", JSON.stringify(medications, null, 2));
  
  // Dynamically generate schedules from medications
  const generatedSchedules: ScheduleItem[] = medications.map((med) => {
    // Parse time from schedule string - handle formats like:
    // "Daily at 08:00", "at 08:00", "08:00", etc.
    let time = "09:00"; // Default fallback
    
    if (med.schedule) {
      // Try multiple patterns
      const patterns = [
        /\d{1,2}:\d{2}/,  // "08:00" or "8:00"
        /at\s+(\d{1,2}:\d{2})/i,  // "at 08:00"
        /(\d{1,2}):(\d{2})/,  // "8:00"
      ];
      
      for (const pattern of patterns) {
        const match = med.schedule.match(pattern);
        if (match) {
          time = match[0].includes(':') ? match[0] : `${match[1]}:${match[2]}`;
          // Normalize to HH:MM format
          const [hours, minutes] = time.split(':');
          time = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
          break;
        }
      }
    }

    return {
      id: `sched-${med.id}`,
      medicationId: med.id,
      time: time,
      frequency: "Daily",
      isConfirmed: false
    };
  });

  // Sort by time
  generatedSchedules.sort((a, b) => a.time.localeCompare(b.time));
  console.log("[Schedule] GET - Generated schedules:", JSON.stringify(generatedSchedules, null, 2));

  res.json(generatedSchedules);
}

export function confirmSchedule(req: Request, res: Response) {
  const id = req.params.id;
  res.json({
    id,
    isConfirmed: true
  });
}
