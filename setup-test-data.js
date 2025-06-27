// Script pour créer des données de test via l'API admin
async function createTestLicenses() {
  const adminKey = "admin_rstudio_tech_2024";
  const baseUrl = "http://localhost:3000";

  const testLicenses = [
    {
      key: "trial-demo-key-123456789",
      type: "trial",
      maxUsage: 100,
    },
    {
      key: "basic-demo-key-987654321",
      type: "basic",
      maxUsage: 1000,
    },
    {
      key: "premium-demo-key-456789123",
      type: "premium",
      maxUsage: 10000,
    },
    {
      key: "unlimited-demo-key-321654987",
      type: "unlimited",
      maxUsage: 999999,
    },
  ];

  console.log("🚀 Création des licences de test...");

  for (const license of testLicenses) {
    try {
      const response = await fetch(`${baseUrl}/api/admin/licenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify(license),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Licence ${license.type} créée: ${result.license.key}`);
      } else {
        console.error(`❌ Erreur création ${license.type}:`, response.status);
      }
    } catch (error) {
      console.error(`❌ Erreur réseau ${license.type}:`, error.message);
    }
  }

  console.log("✅ Configuration terminée !");
}

// Informations pour l'utilisateur
console.log("🔧 Configuration du système de licences RStudio Tech IA");
console.log("=====================================================");
console.log("");
console.log("📋 Clés de licence de test disponibles:");
console.log("- trial-demo-key-123456789 (Trial - 100 messages)");
console.log("- basic-demo-key-987654321 (Basic - 1000 messages)");
console.log("- premium-demo-key-456789123 (Premium - 10000 messages)");
console.log("- unlimited-demo-key-321654987 (Unlimited)");
console.log("");
console.log("🔑 Clé admin: admin_rstudio_tech_2024");
console.log("");
console.log("🌐 Pages disponibles:");
console.log("- / : Chat principal (nécessite une licence)");
console.log("- /login : Connexion avec licence");
console.log("- /admin : Dashboard administrateur");
console.log("- /dev-info : Informations de développement");
console.log("");
console.log("🚀 Le système est prêt à être testé !");
