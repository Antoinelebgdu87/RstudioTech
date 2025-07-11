import { RequestHandler } from "express";
import {
  ChatRequest,
  ChatResponse,
  ModelsResponse,
  ConversationsResponse,
  ChatMessage,
  Conversation,
} from "@shared/api";
import { FirebaseService } from "../firebase-config";
import { v4 as uuidv4 } from "uuid";

// In-memory storage for conversations (in production, use a database)
const conversations: Map<string, Conversation> = new Map();

const OPENROUTER_API_KEY =
  "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";
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

// Modèles gratuits disponibles sur OpenRouter
const FREE_MODELS = [
  {
    id: "deepseek/deepseek-r1-0528:free",
    name: "DeepSeek R1",
    description: "Modèle de raisonnement avancé de DeepSeek",
    free: true,
  },
  {
    id: "qwen/qwen3-8b:free",
    name: "Qwen 3 8B",
    description: "Modèle efficace 8B d'Alibaba",
    free: true,
  },
  {
    id: "qwen/qwen3-14b:free",
    name: "Qwen 3 14B",
    description: "Modèle plus puissant 14B d'Alibaba",
    free: true,
  },
  {
    id: "mistralai/devstral-small:free",
    name: "Devstral Small",
    description: "Modèle de développement axé code de Mistral",
    free: true,
  },
  {
    id: "google/gemma-3n-e4b-it:free",
    name: "Gemma 3n",
    description: "Modèle instruction-tuned de Google",
    free: true,
  },
];

export const handleChat: RequestHandler = async (req, res) => {
  try {
    console.log("=== CHAT REQUEST ===");
    console.log("Body:", req.body);
    console.log("API Key available:", OPENROUTER_API_KEY ? "YES" : "NO");
    console.log(
      "API Key prefix:",
      OPENROUTER_API_KEY?.substring(0, 15) + "...",
    );

    // Vérifier la licence si fournie
    const licenseKey = req.headers["x-license-key"] as string;
    if (licenseKey) {
      const validation = await FirebaseService.validateLicense(licenseKey);
      if (!validation.valid) {
        return res.status(401).json({
          error: validation.error || "Licence invalide",
        });
      }

      // Vérifier la limite d'usage
      const license = validation.license;
      if (license.usageCount >= license.maxUsage) {
        return res.status(403).json({
          error: "Limite d'usage atteinte pour votre licence",
        });
      }
    }

    const {
      message,
      conversationId,
      model = "deepseek/deepseek-r1-0528:free",
    }: ChatRequest = req.body;

    console.log("Parsed request:", { message, conversationId, model });

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Get or create conversation
    let conversation: Conversation;
    const finalConversationId = conversationId || uuidv4();

    if (conversationId && conversations.has(conversationId)) {
      conversation = conversations.get(conversationId)!;
    } else {
      conversation = {
        id: finalConversationId,
        title: message.slice(0, 50) + (message.length > 50 ? "..." : ""),
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: "user",
      content: message,
      timestamp: Date.now(),
    };

    conversation.messages.push(userMessage);
    conversation.updatedAt = Date.now();

    // Prepare messages for OpenRouter
    const messages = conversation.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Call OpenRouter API
    const requestBody = {
      model: model,
      messages: messages,
      temperature: 0.7,
      max_tokens: 2048,
      stream: false,
    };

    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://rstudio-tech.com",
        "X-Title": "RStudio Tech AI",
        "User-Agent": "RStudio-Tech-AI/1.0",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenRouter API error:", errorData);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantContent =
      data.choices?.[0]?.message?.content ||
      "I apologize, but I couldn't generate a response.";

    // Add assistant message
    const assistantMessage: ChatMessage = {
      id: uuidv4(),
      role: "assistant",
      content: assistantContent,
      timestamp: Date.now(),
    };

    conversation.messages.push(assistantMessage);
    conversation.updatedAt = Date.now();

    // Save conversation
    conversations.set(finalConversationId, conversation);

    // Incrémenter l'usage de la licence si applicable
    if (licenseKey) {
      await FirebaseService.incrementUsage(licenseKey);
    }

    const chatResponse: ChatResponse = {
      message: assistantMessage,
      conversationId: finalConversationId,
    };

    res.json(chatResponse);
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Failed to process chat message" });
  }
};

export const handleGetModels: RequestHandler = (_req, res) => {
  const modelsResponse: ModelsResponse = {
    models: FREE_MODELS,
  };
  res.json(modelsResponse);
};

export const handleGetConversations: RequestHandler = (_req, res) => {
  const conversationsArray = Array.from(conversations.values()).sort(
    (a, b) => b.updatedAt - a.updatedAt,
  );

  const conversationsResponse: ConversationsResponse = {
    conversations: conversationsArray,
  };

  res.json(conversationsResponse);
};

export const handleGetConversation: RequestHandler = (req, res) => {
  const { id } = req.params;
  const conversation = conversations.get(id);

  if (!conversation) {
    return res.status(404).json({ error: "Conversation not found" });
  }

  res.json(conversation);
};

export const handleDeleteConversation: RequestHandler = (req, res) => {
  const { id } = req.params;
  const deleted = conversations.delete(id);

  if (!deleted) {
    return res.status(404).json({ error: "Conversation not found" });
  }

  res.json({ success: true });
};

export const handleNewConversation: RequestHandler = (_req, res) => {
  const newConversation: Conversation = {
    id: uuidv4(),
    title: "Nouveau Chat",
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  conversations.set(newConversation.id, newConversation);
  res.json(newConversation);
};
