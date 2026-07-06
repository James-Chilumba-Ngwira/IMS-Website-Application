import { useState } from "react";
import { Box, Button, Container, Paper, Stack, TextField, Typography } from "@mui/material";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Onboarding() {
    const nav = useNavigate();
    const [fullName, setFullName] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createProfile = async () => {
        setBusy(true);
        setError(null);

        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData.session?.user;

        if (!user) {
            setBusy(false);
            return setError("You are not logged in.");
        }

        const { error } = await supabase.from("profiles").insert({
            user_id: user.id,
            role: "INSTITUTION",
            full_name: fullName || null,
            institution_id: null,
        });

        setBusy(false);
        if (error) return setError(error.message);

        nav("/dashboard", { replace: true });
    };

    return (
        <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center" }}>
            <Container maxWidth="sm">
                <Paper sx={{ p: 4, borderRadius: 3 }}>
                    <Typography variant="h5" fontWeight={900} gutterBottom>
                        Complete Setup
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        We need a profile to continue.
                    </Typography>

                    <Stack spacing={2}>
                        <TextField label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                        {error && <Typography color="error">{error}</Typography>}
                        <Button variant="contained" onClick={createProfile} disabled={busy}>
                            {busy ? "Saving..." : "Continue"}
                        </Button>
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
}