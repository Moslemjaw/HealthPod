import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT || 4000),
  arduino: {
    port: process.env.ARDUINO_PORT || "COM14",
    baudRate: Number(process.env.ARDUINO_BAUD_RATE || 115200),
    mock: process.env.ARDUINO_MOCK === "true",
  },
};


