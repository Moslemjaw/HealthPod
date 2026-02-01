import { Request, Response } from "express";
import { Order } from "../../models/Order";

const orders: Order[] = [
  {
    id: "order-1",
    item: "Metformin Cartridge Pack",
    status: "processing",
    placedOn: "2026-01-16"
  },
  {
    id: "order-2",
    item: "Vitamin D Refill Pack",
    status: "shipped",
    placedOn: "2026-01-08"
  }
];

export function getOrders(_req: Request, res: Response) {
  res.json(orders);
}

