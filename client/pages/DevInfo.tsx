import { useState } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  CodeIcon,
  CopyIcon,
  KeyIcon,
  UserIcon,
  ShieldIcon,
  InfoIcon,
  KeyboardIcon,
} from "lucide-react";

export default function DevInfo() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isCreatingLicenses, setIsCreatingLicenses] = useState(false);
  const [licenseStatus, setLicenseStatus] = useState<string>("");

  // Clés de licence de test simples et faciles à retenir
  const testLicenses = [
    {
      key: "test-trial-123",
      type: "trial",
      maxUsage: 100,
      description: "Licence d'essai - 100 messages",
      color: "bg-orange-100 text-orange-800",
    },
    {
      key: "test-basic-456",
      type: "basic",
      maxUsage: 1000,
      description: "Licence basique - 1000 messages",
      color: "bg-blue-100 text-blue-800",
    },
    {
      key: "test-premium-789",
      type: "premium",
      maxUsage: 10000,
      description: "Licence premium - 10000 messages",
      color: "bg-purple-100 text-purple-800",
    },
    {
      key: "test-unlimited-000",
      type: "unlimited",
      maxUsage: 999999,
      description: "Licence illimitée",
      color: "bg-green-100 text-green-800",
    },
  ];

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(text);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (error) {
      console.error("Erreur copie:", error);
    }
  };

  const createTestLicenses = async () => {
    setIsCreatingLicenses(true);
    setLicenseStatus("Création des licences de test...");

    try {
      const response = await fetch("/api/test/create-licenses", {
        method: "POST",
      });

      if (response.ok) {
        const result = await response.json();
        setLicenseStatus(
          `✅ ${result.licenses.length} licences créées avec succès !`,
        );
      } else {
        setLicenseStatus("❌ Erreur lors de la création des licences");
      }
    } catch (error) {
      setLicenseStatus("❌ Erreur de connexion au serveur");
    } finally {
      setIsCreatingLicenses(false);
      setTimeout(() => setLicenseStatus(""), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-brand-accent flex items-center justify-center">
            <CodeIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-brand-accent bg-clip-text text-transparent">
            Informations de Développement
          </h1>
          <p className="text-muted-foreground mt-2">
            RStudio Tech IA - Système de licences et sauvegarde Firebase
          </p>
        </div>

        {/* Système de licences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyIcon className="w-5 h-5" />
              Clés de licence de test
            </CardTitle>
            <CardDescription>
              Utilisez ces clés pour tester le système d'authentification
            </CardDescription>
            <div className="flex items-center gap-4 mt-4">
              <Button
                onClick={createTestLicenses}
                disabled={isCreatingLicenses}
                size="sm"
              >
                {isCreatingLicenses ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Création...
                  </>
                ) : (
                  "🔧 Créer les licences de test"
                )}
              </Button>
              {licenseStatus && (
                <span className="text-sm text-muted-foreground">
                  {licenseStatus}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {testLicenses.map((license) => (
              <div
                key={license.key}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className={license.color}>
                      {license.type.toUpperCase()}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {license.description}
                    </span>
                  </div>
                  <div className="font-mono text-sm bg-muted px-3 py-2 rounded truncate">
                    {license.key}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(license.key)}
                  className="ml-4"
                >
                  {copiedKey === license.key ? (
                    <>
                      <CheckIcon className="w-4 h-4 mr-2" />
                      Copié !
                    </>
                  ) : (
                    <>
                      <CopyIcon className="w-4 h-4 mr-2" />
                      Copier
                    </>
                  )}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Admin */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldIcon className="w-5 h-5" />
              Accès Admin
            </CardTitle>
            <CardDescription>
              Clé pour accéder au dashboard administrateur
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg bg-red-50 border-red-200">
              <div className="flex-1">
                <div className="font-semibold text-red-800 mb-1">Clé Admin</div>
                <div className="font-mono text-sm bg-red-100 px-3 py-2 rounded text-red-700">
                  admin_rstudio_tech_2024
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard("admin_rstudio_tech_2024")}
              >
                {copiedKey === "admin_rstudio_tech_2024" ? (
                  <>
                    <CheckIcon className="w-4 h-4 mr-2" />
                    Copié !
                  </>
                ) : (
                  <>
                    <CopyIcon className="w-4 h-4 mr-2" />
                    Copier
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Raccourcis clavier */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyboardIcon className="w-5 h-5" />
              Raccourcis clavier
            </CardTitle>
            <CardDescription>
              Nouveauté : Navigation rapide par raccourcis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50 border-blue-200">
                <div className="flex items-center gap-3">
                  <ShieldIcon className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    Accéder au panel admin
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="font-mono">
                    Ctrl
                  </Badge>
                  <span className="text-muted-foreground">+</span>
                  <Badge variant="outline" className="font-mono">
                    F1
                  </Badge>
                </div>
              </div>
              <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                💡 <strong>Astuce :</strong> Les raccourcis fonctionnent sur
                toutes les pages. Si vous n'êtes pas authentifié, vous serez
                d'abord redirigé vers la page de connexion.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <InfoIcon className="w-5 h-5" />
              Instructions d'utilisation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold">1. Test du système de licences</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">
                <li>
                  <strong>Cliquez sur "Créer les licences de test"</strong>{" "}
                  ci-dessus
                </li>
                <li>
                  Copiez une clé de licence (ex: <code>test-trial-123</code>)
                </li>
                <li>
                  Allez sur <code>/</code> → redirection automatique vers{" "}
                  <code>/login</code>
                </li>
                <li>Entrez votre clé de licence → accès à l'IA</li>
                <li>Testez l'IA et observez le décompte d'usage</li>
                <li>
                  Utilisez <code>Ctrl+F1</code> pour l'admin panel
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">2. Dashboard Admin</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">
                <li>
                  Allez sur <code>/admin</code>
                </li>
                <li>Utilisez la clé admin pour vous connecter</li>
                <li>Consultez les statistiques d'usage</li>
                <li>Gérez les licences et utilisateurs</li>
                <li>Créez de nouvelles licences</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">3. Fonctionnalités testées</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">
                <li>✅ Authentification par licence</li>
                <li>✅ Redirection automatique vers /login</li>
                <li>✅ Vérification des limites d'usage</li>
                <li>✅ Sauvegarde des conversations sur Firebase</li>
                <li>✅ Restauration des conversations</li>
                <li>✅ Dashboard admin complet</li>
                <li>✅ Statistiques d'utilisation</li>
                <li>✅ Gestion des licences</li>
                <li>🆕 Raccourci clavier Ctrl+F1 pour admin</li>
                <li>🆕 Notifications toast pour les actions</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">4. Raccourcis clavier</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">
                <li>
                  <code>Ctrl + F1</code> : Accéder au panel admin
                </li>
                <li>Fonctionne sur toutes les pages</li>
                <li>Redirection automatique vers login si non authentifié</li>
                <li>Notification toast avec retour visuel</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4">
          <Button onClick={() => (window.location.href = "/login")}>
            <UserIcon className="w-4 h-4 mr-2" />
            Connexion
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/admin")}
          >
            <ShieldIcon className="w-4 h-4 mr-2" />
            Admin
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/")}
          >
            Retour au Chat
          </Button>
        </div>
      </div>
    </div>
  );
}

// Icône CheckIcon manquante
function CheckIcon({ className }: { className: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}
