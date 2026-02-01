import { Request, Response } from "express";
import { ScheduleItem } from "../../models/Schedule";

const schedules: ScheduleItem[] = [
  {
    id: "schedule-1",
    medicationId: "med-1",
    time: "08:00",
    frequency: "Daily",
    isConfirmed: false
  },
  {
    id: "schedule-2",
    medicationId: "med-2",
    time: "21:00",
    frequency: "Daily",
    isConfirmed: true
  }
];

export function getSchedules(_req: Request, res: Response) {
  res.json(schedules);
}

export function confirmSchedule(req: Request, res: Response) {
  const target = schedules.find((item) => item.id === req.params.id);
  if (!target) {
    res.status(404).json({ message: "Schedule not found" });
    return;
  }
  target.isConfirmed = true;
  res.json(target);
}

