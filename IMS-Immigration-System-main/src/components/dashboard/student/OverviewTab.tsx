import { Box, Grid, Paper, Typography, Chip, Stack, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useStudent } from "../../../hooks/useStudents";
import { useMyVisaRenewalRequests } from "../../../hooks/useVisaRenewalRequests";

interface OverviewTabProps {
    studentId?: string;
}

const visaStatusColor: Record<string, "success" | "warning" | "error" | "default"> = {
    ACTIVE: "success",
    PENDING_RENEWAL: "warning",
    EXPIRED: "error",
    CANCELLED: "default",
};

export function OverviewTab({ studentId }: OverviewTabProps) {
    const navigate = useNavigate();
    const { data: student, isLoading } = useStudent(studentId || "");
    const { data: renewalRequests = [] } = useMyVisaRenewalRequests(studentId);

    if (isLoading) {
        return <Box sx={{ py: 10, textAlign: "center" }}><CircularProgress /></Box>;
    }
    if (!student) {
        return <Typography color="text.secondary">No student record found.</Typography>;
    }

    const visa = student.visa;
    const pendingRequest = renewalRequests.find((r) => r.status === "PENDING");
    const daysLeft = visa ? Math.ceil((new Date(visa.end_date).getTime() - Date.now()) / 86_400_000) : null;

    return (
        <Box>
            <Typography variant="h5" fontWeight={800} color="#1E293B" mb={3}>
                Welcome, {student.full_name.split(" ")[0]}
            </Typography>

            <Grid container spacing={3} mb={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #E2E8F0", height: "100%" }}>
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>Visa Status</Typography>
                        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mt: 1.5 }}>
                            <Chip label={visa?.status || "N/A"} color={visaStatusColor[visa?.status || ""] || "default"} sx={{ fontWeight: 700 }} />
                            {daysLeft != null && (
                                <Typography variant="caption" color={daysLeft < 30 ? "error.main" : "text.secondary"} fontWeight={600}>
                                    {daysLeft >= 0 ? `${daysLeft} days left` : `Expired ${Math.abs(daysLeft)} days ago`}
                                </Typography>
                            )}
                        </Stack>
                        {pendingRequest && (
                            <Typography variant="caption" color="warning.main" display="block" sx={{ mt: 1.5 }} fontWeight={600}>
                                Renewal request pending review
                            </Typography>
                        )}
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #E2E8F0", height: "100%" }}>
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>Institution</Typography>
                        <Typography variant="h6" fontWeight={800} sx={{ mt: 1.5 }}>{student.institution?.name || "—"}</Typography>
                        <Typography variant="caption" color="text.secondary">{(student.metadata as any)?.program || ""}</Typography>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #E2E8F0", height: "100%" }}>
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>Student ID</Typography>
                        <Typography variant="h6" fontWeight={800} sx={{ mt: 1.5, fontFamily: "monospace" }}>{student.student_id_number}</Typography>
                        <Typography variant="caption" color="text.secondary">{student.nationality}</Typography>
                    </Paper>
                </Grid>
            </Grid>

            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #E2E8F0" }}>
                <Typography variant="subtitle1" fontWeight={700} mb={2}>Quick Actions</Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                    <Chip label="View / download my documents" onClick={() => navigate("/dashboard?tab=documents")} sx={{ fontWeight: 600, cursor: "pointer" }} />
                    <Chip label="Request visa renewal" onClick={() => navigate("/dashboard?tab=renewal")} sx={{ fontWeight: 600, cursor: "pointer" }} />
                    <Chip label="Message my institution" onClick={() => navigate("/dashboard?tab=messages")} sx={{ fontWeight: 600, cursor: "pointer" }} />
                    <Chip label="Update contact info" onClick={() => navigate("/dashboard?tab=contact")} sx={{ fontWeight: 600, cursor: "pointer" }} />
                </Stack>
            </Paper>
        </Box>
    );
}
