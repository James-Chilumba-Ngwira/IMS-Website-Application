import { useState } from "react";
import { Box, Typography } from "@mui/material";
import { useStudents } from "../../../hooks/useStudents";
import { useAuth } from "../../../auth/AuthProvider";
import { useIssueStudentCard } from "../../../hooks/useStudentCards";
import { DataTable } from "../../DataTable";
import { StudentProfileDialog } from "../StudentProfileDialog";
import type { Student } from "../../../types/database.types";
import { Button, Stack } from "@mui/material";
import { useSnackbar } from "notistack";
import { StudentCardDialog } from "../StudentCardDialog";

interface MyStudentsTabProps {
    initialSearch?: string;
}

export function MyStudentsTab({ initialSearch = "" }: MyStudentsTabProps) {
    const { profile } = useAuth();
    const { enqueueSnackbar } = useSnackbar();
    const issueCard = useIssueStudentCard();
    const { data: students = [], isLoading } = useStudents(profile?.institution_id || undefined);
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const [cardStudentId, setCardStudentId] = useState<string | null>(null);

    const columns = [
        { id: "full_name", label: "Full Name" },
        { id: "student_id_number", label: "Student ID" },
        { id: "nationality", label: "Nationality" },
        { id: "date_of_birth", label: "DOB" },
        { id: "passport_number", label: "Passport" },
        {
            id: "visa_status",
            label: "Visa Status",
            render: (row: Student) => row.visa?.status || "N/A"
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
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={(e) => {
                            e.stopPropagation();
                            setCardStudentId(row.id);
                        }}
                    >
                        View Card
                    </Button>
                </Stack>
            ),
        }
    ];

    return (
        <Box>
            <Typography variant="h6" mb={2}>Enrolled Students</Typography>
            <DataTable
                columns={columns}
                data={students}
                isLoading={isLoading}
                searchPlaceholder="Search by name, ID, nationality..."
                onRowClick={(row) => setSelectedStudentId(row.id)}
                initialSearch={initialSearch}
            />

            <StudentProfileDialog
                open={!!selectedStudentId}
                studentId={selectedStudentId}
                onClose={() => setSelectedStudentId(null)}
            />

            <StudentCardDialog
                open={!!cardStudentId}
                studentId={cardStudentId}
                onClose={() => setCardStudentId(null)}
            />
        </Box>
    );
}
