import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LicenseChecker } from "./components/ui/license-checker";
import { toast } from "sonner";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import DevInfo from "./pages/DevInfo";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Composant pour gérer les raccourcis clavier globaux
function GlobalKeyboardShortcuts() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+F1 pour accéder au panel admin
      if (event.ctrlKey && event.key === "F1") {
        event.preventDefault();

        if (isAuthenticated) {
          toast.success("🚀 Redirection vers le panel admin...", {
            description: "Raccourci Ctrl+F1 activé",
            duration: 2000,
          });
          setTimeout(() => {
            window.location.href = "/admin";
          }, 500);
        } else {
          toast.info("🔐 Authentification requise", {
            description: "Redirection vers la page de connexion",
            duration: 2000,
          });
          setTimeout(() => {
            window.location.href = "/login?redirect=/admin";
          }, 500);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isAuthenticated]);

  return null;
}

// Composant pour protéger les routes nécessitant une authentification
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-brand-accent flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-muted-foreground">Vérification de la licence...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirection automatique vers login avec l'URL de retour
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  return <LicenseChecker>{children}</LicenseChecker>;
}

// Composant pour rediriger les utilisateurs authentifiés loin de login
function LoginRoute() {
  return <Login />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginRoute />} />
      <Route path="/dev-info" element={<DevInfo />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Index />
          </ProtectedRoute>
        }
      />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <GlobalKeyboardShortcuts />
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
