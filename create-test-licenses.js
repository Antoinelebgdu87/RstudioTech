const { v4: uuidv4 } = require("uuid");

// Générer quelques clés de licence pour les tests
const testLicenses = [
  {
    key: uuidv4(),
    type: "trial",
    maxUsage: 100,
    description: "Licence d'essai - 100 messages",
  },
  {
    key: uuidv4(),
    type: "basic",
    maxUsage: 1000,
    description: "Licence basique - 1000 messages",
  },
  {
    key: uuidv4(),
    type: "premium",
    maxUsage: 10000,
    description: "Licence premium - 10000 messages",
  },
  {
    key: uuidv4(),
    type: "unlimited",
    maxUsage: 999999,
    description: "Licence illimitée",
  },
];

console.log("🔑 Clés de licence de test générées:");
console.log("=====================================");
testLicenses.forEach((license) => {
  console.log(`${license.type.toUpperCase()}: ${license.key}`);
  console.log(`Description: ${license.description}`);
  console.log("---");
});

console.log("\n📝 Instructions:");
console.log("1. Copiez une de ces clés");
console.log("2. Allez sur la page de connexion (/login)");
console.log("3. Entrez la clé pour vous authentifier");
console.log(
  "4. Accédez au dashboard admin avec la clé: admin_rstudio_tech_2024",
);
