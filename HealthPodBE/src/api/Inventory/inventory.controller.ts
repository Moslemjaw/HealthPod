import { Request, Response } from "express";

const inventory = [
  {
    id: "inv-1",
    medication: "Metformin",
    remaining: 12,
    threshold: 6
  },
  {
    id: "inv-2",
    medication: "Atorvastatin",
    remaining: 8,
    threshold: 5
  }
];

export function getInventory(_req: Request, res: Response) {
  res.json(inventory);
}

