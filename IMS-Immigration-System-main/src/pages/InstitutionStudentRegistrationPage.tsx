import { Container, Typography, Stack, Paper } from "@mui/material";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { StudentForm } from "../components/StudentForm";
import { useStudentRegistration } from "../hooks/useStudentRegistration";

export default function InstitutionStudentRegistrationPage() {
    const { enqueueSnackbar } = useSnackbar();
    const nav = useNavigate();

    const registerMutation = useStudentRegistration();

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                <Stack spacing={1}>
                    <Typography variant="h5" fontWeight={900}>
                        Register International Student
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Create a student record and associated visa record under your institution.
                    </Typography>
                </Stack>
            </Paper>

            <StudentForm
                isLoading={registerMutation.isPending}
                onSubmit={async (data) => {
                    try {
                        // Standardized to use nationality across all layers
                        const payload = {
                            student: {
                                full_name: data.student.full_name,
                                student_id_number: data.student.student_id_number,
                                nationality: data.student.nationality,
                                date_of_birth: data.student.date_of_birth,
                                passport_number: data.student.passport_number ?? null,
                                email: data.student.email ?? null,
                                phone: data.student.phone ?? null,
                            },
                            visa: {
                                visa_type: data.visa.visa_type,
                                status: data.visa.status,
                                start_date: data.visa.start_date,
                                end_date: data.visa.end_date,
                                visa_number: data.visa.visa_number ?? null,
                            },
                        };

                        await registerMutation.mutateAsync(payload as any);

                        enqueueSnackbar("Student registered successfully.", { variant: "success" });
                        nav("/dashboard", { replace: true }); // later we’ll route to /students list
                    } catch (e: any) {
                        enqueueSnackbar(e?.message ?? "Registration failed", { variant: "error" });
                    }
                }}
            />
        </Container>
    );
}