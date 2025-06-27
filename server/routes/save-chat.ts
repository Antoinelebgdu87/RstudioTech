import { RequestHandler } from "express";
import { FirebaseService, db, COLLECTIONS } from "../firebase-config";
import { SavedConversation, Conversation } from "../../shared/types";

export const handleSaveConversation: RequestHandler = async (req, res) => {
  try {
    const { conversation, userId } = req.body;

    if (!conversation || !userId) {
      return res.status(400).json({
        success: false,
        error: "Conversation et ID utilisateur requis",
      });
    }

    // Sauvegarder avec Firebase
    await FirebaseService.saveConversation(userId, conversation);

    // Mettre à jour la liste des conversations de l'utilisateur
    const userRef = db.collection(COLLECTIONS.USERS).doc(userId);
    await userRef.update({
      conversationIds: db.firestore().FieldValue.arrayUnion(conversation.id),
    });

    res.json({
      success: true,
      message: "Conversation sauvegardée",
    });
  } catch (error) {
    console.error("Erreur sauvegarde conversation:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la sauvegarde",
    });
  }
};

export const handleGetSavedConversations: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "ID utilisateur requis",
      });
    }

    const conversations = await FirebaseService.getUserConversations(userId);

    res.json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error("Erreur récupération conversations:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération",
    });
  }
};

export const handleDeleteSavedConversation: RequestHandler = async (
  req,
  res,
) => {
  try {
    const { conversationId, userId } = req.params;

    if (!conversationId || !userId) {
      return res.status(400).json({
        success: false,
        error: "ID conversation et utilisateur requis",
      });
    }

    // Vérifier que la conversation appartient à l'utilisateur
    const conversationRef = db
      .collection(COLLECTIONS.CONVERSATIONS)
      .doc(conversationId);
    const conversationDoc = await conversationRef.get();

    if (!conversationDoc.exists) {
      return res.status(404).json({
        success: false,
        error: "Conversation introuvable",
      });
    }

    const conversation = conversationDoc.data();
    if (conversation?.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: "Non autorisé",
      });
    }

    // Supprimer la conversation
    await conversationRef.delete();

    // Retirer de la liste de l'utilisateur
    const userRef = db.collection(COLLECTIONS.USERS).doc(userId);
    await userRef.update({
      conversationIds: db.firestore().FieldValue.arrayRemove(conversationId),
    });

    res.json({
      success: true,
      message: "Conversation supprimée",
    });
  } catch (error) {
    console.error("Erreur suppression conversation:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la suppression",
    });
  }
};

export const handleRestoreConversation: RequestHandler = async (req, res) => {
  try {
    const { conversationId, userId } = req.params;

    if (!conversationId || !userId) {
      return res.status(400).json({
        success: false,
        error: "ID conversation et utilisateur requis",
      });
    }

    // Récupérer la conversation sauvegardée
    const conversationRef = db
      .collection(COLLECTIONS.CONVERSATIONS)
      .doc(conversationId);
    const conversationDoc = await conversationRef.get();

    if (!conversationDoc.exists) {
      return res.status(404).json({
        success: false,
        error: "Conversation introuvable",
      });
    }

    const savedConversation = conversationDoc.data() as SavedConversation;

    if (savedConversation.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: "Non autorisé",
      });
    }

    // Retourner la conversation pour restauration côté client
    const conversation: Conversation = {
      id: savedConversation.id,
      title: savedConversation.title,
      messages: savedConversation.messages,
      createdAt: savedConversation.createdAt,
      updatedAt: savedConversation.updatedAt,
    };

    res.json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error("Erreur restauration conversation:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la restauration",
    });
  }
};
