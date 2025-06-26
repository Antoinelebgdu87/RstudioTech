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
    "microsoft/phi-3-mini-128k-instruct:free",
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
      const response = await fetch("/api/conversations");
      const data: ConversationsResponse = await response.json();
      setConversations(data.conversations);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
  };

  const loadModels = async () => {
    try {
      const response = await fetch("/api/models");
      const data: ModelsResponse = await response.json();
      setModels(data.models);
    } catch (error) {
      console.error("Failed to load models:", error);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    setIsLoading(true);

    try {
      const chatRequest: ChatRequest = {
        message,
        conversationId: currentConversation?.id,
        model: selectedModel,
      };

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(chatRequest),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data: ChatResponse = await response.json();

      // Update current conversation
      if (currentConversation?.id === data.conversationId) {
        // Add both user and assistant messages
        const userMessage: ChatMessageType = {
          id: `user-${Date.now()}`,
          role: "user",
          content: message,
          timestamp: Date.now(),
        };

        setCurrentConversation((prev) =>
          prev
            ? {
                ...prev,
                messages: [...prev.messages, userMessage, data.message],
                updatedAt: Date.now(),
              }
            : null,
        );
      } else {
        // Load the new/updated conversation
        const convResponse = await fetch(
          `/api/conversations/${data.conversationId}`,
        );
        const conversation: Conversation = await convResponse.json();
        setCurrentConversation(conversation);
      }

      // Reload conversations list
      loadConversations();
    } catch (error) {
      console.error("Error sending message:", error);
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

  const EmptyState = () => (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center max-w-2xl mx-auto p-8">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-brand-accent flex items-center justify-center">
          <BrainCircuitIcon className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-brand-accent bg-clip-text text-transparent">
          Welcome to RStudio Tech AI
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Your free AI assistant with premium features. No limits, no
          subscriptions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
            <SparklesIcon className="w-6 h-6 text-primary mb-2" />
            <h3 className="font-semibold mb-1">Smart Conversations</h3>
            <p className="text-sm text-muted-foreground">
              Engage in natural, intelligent conversations
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
            <ZapIcon className="w-6 h-6 text-brand-accent mb-2" />
            <h3 className="font-semibold mb-1">Multiple Models</h3>
            <p className="text-sm text-muted-foreground">
              Choose from various AI models for different tasks
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
            <MessageSquareIcon className="w-6 h-6 text-brand-secondary mb-2" />
            <h3 className="font-semibold mb-1">Chat History</h3>
            <p className="text-sm text-muted-foreground">
              Save and revisit your conversations anytime
            </p>
          </div>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Try asking about:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              "Code review and debugging",
              "Creative writing",
              "Data analysis",
              "Learning new concepts",
              "Problem solving",
            ].map((suggestion) => (
              <Button
                key={suggestion}
                variant="outline"
                size="sm"
                onClick={() => handleSendMessage(`Help me with ${suggestion}`)}
                className="text-xs"
              >
                {suggestion}
              </Button>
            ))}
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
              ? "Type your message..."
              : "Start a new conversation..."
          }
        />
      </div>
    </div>
  );
}
