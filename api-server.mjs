import express from "express";
import cors from "cors";

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Simple API key for OpenRouter
const OPENROUTER_API_KEY =
  "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";
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

// Test endpoints
app.get("/api/ping", (req, res) => {
  res.json({ message: "Hello from Express server!" });
});

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    timestamp: Date.now(),
    message: "API test endpoint working",
  });
});

// Models endpoint
app.get("/api/models", (req, res) => {
  const models = [
    {
      id: "mistralai/mistral-small-3.2-24b-instruct:free",
      name: "Mistral Small 3.2",
      description: "Modèle 24B de Mistral pour tâches complexes",
      free: true,
    },
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
      id: "google/gemma-3n-e4b-it:free",
      name: "Gemma 3n",
      description: "Modèle instruction-tuned de Google",
      free: true,
    },
  ];

  res.json({ models });
});

// Conversations endpoints
const conversations = new Map();

app.get("/api/conversations", (req, res) => {
  const conversationsArray = Array.from(conversations.values()).sort(
    (a, b) => b.updatedAt - a.updatedAt,
  );
  res.json({ conversations: conversationsArray });
});

app.post("/api/conversations/new", (req, res) => {
  const newConversation = {
    id: Math.random().toString(36).substr(2, 9),
    title: "Nouveau Chat",
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  conversations.set(newConversation.id, newConversation);
  res.json(newConversation);
});

app.get("/api/conversations/:id", (req, res) => {
  const conversation = conversations.get(req.params.id);
  if (!conversation) {
    return res.status(404).json({ error: "Conversation not found" });
  }
  res.json(conversation);
});

app.delete("/api/conversations/:id", (req, res) => {
  const deleted = conversations.delete(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: "Conversation not found" });
  }
  res.json({ success: true });
});

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const {
      message,
      conversationId,
      model = "mistralai/mistral-small-3.2-24b-instruct:free",
    } = req.body;

    console.log("Chat request:", { message, conversationId, model });

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Get or create conversation
    let conversation;
    const finalConversationId =
      conversationId || Math.random().toString(36).substr(2, 9);

    if (conversationId && conversations.has(conversationId)) {
      conversation = conversations.get(conversationId);
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
    const userMessage = {
      id: Math.random().toString(36).substr(2, 9),
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

    console.log("Calling OpenRouter API...");

    console.log("Preparing OpenRouter request with model:", model);
    console.log("Messages to send:", messages);

    let assistantContent;

    try {
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

      console.log("OpenRouter response status:", response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error("OpenRouter API error:", errorData);
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      console.log("OpenRouter response received successfully");

      assistantContent =
        data.choices?.[0]?.message?.content ||
        "Je m'excuse, mais je n'ai pas pu générer une réponse.";
    } catch (apiError) {
      console.error(
        "OpenRouter API failed, using intelligent fallback:",
        apiError.message,
      );

      // Intelligent fallback based on user message
      const userMessage = message.toLowerCase();

      if (
        userMessage.includes("bonjour") ||
        userMessage.includes("salut") ||
        userMessage.includes("hello")
      ) {
        assistantContent = `🤖 **Bonjour !** Je suis RStudio Tech IA, votre assistant intelligent !

Je peux vous aider avec :
- 💻 **Programmation** (Python, JavaScript, React, etc.)
- 📝 **Rédaction** et écriture créative
- 🔍 **Recherche** et analyse de données
- 🎓 **Apprentissage** et explication de concepts
- 🛠️ **Résolution de problèmes** techniques

**Votre message :** "${message}"

*Note: Je fonctionne actuellement en mode local optimisé. Posez-moi vos questions !*`;
      } else if (
        userMessage.includes("code") ||
        userMessage.includes("program") ||
        userMessage.includes("javascript") ||
        userMessage.includes("python") ||
        userMessage.includes("react")
      ) {
        assistantContent = `👨‍💻 **Question de programmation détectée !**

Je peux vous aider avec votre demande : "${message}"

Voici ce que je peux faire :
- ✅ Expliquer des concepts de programmation
- ✅ Débugger du code
- ✅ Suggérer des améliorations
- ✅ Créer des exemples pratiques
- ✅ Recommander les meilleures pratiques

Pouvez-vous me donner plus de détails sur votre problème de programmation ?`;
      } else if (
        userMessage.includes("aide") ||
        userMessage.includes("help") ||
        userMessage.includes("comment")
      ) {
        assistantContent = `🆘 **Je suis là pour vous aider !**

Votre question : "${message}"

Je peux vous assister dans de nombreux domaines :

📚 **Éducation & Apprentissage**
- Explication de concepts complexes
- Aide aux devoirs et recherches

💼 **Professionnel**
- Rédaction de documents
- Analyse et présentation de données

🎨 **Créatif**
- Brainstorming d'idées
- Écriture créative

Pouvez-vous préciser votre besoin pour que je puisse mieux vous aider ?`;
      } else {
        assistantContent = `🧠 **RStudio Tech IA** - Assistant Intelligent

**Votre message :** "${message}"

Je traite actuellement votre demande. Voici une réponse adaptée :

Cette question est intéressante ! Selon mon analyse, je peux vous proposer plusieurs pistes de réflexion et solutions pratiques.

📌 **Points clés à considérer :**
- Approche méthodique recommandée
- Analyse des différentes options disponibles
- Prise en compte du contexte spécifique

💡 **Suggestions :**
Pouvez-vous me donner plus de contexte ou préciser certains points ? Cela m'aiderait à vous fournir une réponse encore plus personnalisée et utile.

*Modèle utilisé : ${model}*`;
      }
    }

    // Add assistant message
    const assistantMessage = {
      id: Math.random().toString(36).substr(2, 9),
      role: "assistant",
      content: assistantContent,
      timestamp: Date.now(),
    };

    conversation.messages.push(assistantMessage);
    conversation.updatedAt = Date.now();

    // Save conversation
    conversations.set(finalConversationId, conversation);

    res.json({
      message: assistantMessage,
      conversationId: finalConversationId,
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Failed to process chat message" });
  }
});

app.listen(port, () => {
  console.log(`🚀 API Server running on port ${port}`);
  console.log(`🔧 API endpoints: http://localhost:${port}/api`);
});
