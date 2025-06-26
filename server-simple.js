const express = require("express");
const cors = require("cors");

const app = express();
const port = 3001;

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

// CHAT ENDPOINT - LE PLUS IMPORTANT
app.post("/api/chat", (req, res) => {
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

    // Generate AI response
    let aiResponse = "";
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

En tant qu'IA, je suis toujours prêt à vous aider. Comment puis-je vous assister aujourd'hui ?

Avez-vous des questions ou des tâches sur lesquelles vous aimeriez que je travaille ?`;
    } else if (lowerMsg.includes("code") || lowerMsg.includes("programm")) {
      aiResponse = `👨‍💻 **Question de programmation détectée !**

Je suis spécialisé dans l'aide au développement :

✅ **Languages supportés :**
- JavaScript/TypeScript
- Python
- React/Vue/Angular
- Node.js
- HTML/CSS

✅ **Je peux vous aider à :**
- Débugger votre code
- Optimiser vos algorithmes
- Expliquer des concepts
- Créer des exemples

Montrez-moi votre code ou décrivez votre problème !`;
    } else if (lowerMsg.includes("aide") || lowerMsg.includes("help")) {
      aiResponse = `🆘 **Je suis là pour vous aider !**

**Domaines d'expertise :**

📚 **Éducation**
- Explications de concepts
- Aide aux devoirs
- Tutoriels personnalisés

💼 **Professionnel** 
- Rédaction de documents
- Analyse de données
- Présentation de projets

🎨 **Créatif**
- Brainstorming d'idées
- Écriture créative
- Solutions innovantes

Précisez votre besoin et je vous accompagnerai !`;
    } else {
      aiResponse = `🧠 **Analyse de votre message :**

"${message}"

**Ma réponse :**

C'est une question intéressante ! Voici mon analyse et mes suggestions :

📌 **Points clés :**
- J'ai bien compris votre demande
- Plusieurs approches sont possibles
- Je peux vous proposer des solutions concrètes

💡 **Recommandations :**
- Précisez si besoin certains détails
- Je peux approfondir certains aspects
- N'hésitez pas à poser des questions de suivi

Comment puis-je vous aider davantage sur ce sujet ?`;
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
  console.log(`✅ Prêt à recevoir des requêtes !`);
});
