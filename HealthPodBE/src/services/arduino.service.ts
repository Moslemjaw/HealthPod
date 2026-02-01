import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";
import { config } from "../config";
import { db } from "../utils/json-db";
import { DeviceInfo, StockLevel } from "../models/Device";

// Sensor threshold: < 200 = pills present, >= 200 = empty
const SENSOR_THRESHOLD_EMPTY = 200;
const SENSOR_THRESHOLD_LOW = 150; // Between 150-200 could be "low" stock

type SensorReading = {
  c1: number;
  c2: number;
  c3: number;
};

type ArduinoStatus = {
  isConnected: boolean;
  isMock: boolean;
  port: string;
  baudRate: number;
  lastError?: string;
  lastLine?: string;
  sensorReadings?: SensorReading;
  stockLevels?: { c1: StockLevel; c2: StockLevel; c3: StockLevel };
};

// Convert raw sensor value to stock level
// < 200 = has pills (FULL or MED based on threshold)
// >= 200 = empty (LOW)
function rawToStockLevel(raw: number): StockLevel {
  if (raw < SENSOR_THRESHOLD_LOW) {
    return "FULL"; // Lots of pills (very low sensor reading)
  } else if (raw < SENSOR_THRESHOLD_EMPTY) {
    return "MED"; // Some pills (medium sensor reading)
  } else {
    return "LOW"; // Empty or almost empty (high sensor reading)
  }
}

class ArduinoService {
  private port?: SerialPort;
  private parser?: ReadlineParser;
  private status: ArduinoStatus = {
    isConnected: false,
    isMock: config.arduino.mock,
    port: config.arduino.port,
    baudRate: config.arduino.baudRate,
  };

  connect() {
    if (this.status.isMock) {
      console.log("[Arduino] Mock mode enabled. Skipping serial connection.");
      return;
    }

    if (this.port?.isOpen) {
      return;
    }

    try {
      this.port = new SerialPort({
        path: this.status.port,
        baudRate: this.status.baudRate,
        autoOpen: false,
      });

      this.parser = this.port.pipe(new ReadlineParser({ delimiter: "\n" }));

      this.parser.on("data", (line: string) => {
        const clean = line.trim();
        if (clean) {
          this.status.lastLine = clean;
          console.log(`[Arduino] ${clean}`);
          
          // Parse sensor readings from "Raw: X  Y  Z" format
          this.parseSensorLine(clean);
        }
      });

      this.port.on("open", () => {
        this.status.isConnected = true;
        this.status.lastError = undefined;
        console.log(
          `[Arduino] Connected on ${this.status.port} @ ${this.status.baudRate}`
        );
      });

      this.port.on("close", () => {
        this.status.isConnected = false;
        console.warn("[Arduino] Connection closed.");
      });

      this.port.on("error", (err) => {
        this.status.isConnected = false;
        this.status.lastError = err.message;
        console.error("[Arduino] Serial error:", err.message);
      });

      this.port.open((err) => {
        if (err) {
          this.status.isConnected = false;
          this.status.lastError = err.message;
          console.error("[Arduino] Failed to open port:", err.message);
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.status.isConnected = false;
      this.status.lastError = message;
      console.error("[Arduino] Failed to initialize:", message);
    }
  }

  private parseSensorLine(line: string) {
    // Parse lines like "Raw: 954  1007  1011"
    const match = line.match(/Raw:\s*(\d+)\s+(\d+)\s+(\d+)/);
    if (match) {
      const c1 = parseInt(match[1], 10);
      const c2 = parseInt(match[2], 10);
      const c3 = parseInt(match[3], 10);
      
      this.status.sensorReadings = { c1, c2, c3 };
      this.status.stockLevels = {
        c1: rawToStockLevel(c1),
        c2: rawToStockLevel(c2),
        c3: rawToStockLevel(c3),
      };
      
      // Update device containers in DB
      this.updateDeviceContainers();
    }
  }

  private updateDeviceContainers() {
    if (!this.status.stockLevels) return;
    
    const devices = db.devices as DeviceInfo[];
    if (devices.length === 0) return;
    
    const device = devices[0];
    let changed = false;
    
    const stockMap: Record<number, StockLevel> = {
      1: this.status.stockLevels.c1,
      2: this.status.stockLevels.c2,
      3: this.status.stockLevels.c3,
    };
    
    device.containers.forEach((container) => {
      const newLevel = stockMap[container.number];
      if (newLevel && container.stockLevel !== newLevel) {
        console.log(`[Arduino] Container ${container.number}: ${container.stockLevel} -> ${newLevel}`);
        container.stockLevel = newLevel;
        changed = true;
      }
    });
    
    if (changed) {
      db.devices = devices; // Save to file
      console.log("[Arduino] Stock levels updated and saved:", this.status.stockLevels);
    }
  }

  // Force refresh stock levels from current sensor readings
  forceUpdateStockLevels() {
    if (this.status.sensorReadings) {
      const { c1, c2, c3 } = this.status.sensorReadings;
      this.status.stockLevels = {
        c1: rawToStockLevel(c1),
        c2: rawToStockLevel(c2),
        c3: rawToStockLevel(c3),
      };
      this.updateDeviceContainers();
      return this.status.stockLevels;
    }
    return null;
  }

  async resetConnection() {
    if (this.port?.isOpen) {
      await new Promise<void>((resolve) => this.port?.close(() => resolve()));
    }
    this.connect();
  }

  async dispense(command: string) {
    if (this.status.isMock) {
      return;
    }
    if (!this.port || !this.port.isOpen) {
      throw new Error("Arduino is not connected.");
    }
    await new Promise<void>((resolve, reject) => {
      this.port?.write(`${command}\n`, (err) => {
        if (err) {
          reject(err);
          return;
        }
        this.port?.drain((drainErr) => {
          if (drainErr) {
            reject(drainErr);
            return;
          }
          resolve();
        });
      });
    });
  }

  getStatus(): ArduinoStatus {
    return { ...this.status };
  }

  getSensorReadings(): SensorReading | undefined {
    return this.status.sensorReadings;
  }

  getStockLevels(): { c1: StockLevel; c2: StockLevel; c3: StockLevel } | undefined {
    return this.status.stockLevels;
  }
}

export const arduinoService = new ArduinoService();
