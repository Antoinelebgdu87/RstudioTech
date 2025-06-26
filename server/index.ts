import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  handleChat,
  handleGetModels,
  handleGetConversations,
  handleGetConversation,
  handleDeleteConversation,
  handleNewConversation,
} from "./routes/chat";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  app.get("/api/demo", handleDemo);

  // Chat API routes
  app.post("/api/chat", handleChat);
  app.get("/api/models", handleGetModels);
  app.get("/api/conversations", handleGetConversations);
  app.get("/api/conversations/:id", handleGetConversation);
  app.delete("/api/conversations/:id", handleDeleteConversation);
  app.post("/api/conversations/new", handleNewConversation);

  return app;
}
