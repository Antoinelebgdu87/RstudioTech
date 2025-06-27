import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import LicenseGate from "./pages/LicenseGate";
import { ChatInterface } from "./components/ui/chat-interface";
import Admin from "./pages/Admin";
import DevInfo from "./pages/DevInfo";

const queryClient = new QueryClient();

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [licenseData, setLicenseData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<"chat" | "admin" | "dev">(
    "chat",
  );

  // Vérifier l'authentification au démarrage
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedLicenseKey = localStorage.getItem("license_key");
        const storedUser = localStorage.getItem("user_data");
        const storedLicense = localStorage.getItem("license_data");

        if (storedLicenseKey && storedUser && storedLicense) {
          // Revalider la licence
          const response = await fetch("/api/auth/validate-license", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ licenseKey: storedLicenseKey }),
          });

          const data = await response.json();

          if (data.success) {
            setLicenseData(data);
            setIsAuthenticated(true);
          } else {
            // Nettoyer les données invalides
            localStorage.removeItem("license_key");
            localStorage.removeItem("user_data");
            localStorage.removeItem("license_data");
          }
        }
      } catch (error) {
        console.error("Erreur vérification auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Raccourci clavier Ctrl+F1 pour admin
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "F1") {
        event.preventDefault();

        if (isAuthenticated) {
          setCurrentPage("admin");
          toast.success("🚀 Panel admin ouvert", {
            description: "Raccourci Ctrl+F1 activé",
          });
        } else {
          toast.info("🔐 Authentification requise", {
            description: "Connectez-vous d'abord",
          });
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isAuthenticated]);

  const handleLicenseValidated = (data: any) => {
    setLicenseData(data);
    setIsAuthenticated(true);
    toast.success("🎉 Bienvenue dans RStudio Tech IA !", {
      description: "Accès autorisé avec succès",
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("license_key");
    localStorage.removeItem("user_data");
    localStorage.removeItem("license_data");
    setIsAuthenticated(false);
    setLicenseData(null);
    setCurrentPage("chat");
    toast.info("👋 Déconnexion réussie", {
      description: "À bientôt !",
    });
  };

  // Écran de chargement
  if (isLoading) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-600">Initialisation...</p>
            </div>
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // Interface de licence
  if (!isAuthenticated) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <LicenseGate onLicenseValidated={handleLicenseValidated} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // Interface principale
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        {/* Navigation simple */}
        <div className="fixed top-4 right-4 z-50 flex gap-2">
          <button
            onClick={() => setCurrentPage("chat")}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              currentPage === "chat"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            💬 Chat IA
          </button>
          <button
            onClick={() => setCurrentPage("admin")}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              currentPage === "admin"
                ? "bg-purple-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            ⚙️ Admin
          </button>
          <button
            onClick={() => setCurrentPage("dev")}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              currentPage === "dev"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            🔧 Dev
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-1 rounded text-sm bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
          >
            🚪 Sortir
          </button>
        </div>

        {/* Contenu */}
        {currentPage === "chat" && <ChatInterface />}
        {currentPage === "admin" && <Admin />}
        {currentPage === "dev" && <DevInfo />}
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
