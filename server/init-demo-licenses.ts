import { FirebaseService, db, COLLECTIONS } from "./firebase-config";
import { License } from "../shared/types";
import { v4 as uuidv4 } from "uuid";

// Script pour créer des licences de démonstration
async function createDemoLicenses() {
  console.log("🚀 Création des licences de démonstration...");

  const demoLicenses: Partial<License>[] = [
    {
      type: "trial",
      maxUsage: 100,
      expiresIn: 7 * 24 * 60 * 60 * 1000, // 7 jours
    },
    {
      type: "basic",
      maxUsage: 1000,
      expiresIn: 30 * 24 * 60 * 60 * 1000, // 30 jours
    },
    {
      type: "premium",
      maxUsage: 10000,
      expiresIn: 90 * 24 * 60 * 60 * 1000, // 90 jours
    },
    {
      type: "unlimited",
      maxUsage: 999999,
      // Pas d'expiration
    },
  ];

  const createdLicenses: License[] = [];

  for (const licenseData of demoLicenses) {
    const licenseKey = uuidv4();
    const now = Date.now();

    const license: License = {
      id: licenseKey,
      key: licenseKey,
      isActive: true,
      usageCount: 0,
      maxUsage: licenseData.maxUsage!,
      type: licenseData.type!,
      createdAt: now,
      updatedAt: now,
      ...(licenseData.expiresIn && { expiresAt: now + licenseData.expiresIn }),
    };

    try {
      await db.collection(COLLECTIONS.LICENSES).doc(licenseKey).set(license);
      createdLicenses.push(license);
      console.log(`✅ Licence ${license.type} créée: ${license.key}`);
    } catch (error) {
      console.error(`❌ Erreur création licence ${license.type}:`, error);
    }
  }

  console.log("\n📋 Résumé des licences créées:");
  console.log("=====================================");
  createdLicenses.forEach((license) => {
    console.log(`🔑 ${license.type.toUpperCase()}: ${license.key}`);
    console.log(`   Usage: 0/${license.maxUsage}`);
    if (license.expiresAt) {
      const expiryDate = new Date(license.expiresAt).toLocaleDateString(
        "fr-FR",
      );
      console.log(`   Expire le: ${expiryDate}`);
    } else {
      console.log(`   Expire le: Jamais`);
    }
    console.log("");
  });

  console.log("🎉 Licences de démonstration créées avec succès !");
  return createdLicenses;
}

// Fonction pour créer des licences en lot
export async function createBulkDemoLicenses(
  count: number = 10,
  type: "trial" | "basic" | "premium" | "unlimited" = "trial",
) {
  console.log(`🚀 Création de ${count} licences ${type}...`);

  const licenses: License[] = [];
  const now = Date.now();

  const config = {
    trial: { maxUsage: 100, expiresIn: 7 * 24 * 60 * 60 * 1000 },
    basic: { maxUsage: 1000, expiresIn: 30 * 24 * 60 * 60 * 1000 },
    premium: { maxUsage: 10000, expiresIn: 90 * 24 * 60 * 60 * 1000 },
    unlimited: { maxUsage: 999999 },
  };

  for (let i = 0; i < count; i++) {
    const licenseKey = uuidv4();
    const licenseConfig = config[type];

    const license: License = {
      id: licenseKey,
      key: licenseKey,
      isActive: true,
      usageCount: 0,
      maxUsage: licenseConfig.maxUsage,
      type,
      createdAt: now,
      updatedAt: now,
      ...(licenseConfig.expiresIn && {
        expiresAt: now + licenseConfig.expiresIn,
      }),
    };

    try {
      await db.collection(COLLECTIONS.LICENSES).doc(licenseKey).set(license);
      licenses.push(license);
    } catch (error) {
      console.error(`❌ Erreur création licence ${i + 1}:`, error);
    }
  }

  console.log(`✅ ${licenses.length}/${count} licences créées avec succès`);
  return licenses;
}

// Exécuter si appelé directement
if (require.main === module) {
  createDemoLicenses()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Erreur:", error);
      process.exit(1);
    });
}

export { createDemoLicenses };
