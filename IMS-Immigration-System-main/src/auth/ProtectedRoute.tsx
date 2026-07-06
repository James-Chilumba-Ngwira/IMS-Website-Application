import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

type Props = {
    children: React.ReactNode;
};

export function ProtectedRoute({ children }: Props) {
    const { user, loading } = useAuth();

    if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
    if (!user) return <Navigate to="/login" replace />;

    return <>{children}</>;
}