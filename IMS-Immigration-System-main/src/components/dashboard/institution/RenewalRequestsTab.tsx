import { useState } from "react";
import { Box, Paper, Typography, Stack, Chip, Button, TextField, CircularProgress } from "@mui/material";
import { useSnackbar } from "notistack";
import { useAuth } from "../../../auth/AuthProvider";
import { useInstitutionVisaRenewalRequests, useReviewVisaRenewal } from "../../../hooks/useVisaRenewalRequests";

const statusColor: Record<string, "success" | "warning" | "error"> = {
    APPROVED: "success",
    PENDING: "warning",
    REJECTED: "error",
};

export function RenewalRequestsTab() {
    const { enqueueSnackbar } = useSnackbar();
    const { user, profile } = useAuth();
    const { data: requests = [], isLoading } = useInstitutionVisaRenewalRequests(profile?.institution_id || undefined);
    const { mutate: review, isPending } = useReviewVisaRenewal();
    const [notes, setNotes] = useState<Record<string, string>>({});

    const pending = requests.filter((r) => r.status === "PENDING");
    const decided = requests.filter((r) => r.status !== "PENDING");

    const handleReview = (requestId: string, visaId: string, requestedEndDate: string, status: "APPROVED" | "REJECTED") => {
        review(
            { id: requestId, status, reviewNote: notes[requestId] || "", reviewedBy: user?.id || "", visaId, requestedEndDate },
            {
                onSuccess: () => enqueueSnackbar(`Request ${status.toLowerCase()}`, { variant: "success" }),
                onError: () => enqueueSnackbar("Failed to update request", { variant: "error" }),
            }
        );
    };

    if (isLoading) {
        return <Box sx={{ py: 10, textAlign: "center" }}><CircularProgress /></Box>;
    }

    return (
        <Box>
            <Typography variant="h6" mb={2}>Pending Visa Renewal Requests</Typography>
            {pending.length === 0 ? (
                <Typography color="text.secondary" mb={4}>No pending requests.</Typography>
            ) : (
                <Stack spacing={2} mb={4}>
                    {pending.map((r) => (
                        <Paper key={r.id} elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #E2E8F0" }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
                                <Box>
                                    <Typography variant="subtitle1" fontWeight={700}>
                                        {r.student?.full_name} <Typography component="span" variant="caption" color="text.secondary">({r.student?.student_id_number})</Typography>
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">Requested new expiry: {r.requested_end_date}</Typography>
                                    <Typography variant="body2" sx={{ mt: 1 }}>{r.reason}</Typography>
                                </Box>
                                <Chip label={r.status} color={statusColor[r.status]} size="small" />
                            </Stack>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Optional review note..."
                                value={notes[r.id] || ""}
                                onChange={(e) => setNotes((n) => ({ ...n, [r.id]: e.target.value }))}
                                sx={{ mt: 2, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                            />
                            <Stack direction="row" spacing={2} mt={2}>
                                <Button
                                    variant="contained"
                                    color="success"
                                    disabled={isPending}
                                    onClick={() => handleReview(r.id, r.visa_id, r.requested_end_date, "APPROVED")}
                                    sx={{ borderRadius: 2, fontWeight: 700 }}
                                >
                                    Approve
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    disabled={isPending}
                                    onClick={() => handleReview(r.id, r.visa_id, r.requested_end_date, "REJECTED")}
                                    sx={{ borderRadius: 2, fontWeight: 700 }}
                                >
                                    Reject
                                </Button>
                            </Stack>
                        </Paper>
                    ))}
                </Stack>
            )}

            <Typography variant="h6" mb={2}>Reviewed Requests</Typography>
            {decided.length === 0 ? (
                <Typography color="text.secondary">No reviewed requests yet.</Typography>
            ) : (
                <Stack spacing={1.5}>
                    {decided.map((r) => (
                        <Paper key={r.id} elevation={0} sx={{ p: 2, borderRadius: 2, border: "1px solid #F1F5F9" }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2" fontWeight={600}>{r.student?.full_name} — {r.requested_end_date}</Typography>
                                <Chip label={r.status} color={statusColor[r.status]} size="small" />
                            </Stack>
                            {r.review_note && <Typography variant="caption" color="text.secondary">{r.review_note}</Typography>}
                        </Paper>
                    ))}
                </Stack>
            )}
        </Box>
    );
}
