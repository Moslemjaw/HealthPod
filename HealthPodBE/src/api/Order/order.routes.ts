import { Router } from "express";
import { getOrders } from "./order.controller";

export const orderRouter = Router();

orderRouter.get("/", getOrders);

