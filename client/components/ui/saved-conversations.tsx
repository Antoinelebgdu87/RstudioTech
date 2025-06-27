import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useAuthenticatedFetch } from "../../hooks/use-auth";
import { Button } from "./button";
import { ScrollArea } from "./scroll-area";
import { Badge } from "./badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import {
  CloudIcon,
  DownloadIcon,
  TrashIcon,
  MessageSquareIcon,
  CalendarIcon,
} from "lucide-react";

interface SavedConversation {
  id: string;
  title: string;
  messages: any[];
  createdAt: number;
  updatedAt: number;
  savedAt: number;
  userId: string;
  isPrivate: boolean;
}

interface SavedConversationsProps {
  onRestoreConversation: (conversationId: string) => void;
}

export function SavedConversations({
  onRestoreConversation,
}: SavedConversationsProps) {
  const { user, isAuthenticated } = useAuth();
  const { makeAuthenticatedRequest } = useAuthenticatedFetch();
  const [savedConversations, setSavedConversations] = useState<
    SavedConversation[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated && user) {
      loadSavedConversations();
    }
  }, [isAuthenticated, user]);

  const loadSavedConversations = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError("");

      const response = await makeAuthenticatedRequest(
        `/api/save/conversations/${user.id}`,
      );

      if (response.ok) {
        const data = await response.json();
        setSavedConversations(data.conversations || []);
      } else {
        throw new Error("Erreur lors du chargement");
      }
    } catch (error) {
      console.error("Erreur chargement conversations:", error);
      setError("Impossible de charger les conversations sauvegardées");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteConversation = async (conversationId: string) => {
    if (!user || !confirm("Supprimer cette conversation sauvegardée ?")) return;

    try {
      const response = await makeAuthenticatedRequest(
        `/api/save/conversations/${conversationId}/${user.id}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        setSavedConversations((prev) =>
          prev.filter((conv) => conv.id !== conversationId),
        );
      } else {
        throw new Error("Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur suppression:", error);
      setError("Impossible de supprimer la conversation");
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const exportConversation = (conversation: SavedConversation) => {
    const exportData = {
      title: conversation.title,
      messages: conversation.messages,
      exportedAt: Date.now(),
      createdAt: conversation.createdAt,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `conversation-${conversation.title.slice(0, 30)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Conversations sauvegardées</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Connectez-vous pour accéder à vos conversations sauvegardées
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <CloudIcon className="w-4 h-4 mr-2" />
          Conversations sauvegardées
          {savedConversations.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {savedConversations.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CloudIcon className="w-5 h-5" />
            Conversations sauvegardées
          </DialogTitle>
          <DialogDescription>
            Gérez vos conversations sauvegardées dans le cloud
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {savedConversations.length} conversation(s) sauvegardée(s)
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={loadSavedConversations}
              disabled={isLoading}
            >
              {isLoading ? "Chargement..." : "Actualiser"}
            </Button>
          </div>

          <ScrollArea className="h-96">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : savedConversations.length === 0 ? (
              <div className="text-center py-8">
                <CloudIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Aucune conversation sauvegardée
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Utilisez le bouton "Sauvegarder" dans une conversation pour la
                  stocker ici
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedConversations.map((conversation) => (
                  <Card key={conversation.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">
                            {conversation.title}
                          </h4>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MessageSquareIcon className="w-3 h-3" />
                              <span>
                                {conversation.messages.length} messages
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="w-3 h-3" />
                              <span>{formatDate(conversation.savedAt)}</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary" className="ml-2">
                          Privé
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => onRestoreConversation(conversation.id)}
                        >
                          <DownloadIcon className="w-3 h-3 mr-1" />
                          Restaurer
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => exportConversation(conversation)}
                        >
                          <DownloadIcon className="w-3 h-3 mr-1" />
                          Exporter
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteConversation(conversation.id)}
                        >
                          <TrashIcon className="w-3 h-3" />
                        </Button>
                      </div>

                      {conversation.messages.length > 0 && (
                        <div className="p-2 bg-muted rounded text-xs">
                          <p className="truncate">
                            <strong>Dernier message:</strong>{" "}
                            {
                              conversation.messages[
                                conversation.messages.length - 1
                              ].content
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
