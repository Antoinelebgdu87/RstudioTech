import { RequestHandler } from "express";
import { FirebaseService, db, COLLECTIONS } from "../firebase-config";
import {
  AuthResponse,
  ValidateLicenseRequest,
  User,
  License,
} from "../../shared/types";
import { v4 as uuidv4 } from "uuid";

export const handleValidateLicense: RequestHandler = async (req, res) => {
  try {
    const { licenseKey }: ValidateLicenseRequest = req.body;

    if (!licenseKey) {
      return res.status(400).json({
        success: false,
        error: "Clé de licence requise",
      } as AuthResponse);
    }

    // Valider la licence
    const validation = await FirebaseService.validateLicense(licenseKey);

    if (!validation.valid) {
      return res.status(401).json({
        success: false,
        error: validation.error,
      } as AuthResponse);
    }

    // Chercher ou créer l'utilisateur
    let user: User;
    const usersRef = db.collection(COLLECTIONS.USERS);
    const userQuery = await usersRef
      .where("licenseKey", "==", licenseKey)
      .get();

    if (userQuery.empty) {
      // Créer un nouvel utilisateur
      const userId = uuidv4();
      user = {
        id: userId,
        licenseKey,
        license: validation.license,
        createdAt: Date.now(),
        lastLogin: Date.now(),
        conversationIds: [],
      };

      await usersRef.doc(userId).set(user);
    } else {
      // Utilisateur existant
      const userDoc = userQuery.docs[0];
      user = { id: userDoc.id, ...userDoc.data() } as User;
      user.license = validation.license;
      user.lastLogin = Date.now();

      // Mettre à jour la dernière connexion
      await usersRef.doc(user.id).update({
        lastLogin: Date.now(),
        license: validation.license,
      });
    }

    const response: AuthResponse = {
      success: true,
      user,
      license: validation.license,
    };

    res.json(response);
  } catch (error) {
    console.error("Erreur validation licence:", error);
    res.status(500).json({
      success: false,
      error: "Erreur serveur lors de la validation",
    } as AuthResponse);
  }
};

export const handleGetUserProfile: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "ID utilisateur requis",
      });
    }

    const userDoc = await db.collection(COLLECTIONS.USERS).doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: "Utilisateur introuvable",
      });
    }

    const user = { id: userDoc.id, ...userDoc.data() } as User;

    // Revalider la licence
    if (user.licenseKey) {
      const validation = await FirebaseService.validateLicense(user.licenseKey);
      if (validation.valid) {
        user.license = validation.license;
      }
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Erreur récupération profil:", error);
    res.status(500).json({
      success: false,
      error: "Erreur serveur",
    });
  }
};

export const handleLogout: RequestHandler = async (req, res) => {
  try {
    // Pour l'instant, juste confirmer la déconnexion
    // Dans une vraie app, on pourrait invalider les tokens, etc.
    res.json({
      success: true,
      message: "Déconnexion réussie",
    });
  } catch (error) {
    console.error("Erreur déconnexion:", error);
    res.status(500).json({
      success: false,
      error: "Erreur serveur",
    });
  }
};

// Middleware pour vérifier l'authentification
export const requireAuth: RequestHandler = async (req, res, next) => {
  try {
    const licenseKey = req.headers["x-license-key"] as string;

    if (!licenseKey) {
      return res.status(401).json({
        success: false,
        error: "Authentification requise",
      });
    }

    const validation = await FirebaseService.validateLicense(licenseKey);

    if (!validation.valid) {
      return res.status(401).json({
        success: false,
        error: validation.error,
      });
    }

    // Ajouter les infos d'auth à la requête
    (req as any).auth = {
      licenseKey,
      license: validation.license,
    };

    next();
  } catch (error) {
    console.error("Erreur middleware auth:", error);
    res.status(500).json({
      success: false,
      error: "Erreur serveur",
    });
  }
};
