"use client";

import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useAuth } from "@/lib/auth/auth-context";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullScreen label="Checking authentication..." />;
  }

  return <>{children}</>;
}
