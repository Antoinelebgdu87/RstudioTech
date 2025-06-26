import { useState } from "react";
import { Button } from "./button";
import { ScrollArea } from "./scroll-area";
import {
  PlusIcon,
  MessageSquareIcon,
  SettingsIcon,
  TrashIcon,
  BrainCircuitIcon,
} from "lucide-react";
import { Conversation } from "@shared/api";
import { cn } from "@/lib/utils";

interface ChatSidebarProps {
  conversations: Conversation[];
  currentConversationId?: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  models: Array<{
    id: string;
    name: string;
    description: string;
    free: boolean;
  }>;
}

export function ChatSidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  selectedModel,
  onModelChange,
  models,
}: ChatSidebarProps) {
  const [showModels, setShowModels] = useState(false);

  return (
    <div className="flex flex-col h-full bg-sidebar-background border-r border-sidebar-border">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-brand-accent flex items-center justify-center">
            <BrainCircuitIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-sidebar-foreground">
              RStudio Tech
            </h1>
            <p className="text-xs text-sidebar-foreground/60">AI Assistant</p>
          </div>
        </div>

        <Button
          onClick={onNewConversation}
          className="w-full justify-start gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <PlusIcon className="w-4 h-4" />
          New Chat
        </Button>
      </div>

      {/* Model Selection */}
      <div className="p-4 border-b border-sidebar-border">
        <Button
          variant="ghost"
          onClick={() => setShowModels(!showModels)}
          className="w-full justify-between text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-4 h-4" />
            <span className="text-sm">
              {models.find((m) => m.id === selectedModel)?.name ||
                "Select Model"}
            </span>
          </div>
        </Button>

        {showModels && (
          <div className="mt-2 space-y-1">
            {models.map((model) => (
              <Button
                key={model.id}
                variant="ghost"
                onClick={() => {
                  onModelChange(model.id);
                  setShowModels(false);
                }}
                className={cn(
                  "w-full justify-start text-xs p-2 h-auto flex-col items-start",
                  selectedModel === model.id
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                )}
              >
                <div className="flex items-center gap-1 w-full">
                  <span className="font-medium">{model.name}</span>
                  <span className="ml-auto text-xs text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded">
                    FREE
                  </span>
                </div>
                <span className="text-sidebar-foreground/60 text-left">
                  {model.description}
                </span>
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-hidden">
        <div className="p-4 pb-2">
          <h3 className="text-sm font-medium text-sidebar-foreground/80">
            Recent Chats
          </h3>
        </div>
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-1 pb-4">
            {conversations.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquareIcon className="w-8 h-8 mx-auto text-sidebar-foreground/40 mb-2" />
                <p className="text-sm text-sidebar-foreground/60">
                  No conversations yet
                </p>
              </div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={cn(
                    "group flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-sidebar-accent transition-colors",
                    currentConversationId === conversation.id &&
                      "bg-sidebar-accent text-sidebar-accent-foreground",
                  )}
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  <MessageSquareIcon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 text-sm truncate">
                    {conversation.title}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(conversation.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <TrashIcon className="w-3 h-3" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="text-xs text-sidebar-foreground/60 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            <span>All features FREE</span>
          </div>
          <p>Powered by OpenRouter</p>
        </div>
      </div>
    </div>
  );
}
