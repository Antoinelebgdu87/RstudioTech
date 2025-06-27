import { useEffect, useState } from "react";
import { useAuth, useAuthenticatedFetch } from "../../hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Alert, AlertDescription } from "./alert";
import { Badge } from "./badge";
import { Button } from "./button";
import { Progress } from "./progress";
import { KeyboardShortcutsHelp } from "./keyboard-shortcuts-help";
import {
  AlertTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  KeyIcon,
  TrendingUpIcon,
  ClockIcon,
} from "lucide-react";

interface LicenseCheckerProps {
  children: React.ReactNode;
  onUsageIncrement?: () => void;
}

export function LicenseChecker({
  children,
  onUsageIncrement,
}: LicenseCheckerProps) {
  const { user, license, isAuthenticated, checkLicense, logout } = useAuth();
  const [usageWarning, setUsageWarning] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Vérifier la licence périodiquement
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(
      async () => {
        const isValid = await checkLicense();
        if (!isValid) {
          logout();
        }
      },
      5 * 60 * 1000,
    ); // Vérifier toutes les 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated, checkLicense, logout]);

  // Surveiller l'usage et afficher des avertissements
  useEffect(() => {
    if (!license) return;

    const usagePercent = (license.usageCount / license.maxUsage) * 100;

    if (usagePercent >= 95) {
      setUsageWarning("Attention : Limite d'usage presque atteinte !");
    } else if (usagePercent >= 80) {
      setUsageWarning("Avertissement : 80% de votre limite d'usage atteinte");
    } else if (usagePercent >= 50) {
      setUsageWarning("Info : 50% de votre limite d'usage utilisée");
    } else {
      setUsageWarning(null);
    }
  }, [license]);

  const handleRevalidate = async () => {
    setIsValidating(true);
    const isValid = await checkLicense();
    if (!isValid) {
      logout();
    }
    setIsValidating(false);
  };

  const getLicenseStatusColor = () => {
    if (!license) return "text-gray-500";

    const usagePercent = (license.usageCount / license.maxUsage) * 100;
    if (usagePercent >= 95) return "text-red-500";
    if (usagePercent >= 80) return "text-orange-500";
    if (usagePercent >= 50) return "text-yellow-500";
    return "text-green-500";
  };

  const getLicenseTypeColor = (type: string) => {
    switch (type) {
      case "trial":
        return "bg-orange-100 text-orange-800";
      case "basic":
        return "bg-blue-100 text-blue-800";
      case "premium":
        return "bg-purple-100 text-purple-800";
      case "unlimited":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isExpired = () => {
    if (!license?.expiresAt) return false;
    return license.expiresAt < Date.now();
  };

  const daysUntilExpiry = () => {
    if (!license?.expiresAt) return null;
    const days = Math.ceil((license.expiresAt - Date.now()) / 86400000);
    return days > 0 ? days : 0;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircleIcon className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <CardTitle>Accès non autorisé</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Une licence valide est requise pour utiliser cette application.
            </p>
            <Button onClick={() => (window.location.href = "/login")}>
              <KeyIcon className="w-4 h-4 mr-2" />
              Activer une licence
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!license || isExpired()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangleIcon className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <CardTitle>Licence expirée</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Votre licence a expiré. Veuillez contacter votre administrateur
              pour renouveler votre accès.
            </p>
            <div className="space-y-2">
              <Button onClick={handleRevalidate} disabled={isValidating}>
                {isValidating ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Vérification...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                    Revérifier
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={logout}>
                Changer de licence
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (license.usageCount >= license.maxUsage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <TrendingUpIcon className="w-16 h-16 mx-auto mb-4 text-orange-500" />
            <CardTitle>Limite d'usage atteinte</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Vous avez atteint la limite de {license.maxUsage} messages pour
              votre licence {license.type}.
            </p>
            <div className="space-y-2">
              <Button onClick={handleRevalidate} disabled={isValidating}>
                {isValidating ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Vérification...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                    Revérifier
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={logout}>
                Changer de licence
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col relative">
      {/* Barre d'état de la licence */}
      <div className="border-b bg-background/95 backdrop-blur p-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CheckCircleIcon
                className={`w-4 h-4 ${getLicenseStatusColor()}`}
              />
              <Badge className={getLicenseTypeColor(license.type)}>
                {license.type.toUpperCase()}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Usage:</span>
              <span className={getLicenseStatusColor()}>
                {license.usageCount} / {license.maxUsage}
              </span>
              <div className="w-20">
                <Progress
                  value={(license.usageCount / license.maxUsage) * 100}
                  className="h-1"
                />
              </div>
            </div>

            {license.expiresAt && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <ClockIcon className="w-3 h-3" />
                <span className="text-xs">
                  Expire dans {daysUntilExpiry()} jours
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              ID: {user?.id.slice(0, 8)}...
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-xs"
            >
              Déconnexion
            </Button>
          </div>
        </div>

        {usageWarning && (
          <Alert className="mt-2">
            <AlertTriangleIcon className="h-4 w-4" />
            <AlertDescription>{usageWarning}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Contenu principal */}
      <div className="flex-1 min-h-0">{children}</div>

      {/* Aide pour les raccourcis clavier */}
      <KeyboardShortcutsHelp />
    </div>
  );
}

// Hook pour incrémenter l'usage automatiquement
export const useLicenseUsage = () => {
  const { license } = useAuth();
  const { makeAuthenticatedRequest } = useAuthenticatedFetch();

  const incrementUsage = async () => {
    if (!license) return;

    try {
      // L'incrémentation se fait côté serveur lors de l'envoi de messages
      // Ce hook est principalement informatif
    } catch (error) {
      console.error("Erreur incrémentation usage:", error);
    }
  };

  return { incrementUsage };
};
