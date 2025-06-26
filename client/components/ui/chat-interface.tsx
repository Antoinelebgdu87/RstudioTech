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
    "mistralai/mistral-small-3.2-24b-instruct:free",
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
      console.log("Loading conversations from:", "/api/conversations");
      const response = await fetch("/api/conversations");
      console.log("Conversations response:", response.status, response.ok);
      const data: ConversationsResponse = await response.json();
      setConversations(data.conversations);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
  };

  const loadModels = async () => {
    try {
      console.log("Loading models from:", "/api/models");
      const response = await fetch("/api/models");
      console.log("Models response:", response.status, response.ok);
      const data: ModelsResponse = await response.json();
      setModels(data.models);
      console.log("Loaded models:", data.models.length);
    } catch (error) {
      console.error("Failed to load models:", error);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    setIsLoading(true);

    try {
      // Create user message immediately for optimistic updates
      const userMessage: ChatMessageType = {
        id: `user-${Date.now()}`,
        role: "user",
        content: message,
        timestamp: Date.now(),
      };

      // If no current conversation, create a temporary one for immediate UI update
      if (!currentConversation) {
        const tempConversation: Conversation = {
          id: `temp-${Date.now()}`,
          title: message.slice(0, 50) + (message.length > 50 ? "..." : ""),
          messages: [userMessage],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        setCurrentConversation(tempConversation);
      } else {
        // Add user message to existing conversation
        setCurrentConversation((prev) =>
          prev
            ? {
                ...prev,
                messages: [...prev.messages, userMessage],
                updatedAt: Date.now(),
              }
            : null,
        );
      }

      const chatRequest: ChatRequest = {
        message,
        conversationId: currentConversation?.id,
        model: selectedModel,
      };

      console.log(
        "Sending chat request to:",
        "/api/chat",
        "with data:",
        chatRequest,
      );
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(chatRequest),
      });

      console.log("Chat response:", response.status, response.ok);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Chat response error:", errorText);
        throw new Error(
          `Failed to send message: ${response.status} ${errorText}`,
        );
      }

      const data: ChatResponse = await response.json();

      // Load the complete conversation from the server
      const convResponse = await fetch(
        `/api/conversations/${data.conversationId}`,
      );

      if (convResponse.ok) {
        const conversation: Conversation = await convResponse.json();
        setCurrentConversation(conversation);
      }

      // Reload conversations list
      loadConversations();
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove the optimistic user message on error
      if (currentConversation) {
        setCurrentConversation((prev) =>
          prev
            ? {
                ...prev,
                messages: prev.messages.slice(0, -1), // Remove last message (the user message)
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
      const newConversation: Conversation = await response.json();
      setCurrentConversation(newConversation);
      setConversations((prev) => [newConversation, ...prev]);
    } catch (error) {
      console.error("Failed to create new conversation:", error);
    }
  };

  const handleSelectConversation = async (id: string) => {
    try {
      const response = await fetch(`/api/conversations/${id}`);
      const conversation: Conversation = await response.json();
      setCurrentConversation(conversation);
    } catch (error) {
      console.error("Failed to load conversation:", error);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await fetch(`/api/conversations/${id}`, {
        method: "DELETE",
      });

      setConversations((prev) => prev.filter((conv) => conv.id !== id));

      if (currentConversation?.id === id) {
        setCurrentConversation(null);
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  const testAPI = async () => {
    try {
      console.log("Testing API connectivity...");
      const response = await fetch("/api/test");
      console.log("API test response:", response.status, response.ok);
      const data = await response.json();
      console.log("API test data:", data);
      alert(
        `API test ${response.ok ? "SUCCESS" : "FAILED"}: ${JSON.stringify(data)}`,
      );
    } catch (error) {
      console.error("API test failed:", error);
      alert(`API test FAILED: ${error}`);
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
              {currentConversation?.title || "RStudio Tech AI"}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <span>
                {models.find((m) => m.id === selectedModel)?.name || "AI Model"}
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
