/**
 * Types partagés pour le système de licences et d'authentification
 */

export interface License {
  id: string;
  key: string;
  isActive: boolean;
  userId?: string;
  usageCount: number;
  maxUsage: number;
  expiresAt?: number;
  createdAt: number;
  updatedAt: number;
  type: "trial" | "basic" | "premium" | "unlimited";
}

export interface User {
  id: string;
  email?: string;
  licenseKey?: string;
  license?: License;
  createdAt: number;
  lastLogin: number;
  conversationIds: string[];
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  license?: License;
  error?: string;
}

export interface ValidateLicenseRequest {
  licenseKey: string;
}

export interface UsageStats {
  totalUsers: number;
  activeUsers: number;
  totalConversations: number;
  totalMessages: number;
  licenseTypes: {
    trial: number;
    basic: number;
    premium: number;
    unlimited: number;
  };
  dailyUsage: Array<{
    date: string;
    users: number;
    messages: number;
  }>;
}

export interface SavedConversation extends Conversation {
  userId: string;
  isPrivate: boolean;
}

// Réutilisation des types existants
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}
