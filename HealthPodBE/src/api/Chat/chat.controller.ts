import type { Request, Response } from "express";
import { randomUUID } from "crypto";
import type { ChatMessage } from "../../models/ChatMessage";

const messages: ChatMessage[] = [];

export function getChat(_req: Request, res: Response) {
  res.json({ messages });
}

export function postChat(req: Request, res: Response) {
  const text = String(req.body?.text || "").trim();
  if (!text) {
    return res.status(400).json({ message: "Message text is required." });
  }

  const message: ChatMessage = {
    id: randomUUID(),
    from: "user",
    text,
    createdAt: new Date().toISOString(),
  };

  messages.push(message);

  return res.status(201).json({ message });
}

