import { Container, Paper, Stack, Typography, Button, Alert, Chip } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { DataTable } from "../components/DataTable";
import { useProfile } from "../profile/useProfile";
import { useStudents } from "../hooks/useStudents";
import { useIssueStudentCard } from "../hooks/useStudentCards";
import { useSnackbar } from "notistack";

export default function StudentsPage() {
    const nav = useNavigate();
    const location = useLocation();
    const { enqueueSnackbar } = useSnackbar();
    const issueCard = useIssueStudentCard();
    const { data: profile, isLoading: profileLoading } = useProfile();

    const searchParams = new URLSearchParams(location.search);
    const urlQuery = searchParams.get("search") || "";

    const isInstitution = profile?.role === "INSTITUTION";

    // RLS will filter automatically for institution users.
    // Immigration will see all, if their role is IMMIGRATION and RLS allows.
    const { data, isLoading, error } = useStudents();

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <div>
                        <Typography variant="h4" fontWeight={900}>
                            Student Registry
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Manage international students and visa lifecycle records.
                        </Typography>
                    </div>

                    {isInstitution && (
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => nav("/institution/register-student")}
                        >
                            Register Student
                        </Button>
                    )}
                </Stack>
            </Paper>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    Failed to load students: {(error as any)?.message ?? String(error)}
                </Alert>
            )}

            <DataTable
                data={data ?? []}
                isLoading={isLoading || profileLoading}
                searchPlaceholder="Search students..."
                initialSearch={urlQuery}
                onRowClick={(row) => nav(`/students/${row.id}`)}
                columns={[
                    { id: "student_id_number", label: "Student ID" },
                    { id: "full_name", label: "Full Name" },
                    { id: "nationality", label: "Nationality" },
                    { id: "passport_number", label: "Passport No." },

                    // Institution column (useful for Immigration; will still show for Institution too)
                    {
                        id: "institution",
                        label: "Institution",
                        render: (row: any) => row.institution?.name ?? "—",
                    },

                    // Visa status + expiry (you selected visa:visas(*) so visa may be array)
                    {
                        id: "visa_status",
                        label: "Visa Status",
                        render: (row: any) => {
                            const v = Array.isArray(row.visa) ? row.visa[0] : row.visa;
                            const status = v?.status ?? "—";
                            return (
                                <Chip
                                    size="small"
                                    label={status}
                                    variant="outlined"
                                />
                            );
                        },
                    },
                    {
                        id: "visa_expiry",
                        label: "Visa Expiry",
                        render: (row: any) => {
                            const v = Array.isArray(row.visa) ? row.visa[0] : row.visa;
                            return v?.end_date ?? "—";
                        },
                    },
                    {
                        id: "actions",
                        label: "Actions",
                        render: (row: any) => (
                            <Stack direction="row" spacing={1}>
                                <Button
                                    size="small"
                                    variant="contained"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        issueCard.mutate(row.id, {
                                            onSuccess: () => enqueueSnackbar("Digital card issued successfully", { variant: "success" }),
                                            onError: (err: any) => enqueueSnackbar(err.message || "Failed to issue card", { variant: "error" })
                                        });
                                    }}
                                >
                                    Issue Card
                                </Button>
                            </Stack>
                        ),
                    }
                ]}
            />
        </Container>
    );
}