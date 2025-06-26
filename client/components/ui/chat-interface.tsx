import { useState, useEffect, useRef } from "react";
import {
  ChatMessage as ChatMessageType,
  Conversation,
  ChatRequest,
  ChatResponse,
  ModelsResponse,
  ConversationsResponse,
} from "@shared/api";

import { ChatSidebar } from "./chat-sidebar";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { ScrollArea } from "./scroll-area";
import { Button } from "./button";
import {
  BrainCircuitIcon,
  MenuIcon,
  SparklesIcon,
  ZapIcon,
  MessageSquareIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function ChatInterface() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [models, setModels] = useState<
    Array<{
      id: string;
      name: string;
      description: string;
      free: boolean;
    }>
  >([]);
  const [selectedModel, setSelectedModel] = useState(
    "deepseek/deepseek-r1-0528:free",
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages]);

  // Load initial data
  useEffect(() => {
    loadConversations();
    loadModels();
  }, []);

  const loadConversations = async () => {
    try {
      console.log("Chargement des conversations...");
      const response = await fetch("/api/conversations");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setConversations(data.conversations);
      console.log("Conversations chargées:", data.conversations.length);
    } catch (error) {
      console.error("Échec du chargement des conversations:", error);
    }
  };

  const loadModels = async () => {
    try {
      console.log("Chargement des modèles...");
      const response = await fetch("/api/models");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setModels(data.models);
      console.log("Modèles chargés:", data.models.length);
    } catch (error) {
      console.error("Échec du chargement des modèles:", error);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    setIsLoading(true);

    try {
      const chatRequest = {
        message,
        conversationId: currentConversation?.id,
        model: selectedModel,
      };

      console.log("Envoi du message...", chatRequest);

      // Envoyer le message
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(chatRequest),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      console.log("Réponse reçue:", data);

      // Charger la conversation complète depuis le serveur
      try {
        const convResponse = await fetch(
          `/api/conversations/${data.conversationId}`,
        );
        if (convResponse.ok) {
          const conversation = await convResponse.json();
          setCurrentConversation(conversation);
          console.log("Conversation mise à jour:", conversation);
        }
      } catch (convError) {
        console.error("Échec du chargement de la conversation:", convError);
      }

      // Recharger la liste des conversations
      await loadConversations();
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);

      // Afficher un message d'erreur convivial à l'utilisateur
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de l'envoi du message";

      // Créer un message d'erreur dans l'interface
      if (currentConversation) {
        const errorChatMessage: ChatMessageType = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: `❌ **Erreur**: ${errorMessage}\n\nVeuillez réessayer dans quelques instants.`,
          timestamp: Date.now(),
        };

        setCurrentConversation((prev) =>
          prev
            ? {
                ...prev,
                messages: [...prev.messages, errorChatMessage],
                updatedAt: Date.now(),
              }
            : null,
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConversation = async () => {
    try {
      const response = await fetch("/api/conversations/new", {
        method: "POST",
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const newConversation = await response.json();
      setCurrentConversation(newConversation);
      setConversations((prev) => [newConversation, ...prev]);
    } catch (error) {
      console.error("Échec de la création d'une nouvelle conversation:", error);
    }
  };

  const handleSelectConversation = async (id: string) => {
    try {
      const response = await fetch(`/api/conversations/${id}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const conversation = await response.json();
      setCurrentConversation(conversation);
    } catch (error) {
      console.error("Échec du chargement de la conversation:", error);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      setConversations((prev) => prev.filter((conv) => conv.id !== id));
      if (currentConversation?.id === id) {
        setCurrentConversation(null);
      }
    } catch (error) {
      console.error("Échec de la suppression de la conversation:", error);
    }
  };

  const testAPI = async () => {
    try {
      console.log("Test de connectivité API...");
      const response = await fetch("/api/test");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      console.log("Données du test API:", data);
      alert(`Test API RÉUSSI: ${JSON.stringify(data)}`);
    } catch (error) {
      console.error("Test API échoué:", error);
      alert(`Test API ÉCHOUÉ: ${error}`);
    }
  };

  const EmptyState = () => (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center max-w-2xl mx-auto p-8">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-brand-accent flex items-center justify-center">
          <BrainCircuitIcon className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-brand-accent bg-clip-text text-transparent">
          Bienvenue sur RStudio Tech IA
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Votre assistant IA gratuit avec des fonctionnalités premium. Aucune
          limite, aucun abonnement.
        </p>

        <Button onClick={testAPI} variant="outline" className="mb-8">
          🔧 Tester la Connexion API
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
            <SparklesIcon className="w-6 h-6 text-primary mb-2" />
            <h3 className="font-semibold mb-1">Conversations Intelligentes</h3>
            <p className="text-sm text-muted-foreground">
              Engagez des conversations naturelles et intelligentes
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
            <ZapIcon className="w-6 h-6 text-brand-accent mb-2" />
            <h3 className="font-semibold mb-1">Modèles Multiples</h3>
            <p className="text-sm text-muted-foreground">
              Choisissez parmi divers modèles IA pour différentes tâches
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
            <MessageSquareIcon className="w-6 h-6 text-brand-secondary mb-2" />
            <h3 className="font-semibold mb-1">Historique des Chats</h3>
            <p className="text-sm text-muted-foreground">
              Sauvegardez et revisitez vos conversations à tout moment
            </p>
          </div>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Essayez de demander :</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              "Révision et débogage de code",
              "Écriture créative",
              "Analyse de données",
              "Apprentissage de nouveaux concepts",
              "Résolution de problèmes",
            ].map((suggestion, index) => {
              const englishSuggestions = [
                "Code review and debugging",
                "Creative writing",
                "Data analysis",
                "Learning new concepts",
                "Problem solving",
              ];
              return (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleSendMessage(
                      `Aidez-moi avec ${englishSuggestions[index]}`,
                    )
                  }
                  className="text-xs"
                >
                  {suggestion}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          sidebarOpen ? "w-80" : "w-0",
          "lg:relative absolute left-0 top-0 h-full z-40",
        )}
      >
        <div className="w-80 h-full">
          <ChatSidebar
            conversations={conversations}
            currentConversationId={currentConversation?.id}
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
            onDeleteConversation={handleDeleteConversation}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            models={models}
          />
        </div>
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-14 border-b border-border flex items-center justify-between px-4 bg-background/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              <MenuIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex"
            >
              <MenuIcon className="w-4 h-4" />
            </Button>
            <h2 className="font-semibold truncate">
              {currentConversation?.title || "RStudio Tech IA"}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <span>
                {models.find((m) => m.id === selectedModel)?.name ||
                  "Modèle IA"}
              </span>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {!currentConversation || currentConversation.messages.length === 0 ? (
            <EmptyState />
          ) : (
            <ScrollArea className="flex-1">
              <div className="max-w-4xl mx-auto">
                {currentConversation.messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Input Area */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          disabled={false}
          placeholder={
            currentConversation
              ? "Tapez votre message..."
              : "Commencer une nouvelle conversation..."
          }
        />
      </div>
    </div>
  );
}
