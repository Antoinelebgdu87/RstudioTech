import { RequestHandler } from "express";
import { FirebaseService, db, COLLECTIONS } from "../firebase-config";
import { UsageStats, License } from "../../shared/types";
import { v4 as uuidv4 } from "uuid";

// Clé admin temporaire (en production, utiliser un système plus sécurisé)
const ADMIN_KEY = "admin_rstudio_tech_2024";

// Middleware pour vérifier les droits admin
export const requireAdmin: RequestHandler = (req, res, next) => {
  const adminKey = req.headers["x-admin-key"] as string;

  if (adminKey !== ADMIN_KEY) {
    return res.status(403).json({
      success: false,
      error: "Accès admin requis",
    });
  }

  next();
};

export const handleGetStats: RequestHandler = async (req, res) => {
  try {
    const stats = await FirebaseService.getUsageStats();

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Erreur récupération stats:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des statistiques",
    });
  }
};

export const handleCreateLicense: RequestHandler = async (req, res) => {
  try {
    const { type = "trial", maxUsage = 100, expiresIn } = req.body;

    const licenseKey = uuidv4();
    const now = Date.now();

    const license: License = {
      id: licenseKey,
      key: licenseKey,
      isActive: true,
      usageCount: 0,
      maxUsage,
      type,
      createdAt: now,
      updatedAt: now,
      ...(expiresIn && { expiresAt: now + expiresIn }),
    };

    await db.collection(COLLECTIONS.LICENSES).doc(licenseKey).set(license);

    res.json({
      success: true,
      license,
    });
  } catch (error) {
    console.error("Erreur création licence:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la création de la licence",
    });
  }
};

export const handleGetAllLicenses: RequestHandler = async (req, res) => {
  try {
    const licensesSnapshot = await db
      .collection(COLLECTIONS.LICENSES)
      .orderBy("createdAt", "desc")
      .get();

    const licenses = licensesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      success: true,
      licenses,
    });
  } catch (error) {
    console.error("Erreur récupération licences:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des licences",
    });
  }
};

export const handleUpdateLicense: RequestHandler = async (req, res) => {
  try {
    const { licenseKey } = req.params;
    const updates = req.body;

    if (!licenseKey) {
      return res.status(400).json({
        success: false,
        error: "Clé de licence requise",
      });
    }

    const licenseRef = db.collection(COLLECTIONS.LICENSES).doc(licenseKey);
    const licenseDoc = await licenseRef.get();

    if (!licenseDoc.exists) {
      return res.status(404).json({
        success: false,
        error: "Licence introuvable",
      });
    }

    await licenseRef.update({
      ...updates,
      updatedAt: Date.now(),
    });

    const updatedDoc = await licenseRef.get();
    const updatedLicense = { id: updatedDoc.id, ...updatedDoc.data() };

    res.json({
      success: true,
      license: updatedLicense,
    });
  } catch (error) {
    console.error("Erreur mise à jour licence:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la mise à jour",
    });
  }
};

export const handleDeleteLicense: RequestHandler = async (req, res) => {
  try {
    const { licenseKey } = req.params;

    if (!licenseKey) {
      return res.status(400).json({
        success: false,
        error: "Clé de licence requise",
      });
    }

    const licenseRef = db.collection(COLLECTIONS.LICENSES).doc(licenseKey);
    const licenseDoc = await licenseRef.get();

    if (!licenseDoc.exists) {
      return res.status(404).json({
        success: false,
        error: "Licence introuvable",
      });
    }

    await licenseRef.delete();

    res.json({
      success: true,
      message: "Licence supprimée",
    });
  } catch (error) {
    console.error("Erreur suppression licence:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la suppression",
    });
  }
};

export const handleGetAllUsers: RequestHandler = async (req, res) => {
  try {
    const usersSnapshot = await db
      .collection(COLLECTIONS.USERS)
      .orderBy("createdAt", "desc")
      .get();

    const users = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Erreur récupération utilisateurs:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des utilisateurs",
    });
  }
};

export const handleBulkCreateLicenses: RequestHandler = async (req, res) => {
  try {
    const { count = 10, type = "trial", maxUsage = 100, expiresIn } = req.body;

    if (count > 100) {
      return res.status(400).json({
        success: false,
        error: "Maximum 100 licences à la fois",
      });
    }

    const licenses: License[] = [];
    const batch = db.batch();
    const now = Date.now();

    for (let i = 0; i < count; i++) {
      const licenseKey = uuidv4();
      const license: License = {
        id: licenseKey,
        key: licenseKey,
        isActive: true,
        usageCount: 0,
        maxUsage,
        type,
        createdAt: now,
        updatedAt: now,
        ...(expiresIn && { expiresAt: now + expiresIn }),
      };

      licenses.push(license);
      const docRef = db.collection(COLLECTIONS.LICENSES).doc(licenseKey);
      batch.set(docRef, license);
    }

    await batch.commit();

    res.json({
      success: true,
      licenses,
      count: licenses.length,
    });
  } catch (error) {
    console.error("Erreur création en lot:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la création en lot",
    });
  }
};
