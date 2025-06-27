import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  handleChat,
  handleGetModels,
  handleGetConversations,
  handleGetConversation,
  handleDeleteConversation,
  handleNewConversation,
} from "./routes/chat";
import {
  handleValidateLicense,
  handleGetUserProfile,
  handleLogout,
  requireAuth,
} from "./routes/auth";
import {
  handleSaveConversation,
  handleGetSavedConversations,
  handleDeleteSavedConversation,
  handleRestoreConversation,
} from "./routes/save-chat";
import {
  handleGetStats,
  handleCreateLicense,
  handleGetAllLicenses,
  handleUpdateLicense,
  handleDeleteLicense,
  handleGetAllUsers,
  handleBulkCreateLicenses,
  requireAdmin,
} from "./routes/admin";
import {
  handleCreateTestLicenses,
  handleCheckTestLicenses,
} from "./routes/test-setup";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  app.get("/api/test", (_req, res) => {
    res.json({
      success: true,
      timestamp: Date.now(),
      message: "API test endpoint working",
    });
  });

  app.get("/api/demo", handleDemo);

  // Chat API routes
  app.post("/api/chat", handleChat);
  app.get("/api/models", handleGetModels);
  app.get("/api/conversations", handleGetConversations);
  app.get("/api/conversations/:id", handleGetConversation);
  app.delete("/api/conversations/:id", handleDeleteConversation);
  app.post("/api/conversations/new", handleNewConversation);

  // Authentication routes
  app.post("/api/auth/validate-license", handleValidateLicense);
  app.get("/api/auth/profile/:userId", handleGetUserProfile);
  app.post("/api/auth/logout", handleLogout);

  // Save chat routes (with auth)
  app.post("/api/save/conversation", requireAuth, handleSaveConversation);
  app.get(
    "/api/save/conversations/:userId",
    requireAuth,
    handleGetSavedConversations,
  );
  app.delete(
    "/api/save/conversations/:conversationId/:userId",
    requireAuth,
    handleDeleteSavedConversation,
  );
  app.get(
    "/api/save/restore/:conversationId/:userId",
    requireAuth,
    handleRestoreConversation,
  );

  // Admin routes (with admin auth)
  app.get("/api/admin/stats", requireAdmin, handleGetStats);
  app.post("/api/admin/licenses", requireAdmin, handleCreateLicense);
  app.get("/api/admin/licenses", requireAdmin, handleGetAllLicenses);
  app.put("/api/admin/licenses/:licenseKey", requireAdmin, handleUpdateLicense);
  app.delete(
    "/api/admin/licenses/:licenseKey",
    requireAdmin,
    handleDeleteLicense,
  );
  app.get("/api/admin/users", requireAdmin, handleGetAllUsers);
  app.post("/api/admin/licenses/bulk", requireAdmin, handleBulkCreateLicenses);

  // Test setup routes (pour développement)
  app.post("/api/test/create-licenses", handleCreateTestLicenses);
  app.get("/api/test/check-licenses", handleCheckTestLicenses);

  // Créer automatiquement les licences de test au démarrage
  setTimeout(async () => {
    try {
      console.log("🔧 Création automatique des licences de test...");
      await handleCreateTestLicenses(
        {} as any,
        {
          json: (data: any) =>
            console.log("✅ Licences créées:", data.licenses?.length || 0),
        } as any,
      );
    } catch (error) {
      console.log("ℹ️  Licences probablement déjà créées");
    }
  }, 2000);

  return app;
}
