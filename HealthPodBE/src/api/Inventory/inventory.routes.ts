import { Router } from "express";
import { getInventory } from "./inventory.controller";

export const inventoryRouter = Router();

inventoryRouter.get("/", getInventory);

