import { Router } from "express";
import { getChat, postChat } from "./chat.controller";

export const chatRouter = Router();

chatRouter.get("/", getChat);
chatRouter.post("/", postChat);

