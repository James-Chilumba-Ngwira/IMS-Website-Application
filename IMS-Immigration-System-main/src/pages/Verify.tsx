import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
    Box,
    Container,
    Paper,
    Typography,
    CircularProgress,
    Stack,
    Chip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { supabase } from "../lib/supabaseClient";

type VerifyResult =
    | {
        valid: true;
        integrity_ok: boolean;
        institution: string | null;
        visa_status: string;
        visa_end_date: string | null;
        student_nationality: string | null;
    }
    | {
        valid: false;
        reason: string;
        error?: string;
    };

export default function Verify() {
    const [params] = useSearchParams();
    const token = params.get("t");

    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState<VerifyResult | null>(null);

    useEffect(() => {
        (async () => {
            try {
                if (!token) {
                    setResult({ valid: false, reason: "missing_token" });
                    return;
                }

                // Call edge function with token in query
                const { data, error } = await supabase.functions.invoke(`verify-card?t=${encodeURIComponent(token)}`, {
                    method: 'GET',
                });

                if (error) throw error;
                setResult(data);
            } catch (e: any) {
                setResult({ valid: false, reason: "client_error", error: String(e) });
            } finally {
                setLoading(false);
            }
        })();
    }, [token]);

    const isValid = result && "valid" in result && result.valid;

    return (
        <Box
            sx={{
                minHeight: "100vh",
                background: "linear-gradient(180deg, #f7f9fc 0%, #ffffff 70%)",
                py: 6,
            }}
        >
            <Container maxWidth="sm">
                <Paper sx={{ p: 4, borderRadius: 3 }}>
                    {loading ? (
                        <Stack spacing={2} alignItems="center">
                            <CircularProgress />
                            <Typography color="text.secondary">Verifying...</Typography>
                        </Stack>
                    ) : isValid ? (
                        <Stack spacing={2} alignItems="center">
                            <CheckCircleIcon sx={{ fontSize: 72, color: "success.main" }} />
                            <Typography variant="h4" fontWeight={900} color="success.main">
                                VALID
                            </Typography>

                            <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
                                <Chip label={`Institution: ${result.institution ?? "N/A"}`} />
                                <Chip label={`Visa: ${result.visa_status}`} />
                                <Chip label={`Expiry: ${result.visa_end_date ?? "N/A"}`} />
                                <Chip label={`Integrity: ${result.integrity_ok ? "OK" : "FAIL"}`} />
                            </Stack>

                            <Typography variant="body2" color="text.secondary" align="center">
                                Minimal verification data displayed to preserve privacy.
                            </Typography>
                        </Stack>
                    ) : (
                        <Stack spacing={2} alignItems="center">
                            <CancelIcon sx={{ fontSize: 72, color: "error.main" }} />
                            <Typography variant="h4" fontWeight={900} color="error.main">
                                INVALID
                            </Typography>

                            <Typography color="text.secondary">
                                Reason: {(result as any)?.reason ?? "unknown"}
                            </Typography>
                        </Stack>
                    )}
                </Paper>
            </Container>
        </Box>
    );
}