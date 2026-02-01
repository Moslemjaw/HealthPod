export type ScheduleItem = {
  id: string;
  medicationId: string;
  time: string;
  frequency: string;
  isConfirmed: boolean;
  days?: string[]; // Days this schedule applies to
};

