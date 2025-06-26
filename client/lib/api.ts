/**
 * Utilitaire simple pour les appels d'API
 */

/**
 * Fonction fetch simple sans timeout compliqué
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  try {
    console.log(`[API] Requête vers: ${endpoint}`);

    const response = await fetch(endpoint, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    console.log(`[API] Réponse reçue:`, response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API] Erreur ${response.status}:`, errorText);
      throw new Error(`Erreur API ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log(`[API] Données reçues:`, data);

    return data;
  } catch (error) {
    console.error("[API] Erreur:", error);
    throw error;
  }
}

/**
 * Fonctions spécifiques pour chaque endpoint
 */
export const api = {
  // Test de connectivité
  test: () =>
    apiRequest<{ success: boolean; message: string; timestamp: number }>(
      "/api/test",
    ),

  // Ping
  ping: () => apiRequest<{ message: string }>("/api/ping"),

  // Modèles
  getModels: () =>
    apiRequest<{
      models: Array<{
        id: string;
        name: string;
        description: string;
        free: boolean;
      }>;
    }>("/api/models"),

  // Conversations
  getConversations: () =>
    apiRequest<{ conversations: Array<any> }>("/api/conversations"),
  getConversation: (id: string) => apiRequest<any>(`/api/conversations/${id}`),
  deleteConversation: (id: string) =>
    apiRequest<{ success: boolean }>(`/api/conversations/${id}`, {
      method: "DELETE",
    }),
  newConversation: () =>
    apiRequest<any>("/api/conversations/new", { method: "POST" }),

  // Chat
  sendMessage: (data: {
    message: string;
    conversationId?: string;
    model?: string;
  }) =>
    apiRequest<{ message: any; conversationId: string }>("/api/chat", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
