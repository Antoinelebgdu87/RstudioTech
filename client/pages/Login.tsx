import { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import { KeyIcon, LockIcon, CheckCircleIcon, ShieldIcon } from "lucide-react";

export default function Login() {
  const { isAuthenticated, login, isLoading } = useAuth();
  const location = useLocation();
  const [licenseKey, setLicenseKey] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Obtenir l'URL de redirection depuis les paramètres
  const searchParams = new URLSearchParams(location.search);
  const redirectTo = searchParams.get("redirect") || "/";

  // Rediriger si déjà connecté
  if (isAuthenticated && !isLoading) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!licenseKey.trim()) {
      setError("Veuillez saisir votre clé de licence");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const result = await login(licenseKey.trim());

      if (result.success) {
        // Redirection réussie se fera automatiquement via useEffect ci-dessus
        window.location.href = redirectTo;
      } else {
        setError(result.error || "Erreur de connexion");
      }
    } catch (error) {
      setError("Erreur de connexion au serveur");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-brand-accent flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-muted-foreground">
            Vérification de l'authentification...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-brand-accent flex items-center justify-center">
            <ShieldIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-brand-accent bg-clip-text text-transparent">
            RStudio Tech IA
          </h1>
          <p className="text-muted-foreground mt-2">
            Authentification requise pour accéder à l'IA
          </p>
        </div>

        {/* Formulaire de connexion */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyIcon className="w-5 h-5" />
              Activation de licence
            </CardTitle>
            <CardDescription>
              Saisissez votre clé de licence pour accéder aux fonctionnalités IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="licenseKey" className="text-sm font-medium">
                  Clé de licence
                </label>
                <div className="relative">
                  <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="licenseKey"
                    type="text"
                    placeholder="Saisissez votre clé de licence"
                    value={licenseKey}
                    onChange={(e) => setLicenseKey(e.target.value)}
                    className="pl-10"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || !licenseKey.trim()}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Vérification...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                    Activer la licence
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Informations sur les licences */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              Types de licences disponibles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-2 rounded border">
              <div>
                <div className="font-medium text-sm">Trial</div>
                <div className="text-xs text-muted-foreground">
                  100 messages
                </div>
              </div>
              <div className="w-2 h-2 rounded-full bg-orange-400"></div>
            </div>
            <div className="flex items-center justify-between p-2 rounded border">
              <div>
                <div className="font-medium text-sm">Basic</div>
                <div className="text-xs text-muted-foreground">
                  1000 messages
                </div>
              </div>
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
            </div>
            <div className="flex items-center justify-between p-2 rounded border">
              <div>
                <div className="font-medium text-sm">Premium</div>
                <div className="text-xs text-muted-foreground">
                  10000 messages
                </div>
              </div>
              <div className="w-2 h-2 rounded-full bg-purple-400"></div>
            </div>
            <div className="flex items-center justify-between p-2 rounded border">
              <div>
                <div className="font-medium text-sm">Unlimited</div>
                <div className="text-xs text-muted-foreground">Illimité</div>
              </div>
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
            </div>
          </CardContent>
        </Card>

        {/* Raccourci clavier */}
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center text-sm text-muted-foreground">
              <p className="mb-2">
                💡 <strong>Astuce :</strong> Utilisez le raccourci clavier
              </p>
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-muted rounded-md font-mono text-xs">
                <span>Ctrl</span>
                <span>+</span>
                <span>F1</span>
              </div>
              <p className="mt-2">pour accéder rapidement au panel admin</p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Besoin d'une licence ? Contactez votre administrateur</p>
          <p className="mt-2">
            <a href="/dev-info" className="text-primary hover:underline">
              🔧 Clés de test pour développeurs
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
