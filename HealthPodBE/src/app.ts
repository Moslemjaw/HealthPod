import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import { connectDatabase } from "./database";
import { medicationRouter } from "./api/Medication/medication.routes";
import { scheduleRouter } from "./api/Schedule/schedule.routes";
import { inventoryRouter } from "./api/Inventory/inventory.routes";
import { orderRouter } from "./api/Order/order.routes";
import { chatRouter } from "./api/Chat/chat.routes";
import { arduinoRouter } from "./api/Arduino/arduino.routes";
import { deviceRouter } from "./api/Device/device.routes";
import { errorHandler } from "./middeware/ErrorHandling";
import { notFoundHandler } from "./middeware/notFoundHandler";
import { arduinoService } from "./services/arduino.service";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "HealthPod API" });
});

app.use("/api/medications", medicationRouter);
app.use("/api/schedules", scheduleRouter);
app.use("/api/inventory", inventoryRouter);
app.use("/api/orders", orderRouter);
app.use("/api/chat", chatRouter);
app.use("/api/arduino", arduinoRouter);
app.use("/api/devices", deviceRouter);

app.use(notFoundHandler);
app.use(errorHandler);

const port = Number(process.env.PORT || 4000);

connectDatabase();
arduinoService.connect();
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`HealthPod API running on port ${port}`);
});

