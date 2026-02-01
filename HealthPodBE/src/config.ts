import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT || 4000),
  arduino: {
    port: process.env.ARDUINO_PORT || "COM14",
    baudRate: Number(process.env.ARDUINO_BAUD_RATE || 115200),
    mock: process.env.ARDUINO_MOCK === "true",
  },
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY || "",
    baseUrl: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
  },
};


