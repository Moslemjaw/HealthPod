import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";
import { config } from "../config";

type ArduinoStatus = {
  isConnected: boolean;
  isMock: boolean;
  port: string;
  baudRate: number;
  lastError?: string;
  lastLine?: string;
};

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
      // eslint-disable-next-line no-console
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
          // eslint-disable-next-line no-console
          console.log(`[Arduino] ${clean}`);
        }
      });

      this.port.on("open", () => {
        this.status.isConnected = true;
        this.status.lastError = undefined;
        // eslint-disable-next-line no-console
        console.log(
          `[Arduino] Connected on ${this.status.port} @ ${this.status.baudRate}`
        );
      });

      this.port.on("close", () => {
        this.status.isConnected = false;
        // eslint-disable-next-line no-console
        console.warn("[Arduino] Connection closed.");
      });

      this.port.on("error", (err) => {
        this.status.isConnected = false;
        this.status.lastError = err.message;
        // eslint-disable-next-line no-console
        console.error("[Arduino] Serial error:", err.message);
      });

      this.port.open((err) => {
        if (err) {
          this.status.isConnected = false;
          this.status.lastError = err.message;
          // eslint-disable-next-line no-console
          console.error("[Arduino] Failed to open port:", err.message);
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.status.isConnected = false;
      this.status.lastError = message;
      // eslint-disable-next-line no-console
      console.error("[Arduino] Failed to initialize:", message);
    }
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
}

export const arduinoService = new ArduinoService();

import { ReadlineParser } from "@serialport/parser-readline";
import { config } from "../config";

type ArduinoStatus = {
  isConnected: boolean;
  isMock: boolean;
  port: string;
  baudRate: number;
  lastError?: string;
  lastLine?: string;
};

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
      // eslint-disable-next-line no-console
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
          // eslint-disable-next-line no-console
          console.log(`[Arduino] ${clean}`);
        }
      });

      this.port.on("open", () => {
        this.status.isConnected = true;
        this.status.lastError = undefined;
        // eslint-disable-next-line no-console
        console.log(
          `[Arduino] Connected on ${this.status.port} @ ${this.status.baudRate}`
        );
      });

      this.port.on("close", () => {
        this.status.isConnected = false;
        // eslint-disable-next-line no-console
        console.warn("[Arduino] Connection closed.");
      });

      this.port.on("error", (err) => {
        this.status.isConnected = false;
        this.status.lastError = err.message;
        // eslint-disable-next-line no-console
        console.error("[Arduino] Serial error:", err.message);
      });

      this.port.open((err) => {
        if (err) {
          this.status.isConnected = false;
          this.status.lastError = err.message;
          // eslint-disable-next-line no-console
          console.error("[Arduino] Failed to open port:", err.message);
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.status.isConnected = false;
      this.status.lastError = message;
      // eslint-disable-next-line no-console
      console.error("[Arduino] Failed to initialize:", message);
    }
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
}

export const arduinoService = new ArduinoService();

