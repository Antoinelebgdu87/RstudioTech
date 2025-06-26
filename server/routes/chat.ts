import { RequestHandler } from "express";
import {
  ChatRequest,
  ChatResponse,
  ModelsResponse,
  ConversationsResponse,
  ChatMessage,
  Conversation,
} from "@shared/api";
import { v4 as uuidv4 } from "uuid";

// In-memory storage for conversations (in production, use a database)
const conversations: Map<string, Conversation> = new Map();

const OPENROUTER_API_KEY =
  "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";
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

// Free models available on OpenRouter
const FREE_MODELS = [
  {
    id: "meta-llama/llama-3-8b-instruct:free",
    name: "Llama 3 8B",
    description: "Meta's powerful 8B parameter model",
    free: true,
  },
  {
    id: "google/gemma-3-27b-it:free",
    name: "Gemma 3 27B",
    description: "Google's latest instruction-tuned model",
    free: true,
  },
  {
    id: "deepseek/deepseek-r1:free",
    name: "DeepSeek R1",
    description: "DeepSeek's reasoning model",
    free: true,
  },
  {
    id: "amazon/nova-lite-v1",
    name: "Amazon Nova Lite",
    description: "Amazon's lightweight AI model",
    free: true,
  },
  {
    id: "amazon/nova-micro-v1",
    name: "Amazon Nova Micro",
    description: "Amazon's ultra-fast micro model",
    free: true,
  },
];

export const handleChat: RequestHandler = async (req, res) => {
  try {
    const {
      message,
      conversationId,
      model = "meta-llama/llama-3-8b-instruct:free",
    }: ChatRequest = req.body;

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
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://rstudio-tech.com",
        "X-Title": "RStudio Tech AI",
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 2048,
        stream: false,
      }),
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
    title: "New Chat",
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  conversations.set(newConversation.id, newConversation);
  res.json(newConversation);
};
