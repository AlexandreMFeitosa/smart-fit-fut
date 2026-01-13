import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { ReactNode } from "react";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  // Mostra um carregando enquanto o Firebase verifica a sessão
  if (loading) {
    return <div className="app-container">Verificando permissão...</div>;
  }

  // Se não estiver logado, manda para o Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}