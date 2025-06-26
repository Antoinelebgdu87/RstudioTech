/**
 * Utilitaire robuste pour les appels d'API
 */

// Configuration de base pour les appels d'API
const API_BASE_URL = ""; // URL relative pour Vite dev server
const DEFAULT_TIMEOUT = 30000; // 30 secondes

// Interface pour les options de requête
interface ApiRequestOptions extends RequestInit {
  timeout?: number;
}

/**
 * Fonction fetch robuste avec timeout et gestion d'erreurs
 */
export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { timeout = DEFAULT_TIMEOUT, ...fetchOptions } = options;

  // Créer un AbortController pour le timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    console.log(`[API] Requête vers: ${API_BASE_URL}${endpoint}`);
    console.log(`[API] Options:`, {
      ...fetchOptions,
      signal: controller.signal,
    });

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions.headers,
      },
    });

    clearTimeout(timeoutId);

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
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        console.error("[API] Timeout de la requête");
        throw new Error("La requête a pris trop de temps (timeout)");
      }
      console.error("[API] Erreur:", error.message);
      throw error;
    }

    console.error("[API] Erreur inconnue:", error);
    throw new Error("Erreur inconnue lors de la requête API");
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
