import { Container, Paper, Typography, Button } from "@mui/material";
import { useAuth } from "../auth/AuthProvider";
import { useProfile } from "../profile/useProfile";
import ImmigrationDashboard from "./ImmigrationDashboard";
import InstitutionDashboard from "./InstitutionDashboard";
import StudentDashboard from "./StudentDashboard";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Dashboard() {
    const { user, signOut } = useAuth();
    const { data: profile, isLoading, error } = useProfile();
    const nav = useNavigate();

    useEffect(() => {
        // If user exists but no profile row yet → onboarding
        if (!isLoading && user && !profile) {
            nav("/onboarding", { replace: true });
        }
    }, [isLoading, user, profile, nav]);

    if (isLoading) return <div style={{ padding: 24 }}>Loading dashboard...</div>;

    if (error) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                        Dashboard Error
                    </Typography>
                    <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                        {(error as any)?.message ?? "Failed to load profile"}
                    </Typography>
                    <Button variant="outlined" onClick={signOut}>Sign out</Button>
                </Paper>
            </Container>
        );
    }

    // Profile missing -> Onboarding route will handle it
    if (!profile) return null;

    return (
        <>
            {profile.role === "IMMIGRATION" ? (
                <ImmigrationDashboard />
            ) : profile.role === "STUDENT" ? (
                <StudentDashboard />
            ) : (
                <InstitutionDashboard />
            )}
        </>
    );
}