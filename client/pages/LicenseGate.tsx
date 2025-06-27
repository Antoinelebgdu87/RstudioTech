import { useState } from "react";
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
import { Badge } from "../components/ui/badge";
import {
  KeyIcon,
  ShieldIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  SparklesIcon,
} from "lucide-react";

interface LicenseGateProps {
  onLicenseValidated: (licenseData: any) => void;
}

export default function LicenseGate({ onLicenseValidated }: LicenseGateProps) {
  const [licenseKey, setLicenseKey] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const validateLicense = async () => {
    if (!licenseKey.trim()) {
      setError("Veuillez saisir votre clé de licence");
      return;
    }

    setIsValidating(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/validate-license", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ licenseKey: licenseKey.trim() }),
      });

      const data = await response.json();

      if (data.success && data.user && data.license) {
        setSuccess("✅ Licence validée avec succès !");

        // Stocker les données d'authentification
        localStorage.setItem("license_key", licenseKey.trim());
        localStorage.setItem("user_data", JSON.stringify(data.user));
        localStorage.setItem("license_data", JSON.stringify(data.license));

        // Petite pause pour montrer le succès puis rediriger
        setTimeout(() => {
          onLicenseValidated(data);
        }, 1500);
      } else {
        setError(data.error || "Licence invalide");
      }
    } catch (error) {
      console.error("Erreur validation:", error);
      setError("Erreur de connexion au serveur");
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validateLicense();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      validateLicense();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-xl">
            <ShieldIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            RStudio Tech IA
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            Accès sécurisé par licence
          </p>
        </div>

        {/* Formulaire de licence */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center gap-2 text-xl">
              <KeyIcon className="w-5 h-5 text-blue-600" />
              Validation de licence
            </CardTitle>
            <CardDescription className="text-base">
              Entrez votre clé de licence pour accéder à l'IA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="license"
                  className="text-sm font-medium text-gray-700"
                >
                  Clé de licence
                </label>
                <div className="relative">
                  <Input
                    id="license"
                    type="text"
                    placeholder="Saisissez votre clé de licence..."
                    value={licenseKey}
                    onChange={(e) => setLicenseKey(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isValidating}
                    className="pl-4 py-3 text-center font-mono text-sm bg-gray-50 border-2 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* Messages */}
              {error && (
                <Alert
                  variant="destructive"
                  className="border-red-200 bg-red-50"
                >
                  <AlertCircleIcon className="h-4 w-4" />
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircleIcon className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full py-3 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                disabled={isValidating || !licenseKey.trim()}
              >
                {isValidating ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Validation en cours...
                  </>
                ) : success ? (
                  <>
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                    Accès autorisé !
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-4 h-4 mr-2" />
                    Accéder à l'IA
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Clés de test */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-blue-800">
              Clés de test disponibles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { key: "test-trial-123", type: "Trial", desc: "100 messages" },
              { key: "test-basic-456", type: "Basic", desc: "1000 messages" },
              {
                key: "test-premium-789",
                type: "Premium",
                desc: "10000 messages",
              },
              {
                key: "test-unlimited-000",
                type: "Unlimited",
                desc: "Illimité",
              },
            ].map((license) => (
              <div
                key={license.key}
                onClick={() => setLicenseKey(license.key)}
                className="flex items-center justify-between p-2 rounded cursor-pointer hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {license.type}
                  </Badge>
                  <span className="font-mono text-xs text-blue-700">
                    {license.key}
                  </span>
                </div>
                <span className="text-xs text-blue-600">{license.desc}</span>
              </div>
            ))}
            <p className="text-xs text-blue-600 text-center mt-2">
              💡 Cliquez sur une clé pour la sélectionner
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Système d'accès sécurisé • RStudio Tech</p>
        </div>
      </div>
    </div>
  );
}
