import { RequestHandler } from "express";
import { FirebaseService, db, COLLECTIONS } from "../firebase-config";
import { License } from "../../shared/types";
import { v4 as uuidv4 } from "uuid";

// Route temporaire pour créer des licences de test
export const handleCreateTestLicenses: RequestHandler = async (req, res) => {
  try {
    console.log("🚀 Création des licences de test...");

    const testLicenses = [
      {
        key: "test-trial-123",
        type: "trial" as const,
        maxUsage: 100,
      },
      {
        key: "test-basic-456",
        type: "basic" as const,
        maxUsage: 1000,
      },
      {
        key: "test-premium-789",
        type: "premium" as const,
        maxUsage: 10000,
      },
      {
        key: "test-unlimited-000",
        type: "unlimited" as const,
        maxUsage: 999999,
      },
    ];

    const createdLicenses: License[] = [];
    const now = Date.now();

    for (const licenseData of testLicenses) {
      const license: License = {
        id: licenseData.key,
        key: licenseData.key,
        isActive: true,
        usageCount: 0,
        maxUsage: licenseData.maxUsage,
        type: licenseData.type,
        createdAt: now,
        updatedAt: now,
      };

      try {
        await db
          .collection(COLLECTIONS.LICENSES)
          .doc(licenseData.key)
          .set(license);
        createdLicenses.push(license);
        console.log(`✅ Licence ${license.type} créée: ${license.key}`);
      } catch (error) {
        console.error(`❌ Erreur création licence ${license.type}:`, error);
      }
    }

    res.json({
      success: true,
      message: `${createdLicenses.length} licences de test créées`,
      licenses: createdLicenses,
    });
  } catch (error) {
    console.error("❌ Erreur création licences test:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la création des licences de test",
    });
  }
};

// Route pour vérifier les licences existantes
export const handleCheckTestLicenses: RequestHandler = async (req, res) => {
  try {
    const testKeys = [
      "test-trial-123",
      "test-basic-456",
      "test-premium-789",
      "test-unlimited-000",
    ];
    const licenses = [];

    for (const key of testKeys) {
      const doc = await db.collection(COLLECTIONS.LICENSES).doc(key).get();
      if (doc.exists) {
        licenses.push({ id: doc.id, ...doc.data() });
      }
    }

    res.json({
      success: true,
      licenses,
      count: licenses.length,
    });
  } catch (error) {
    console.error("❌ Erreur vérification licences:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la vérification",
    });
  }
};
