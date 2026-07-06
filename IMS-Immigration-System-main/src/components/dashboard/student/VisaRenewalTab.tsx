import { useState } from "react";
import { Box, Paper, Typography, Button, Stack, TextField, Chip, CircularProgress, Alert } from "@mui/material";
import { useSnackbar } from "notistack";
import { useStudent } from "../../../hooks/useStudents";
import { useMyVisaRenewalRequests, useRequestVisaRenewal } from "../../../hooks/useVisaRenewalRequests";

interface VisaRenewalTabProps {
    studentId?: string;
}

const statusColor: Record<string, "success" | "warning" | "error"> = {
    APPROVED: "success",
    PENDING: "warning",
    REJECTED: "error",
};

export function VisaRenewalTab({ studentId }: VisaRenewalTabProps) {
    const { enqueueSnackbar } = useSnackbar();
    const { data: student, isLoading: studentLoading } = useStudent(studentId || "");
    const { data: requests = [], isLoading: requestsLoading } = useMyVisaRenewalRequests(studentId);
    const { mutate: requestRenewal, isPending } = useRequestVisaRenewal();

    const [requestedEndDate, setRequestedEndDate] = useState("");
    const [reason, setReason] = useState("");

    const visa = student?.visa;
    const hasPending = requests.some((r) => r.status === "PENDING");

    const handleSubmit = () => {
        if (!student || !visa || !requestedEndDate || !reason.trim()) return;
        requestRenewal(
            {
                student_id: student.id,
                visa_id: visa.id,
                institution_id: student.institution_id,
                requested_end_date: requestedEndDate,
                reason: reason.trim(),
            },
            {
                onSuccess: () => {
                    enqueueSnackbar("Visa renewal request submitted", { variant: "success" });
                    setRequestedEndDate("");
                    setReason("");
                },
                onError: () => enqueueSnackbar("Failed to submit request", { variant: "error" }),
            }
        );
    };

    if (studentLoading) {
        return <Box sx={{ py: 10, textAlign: "center" }}><CircularProgress /></Box>;
    }

    return (
        <Box>
            <Typography variant="h5" fontWeight={800} color="#1E293B" mb={3}>Visa Renewal</Typography>

            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #E2E8F0", mb: 3 }}>
                <Typography variant="subtitle1" fontWeight={700} mb={2}>Request a Renewal</Typography>
                {!visa ? (
                    <Typography color="text.secondary">No visa on file to renew.</Typography>
                ) : hasPending ? (
                    <Alert severity="info">You already have a renewal request pending review.</Alert>
                ) : (
                    <Stack spacing={2}>
                        <Typography variant="body2" color="text.secondary">
                            Current visa expires <strong>{visa.end_date}</strong> ({visa.status}).
                        </Typography>
                        <TextField
                            label="Requested new expiry date"
                            type="date"
                            value={requestedEndDate}
                            onChange={(e) => setRequestedEndDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            sx={{ maxWidth: 280, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                        />
                        <TextField
                            label="Reason for renewal"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            multiline
                            minRows={3}
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                        />
                        <Box>
                            <Button
                                variant="contained"
                                disabled={!requestedEndDate || !reason.trim() || isPending}
                                onClick={handleSubmit}
                                sx={{ borderRadius: 2, fontWeight: 700, px: 4 }}
                            >
                                {isPending ? "Submitting..." : "Submit Request"}
                            </Button>
                        </Box>
                    </Stack>
                )}
            </Paper>

            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #E2E8F0" }}>
                <Typography variant="subtitle1" fontWeight={700} mb={2}>Request History</Typography>
                {requestsLoading ? (
                    <CircularProgress size={20} />
                ) : requests.length === 0 ? (
                    <Typography color="text.secondary">No renewal requests yet.</Typography>
                ) : (
                    <Stack spacing={2}>
                        {requests.map((r) => (
                            <Box key={r.id} sx={{ p: 2, border: "1px solid #F1F5F9", borderRadius: 2 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                                    <Typography variant="body2" fontWeight={700}>Requested expiry: {r.requested_end_date}</Typography>
                                    <Chip label={r.status} size="small" color={statusColor[r.status]} />
                                </Stack>
                                <Typography variant="caption" color="text.secondary" display="block">{r.reason}</Typography>
                                {r.review_note && (
                                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5, fontStyle: "italic" }}>
                                        Institution note: {r.review_note}
                                    </Typography>
                                )}
                                <Typography variant="caption" color="text.disabled" display="block" sx={{ mt: 0.5 }}>
                                    Submitted {new Date(r.created_at).toLocaleDateString()}
                                </Typography>
                            </Box>
                        ))}
                    </Stack>
                )}
            </Paper>
        </Box>
    );
}
