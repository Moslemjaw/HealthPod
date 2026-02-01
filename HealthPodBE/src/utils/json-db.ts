import fs from "fs";
import path from "path";

// Use process.cwd() to get project root, then build path
const DB_PATH = path.join(process.cwd(), "data", "db.json");

// Ensure directory exists
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

type DBData = {
  devices: any[];
  medications: any[];
};

const defaultData: DBData = {
  devices: [],
  medications: []
};

export class JsonDB {
  private data: DBData;

  constructor() {
    this.data = this.load();
  }

  private load(): DBData {
    try {
      if (fs.existsSync(DB_PATH)) {
        const fileContent = fs.readFileSync(DB_PATH, "utf-8");
        return JSON.parse(fileContent);
      }
    } catch (e) {
      console.error("Failed to load DB", e);
    }
    return { ...defaultData };
  }

  public save() {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2));
    } catch (e) {
      console.error("Failed to save DB", e);
    }
  }

  public get devices() {
    return this.data.devices;
  }

  public set devices(val: any[]) {
    this.data.devices = val;
    this.save();
  }

  public get medications() {
    return this.data.medications;
  }

  public set medications(val: any[]) {
    this.data.medications = val;
    this.save();
  }
}

export const db = new JsonDB();

