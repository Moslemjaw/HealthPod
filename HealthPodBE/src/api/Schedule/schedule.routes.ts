import { Router } from "express";
import { confirmSchedule, getSchedules } from "./schedule.controller";

export const scheduleRouter = Router();

scheduleRouter.get("/", getSchedules);
scheduleRouter.patch("/:id/confirm", confirmSchedule);

