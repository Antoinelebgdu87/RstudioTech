import React, { createContext, useContext } from "react";
import { useAuthLogic } from "../hooks/use-auth";
import { User, License } from "../../shared/types";

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

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const authLogic = useAuthLogic();

  return (
    <AuthContext.Provider value={authLogic}>{children}</AuthContext.Provider>
  );
};
