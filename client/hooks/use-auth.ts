import { useState, useEffect, createContext, useContext } from "react";
import { User, License, AuthResponse } from "../../shared/types";

interface AuthContextType {
  user: User | null;
  license: License | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (licenseKey: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  checkLicense: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const useAuthLogic = () => {
  const [user, setUser] = useState<User | null>(null);
  const [license, setLicense] = useState<License | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier l'authentification au démarrage
  useEffect(() => {
    checkStoredAuth();
  }, []);

  const checkStoredAuth = async () => {
    try {
      const storedLicenseKey = localStorage.getItem("license_key");
      const storedUser = localStorage.getItem("user_data");

      if (storedLicenseKey && storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);

        // Revalider la licence
        const isValid = await validateStoredLicense(storedLicenseKey);
        if (!isValid) {
          // Licence invalide, déconnecter
          logout();
        }
      }
    } catch (error) {
      console.error("Erreur vérification auth stockée:", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const validateStoredLicense = async (
    licenseKey: string,
  ): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/validate-license", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ licenseKey }),
      });

      const data: AuthResponse = await response.json();

      if (data.success && data.user && data.license) {
        setUser(data.user);
        setLicense(data.license);
        localStorage.setItem("user_data", JSON.stringify(data.user));
        localStorage.setItem("license_data", JSON.stringify(data.license));
        return true;
      }

      return false;
    } catch (error) {
      console.error("Erreur validation licence stockée:", error);
      return false;
    }
  };

  const login = async (
    licenseKey: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/auth/validate-license", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ licenseKey }),
      });

      const data: AuthResponse = await response.json();

      if (data.success && data.user && data.license) {
        setUser(data.user);
        setLicense(data.license);

        // Stocker localement
        localStorage.setItem("license_key", licenseKey);
        localStorage.setItem("user_data", JSON.stringify(data.user));
        localStorage.setItem("license_data", JSON.stringify(data.license));

        return { success: true };
      } else {
        return { success: false, error: data.error || "Erreur de connexion" };
      }
    } catch (error) {
      console.error("Erreur login:", error);
      return {
        success: false,
        error: "Erreur de connexion au serveur",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setLicense(null);
    localStorage.removeItem("license_key");
    localStorage.removeItem("user_data");
    localStorage.removeItem("license_data");
  };

  const checkLicense = async (): Promise<boolean> => {
    const licenseKey = localStorage.getItem("license_key");
    if (!licenseKey) return false;

    return await validateStoredLicense(licenseKey);
  };

  return {
    user,
    license,
    isAuthenticated: !!user && !!license,
    isLoading,
    login,
    logout,
    checkLicense,
  };
};

// Helper pour les appels API authentifiés
export const useAuthenticatedFetch = () => {
  const makeAuthenticatedRequest = async (
    url: string,
    options: RequestInit = {},
  ) => {
    const licenseKey = localStorage.getItem("license_key");

    if (!licenseKey) {
      throw new Error("Non authentifié");
    }

    const headers = {
      ...options.headers,
      "x-license-key": licenseKey,
    };

    return fetch(url, {
      ...options,
      headers,
    });
  };

  return { makeAuthenticatedRequest };
};
