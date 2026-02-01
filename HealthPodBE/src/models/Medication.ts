export type Medication = {
  id: string;
  name: string;
  dosage: string;
  schedule: string;
  time: string;
  days: string[]; // ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  containerNumber?: number; // 1, 2, or 3 for dispenser-linked meds
  remaining: number;
  total: number;
  refillThreshold: number;
};

