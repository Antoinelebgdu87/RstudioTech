// Système de fallback intelligent pour quand l'API n'est pas disponible
import type { ChatMessage, Conversation } from "@shared/api";

class APIFallback {
  private conversations: Map<string, Conversation> = new Map();
  private models = [
    {
      id: "qwen/qwen3-8b:free",
      name: "Qwen 3 8B ⚡",
      description: "Modèle ultra-rapide et intelligent",
      free: true,
    },
    {
      id: "mistralai/devstral-small:free",
      name: "Devstral Small 💻",
      description: "Spécialisé en programmation",
      free: true,
    },
    {
      id: "qwen/qwen3-14b:free",
      name: "Qwen 3 14B 🧠",
      description: "Plus puissant pour tâches complexes",
      free: true,
    },
  ];

  // Vérifier si l'API est disponible
  async checkAPIHealth(): Promise<boolean> {
    try {
      const response = await fetch("/api/ping", {
        method: "GET",
        signal: AbortSignal.timeout(3000), // Timeout de 3 secondes
      });
      return response.ok;
    } catch (error) {
      console.log("🔄 API non disponible, utilisation du mode fallback");
      return false;
    }
  }

  // Générer une réponse IA intelligente
  generateAIResponse(userMessage: string): string {
    const lowerMsg = userMessage.toLowerCase();

    // Salutations
    if (
      lowerMsg.includes("bonjour") ||
      lowerMsg.includes("salut") ||
      lowerMsg.includes("hello")
    ) {
      return `🤖 **Bonjour !**

Je suis RStudio Tech IA, votre assistant intelligent !

✨ **Mode démo activé** - L'API est temporairement indisponible, mais je peux encore vous aider !

Je peux vous assister avec :
- 💻 Questions de programmation
- 📝 Aide à la rédaction  
- 🔍 Conseils et suggestions
- 🎓 Explications techniques
- 🛠️ Résolution de problèmes

Que puis-je faire pour vous ?`;
    }

    // Questions sur la programmation
    if (
      lowerMsg.includes("code") ||
      lowerMsg.includes("programmation") ||
      lowerMsg.includes("développement")
    ) {
      return `💻 **Expert en Programmation**

Excellente question sur le développement ! Voici mes recommandations :

**Langages populaires en 2024 :**
- **JavaScript/TypeScript** - Web développement moderne
- **Python** - IA, data science, backend
- **React** - Interfaces utilisateur modernes
- **Node.js** - Backend JavaScript

**Bonnes pratiques :**
- ✅ Code propre et commenté
- ✅ Tests automatisés
- ✅ Version control (Git)
- ✅ Documentation claire

Avez-vous un projet spécifique en tête ?`;
    }

    // Questions sur React
    if (lowerMsg.includes("react") || lowerMsg.includes("composant")) {
      return `⚛️ **Expert React**

React est fantastique pour créer des interfaces modernes !

**Concepts clés :**
- **Components** - Blocs réutilisables
- **Hooks** - useState, useEffect, etc.
- **Props** - Passage de données
- **State** - Gestion d'état

**Exemple de composant simple :**
\`\`\`jsx
function MonComposant({ titre }) {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <h1>{titre}</h1>
      <button onClick={() => setCount(count + 1)}>
        Clics: {count}
      </button>
    </div>
  );
}
\`\`\`

Que voulez-vous apprendre sur React ?`;
    }

    // Questions générales
    return `🧠 **Assistant IA - Mode Démo**

"${userMessage}"

C'est une question intéressante ! Voici mon analyse :

**💡 Suggestions :**
- Pouvez-vous être plus spécifique sur ce que vous cherchez ?
- Y a-t-il un domaine particulier qui vous intéresse ?
- Avez-vous besoin d'aide avec un projet concret ?

**🎯 Je peux vous aider avec :**
- Conseils techniques et développement
- Explications de concepts
- Brainstorming d'idées
- Résolution de problèmes

**ℹ️ Note :** Mode démo actif - L'API sera bientôt restaurée pour des réponses encore plus avancées !

Que souhaitez-vous explorer ensuite ?`;
  }

  // Simuler l'API chat
  async simulateChat(
    message: string,
    conversationId?: string,
  ): Promise<{
    message: ChatMessage;
    conversationId: string;
  }> {
    // Délai simulé pour le réalisme
    await new Promise((resolve) =>
      setTimeout(resolve, 1000 + Math.random() * 2000),
    );

    const convId = conversationId || `conv_demo_${Date.now()}`;

    // Créer la réponse IA
    const aiResponse: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: "assistant",
      content: this.generateAIResponse(message),
      timestamp: Date.now(),
    };

    return {
      message: aiResponse,
      conversationId: convId,
    };
  }

  // Simuler l'API models
  getModels() {
    return { models: this.models };
  }

  // Simuler l'API conversations
  getConversations() {
    return { conversations: Array.from(this.conversations.values()) };
  }

  // Créer nouvelle conversation
  createNewConversation(): Conversation {
    const id = `conv_demo_${Date.now()}`;
    const conversation: Conversation = {
      id,
      title: "Nouveau Chat (Démo)",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.conversations.set(id, conversation);
    return conversation;
  }
}

export const apiFallback = new APIFallback();
