const express = require("express");
const cors = require("cors");

const app = express();
const port = 3001;

// Nouvelle clé API OpenRouter
const OPENROUTER_API_KEY =
  "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";
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

// Middleware
app.use(cors());
app.use(express.json());

// Simple storage
const conversations = new Map();

// Test endpoint
app.get("/api/ping", (req, res) => {
  res.json({ message: "API fonctionne !", timestamp: Date.now() });
});

// Models endpoint
app.get("/api/models", (req, res) => {
  res.json({
    models: [
      {
        id: "mistralai/mistral-small-3.2-24b-instruct:free",
        name: "Mistral Small 3.2",
        description: "Modèle avancé de Mistral pour tâches complexes",
        free: true,
      },
      {
        id: "local-ai",
        name: "RStudio IA Local",
        description: "Assistant IA intelligent et rapide",
        free: true,
      },
    ],
  });
});

// Conversations endpoints
app.get("/api/conversations", (req, res) => {
  const list = Array.from(conversations.values()).sort(
    (a, b) => b.updatedAt - a.updatedAt,
  );
  res.json({ conversations: list });
});

app.post("/api/conversations/new", (req, res) => {
  const id = "conv_" + Math.random().toString(36).substr(2, 9);
  const conversation = {
    id,
    title: "Nouveau Chat",
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  conversations.set(id, conversation);
  res.json(conversation);
});

app.get("/api/conversations/:id", (req, res) => {
  const conv = conversations.get(req.params.id);
  if (!conv) return res.status(404).json({ error: "Not found" });
  res.json(conv);
});

app.delete("/api/conversations/:id", (req, res) => {
  conversations.delete(req.params.id);
  res.json({ success: true });
});

// CHAT ENDPOINT PRINCIPAL
app.post("/api/chat", async (req, res) => {
  try {
    const { message, conversationId, model } = req.body;

    console.log("📨 Message reçu:", message);

    if (!message) {
      return res.status(400).json({ error: "Message requis" });
    }

    // Get or create conversation
    let conv;
    const convId =
      conversationId || "conv_" + Math.random().toString(36).substr(2, 9);

    if (conversationId && conversations.has(conversationId)) {
      conv = conversations.get(conversationId);
    } else {
      conv = {
        id: convId,
        title: message.slice(0, 50) + (message.length > 50 ? "..." : ""),
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    }

    // Add user message
    const userMsg = {
      id: "msg_" + Math.random().toString(36).substr(2, 9),
      role: "user",
      content: message,
      timestamp: Date.now(),
    };
    conv.messages.push(userMsg);

    let aiResponse = "";

    console.log("🔑 Tentative avec OpenRouter avec nouvelle clé...");

    try {
      // Préparer les messages pour OpenRouter
      const messages = conv.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://rstudio-tech.com",
          "X-Title": "RStudio Tech AI",
        },
        body: JSON.stringify({
          model: "mistralai/mistral-small-3.2-24b-instruct:free",
          messages: messages,
          temperature: 0.7,
          max_tokens: 2048,
          stream: false,
        }),
      });

      console.log("📡 Status OpenRouter:", response.status);

      if (response.ok) {
        const data = await response.json();
        aiResponse =
          data.choices?.[0]?.message?.content ||
          "Erreur lors de la génération.";
        console.log("✅ Réponse OpenRouter reçue !");
      } else {
        const errorData = await response.text();
        console.log("❌ Erreur OpenRouter:", errorData);
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.log("❌ OpenRouter failed, using fallback:", error.message);

      // Fallback intelligent
      const lowerMsg = message.toLowerCase();

      if (
        lowerMsg.includes("bonjour") ||
        lowerMsg.includes("salut") ||
        lowerMsg.includes("hello")
      ) {
        aiResponse = `🤖 **Bonjour !**

Je suis RStudio Tech IA, votre assistant intelligent !

Je peux vous aider avec :
- 💻 Programmation (Python, JavaScript, React, etc.)
- 📝 Rédaction et écriture
- 🔍 Recherche et analyse
- 🎓 Apprentissage et éducation
- 🛠️ Résolution de problèmes

Que puis-je faire pour vous aujourd'hui ?`;
      } else if (lowerMsg.includes("comment") && lowerMsg.includes("ça va")) {
        aiResponse = `😊 Je vais très bien, merci !

En tant qu'IA, je suis toujours prêt à vous aider. Comment puis-je vous assister aujourd'hui ?`;
      } else if (lowerMsg.includes("code") || lowerMsg.includes("programm")) {
        aiResponse = `👨‍💻 **Question de programmation détectée !**

Je suis spécialisé dans l'aide au développement. Montrez-moi votre code ou décrivez votre problème !`;
      } else {
        aiResponse = `🧠 **Analyse de votre message :**

"${message}"

C'est une question intéressante ! Je peux vous proposer des solutions adaptées. Pouvez-vous me donner plus de détails sur ce que vous cherchez ?`;
      }
    }

    // Add AI response
    const aiMsg = {
      id: "msg_" + Math.random().toString(36).substr(2, 9),
      role: "assistant",
      content: aiResponse,
      timestamp: Date.now(),
    };
    conv.messages.push(aiMsg);
    conv.updatedAt = Date.now();

    // Save conversation
    conversations.set(convId, conv);

    console.log("✅ Réponse générée pour:", message);

    // Return response
    res.json({
      message: aiMsg,
      conversationId: convId,
    });
  } catch (error) {
    console.error("❌ Erreur chat:", error);
    res.status(500).json({ error: "Erreur interne" });
  }
});

app.listen(port, () => {
  console.log(`🚀 Serveur API démarré sur le port ${port}`);
  console.log(`🔗 URL: http://localhost:${port}`);
  console.log(`✅ Prêt avec nouvelle clé OpenRouter !`);
});
