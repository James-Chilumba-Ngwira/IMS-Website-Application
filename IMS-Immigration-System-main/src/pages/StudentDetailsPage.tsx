import { useParams, useNavigate } from "react-router-dom";
import {
    Container,
    Paper,
    Stack,
    Typography,
    Button,
    Divider,
    Chip,
    Grid,
    Alert,
} from "@mui/material";
import { DataTable } from "../components/DataTable";
import { useStudent } from "../hooks/useStudents";

export default function StudentDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const nav = useNavigate();

    const { data: student, isLoading, error } = useStudent(id || "");

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error">
                    Failed to load student: {(error as any)?.message ?? String(error)}
                </Alert>
                <Button sx={{ mt: 2 }} onClick={() => nav("/students")} variant="outlined">
                    Back to Students
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <div>
                        <Typography variant="h4" fontWeight={900}>
                            Student Profile
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            View student information, visa status, and compliance records.
                        </Typography>
                    </div>

                    <Stack direction="row" spacing={1.5}>
                        <Button variant="outlined" onClick={() => nav("/students")}>
                            Back
                        </Button>

                        {/* Next feature (we’ll implement after this page works) */}
                        <Button
                            variant="contained"
                            onClick={() => nav(`/students/${id}/issue-card`)}
                            disabled={!student}
                        >
                            Issue Digital Card
                        </Button>
                    </Stack>
                </Stack>
            </Paper>

            {/* Student Overview */}
            <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
                    Basic Information
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Typography color="text.secondary" variant="caption">Full Name</Typography>
                        <Typography fontWeight={700}>{student?.full_name ?? "—"}</Typography>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <Typography color="text.secondary" variant="caption">Student ID Number</Typography>
                        <Typography fontWeight={700}>{student?.student_id_number ?? "—"}</Typography>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <Typography color="text.secondary" variant="caption">Nationality</Typography>
                        <Typography fontWeight={700}>{student?.nationality ?? "—"}</Typography>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <Typography color="text.secondary" variant="caption">Passport Number</Typography>
                        <Typography fontWeight={700}>{student?.passport_number ?? "—"}</Typography>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <Typography color="text.secondary" variant="caption">Date of Birth</Typography>
                        <Typography fontWeight={700}>{student?.date_of_birth ?? "—"}</Typography>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <Typography color="text.secondary" variant="caption">Contact</Typography>
                        <Typography fontWeight={700}>
                            {student?.email ?? "—"} {student?.phone ? ` • ${student.phone}` : ""}
                        </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <Typography color="text.secondary" variant="caption">Institution</Typography>
                        <Typography fontWeight={700}>{student?.institution?.name ?? "—"}</Typography>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <Typography color="text.secondary" variant="caption">Record Status</Typography>
                        <div>
                            <Chip
                                size="small"
                                label={(student as any)?.status ?? "ACTIVE"}
                                variant="outlined"
                            />
                        </div>
                    </Grid>
                </Grid>
            </Paper>

            {/* Visa Records */}
            <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="h6" fontWeight={800}>
                        Visa Records
                    </Typography>
                    <Button
                        variant="outlined"
                        onClick={() => nav(`/students/${id}/add-visa`)}
                        disabled={!student}
                    >
                        Add / Update Visa
                    </Button>
                </Stack>

                <DataTable
                    data={(student as any)?.visa ?? []}
                    isLoading={isLoading}
                    searchable={false}
                    columns={[
                        { id: "visa_type", label: "Type" },
                        { id: "visa_number", label: "Visa No." },
                        { id: "start_date", label: "Start Date" },
                        { id: "end_date", label: "End Date" },
                        {
                            id: "status",
                            label: "Status",
                            render: (row: any) => <Chip size="small" label={row.status} variant="outlined" />,
                        },
                    ]}
                />
            </Paper>

            {/* Attendance Records (optional, only if you have data) */}
            <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
                    Attendance Records
                </Typography>

                <DataTable
                    data={(student as any)?.attendance ?? []}
                    isLoading={isLoading}
                    searchable={false}
                    columns={[
                        { id: "date", label: "Date" },
                        { id: "status", label: "Status" },
                        { id: "notes", label: "Notes" },
                    ]}
                />
            </Paper>
        </Container>
    );
}