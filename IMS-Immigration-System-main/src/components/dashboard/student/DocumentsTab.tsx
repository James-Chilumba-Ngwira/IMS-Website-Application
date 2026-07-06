import { useState } from "react";
import { Box, Paper, Typography, Button, Stack, Chip, CircularProgress } from "@mui/material";
import { Badge as BadgeIcon, Download as DownloadIcon } from "@mui/icons-material";
import { useStudent } from "../../../hooks/useStudents";
import { StudentCardDialog } from "../StudentCardDialog";
import { DataTable } from "../../DataTable";
import type { AttendanceRecord } from "../../../types/database.types";

interface DocumentsTabProps {
    studentId?: string;
}

function downloadTextFile(filename: string, contents: string) {
    const blob = new Blob([contents], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function DocumentsTab({ studentId }: DocumentsTabProps) {
    const { data: student, isLoading } = useStudent(studentId || "");
    const [cardOpen, setCardOpen] = useState(false);

    if (isLoading) {
        return <Box sx={{ py: 10, textAlign: "center" }}><CircularProgress /></Box>;
    }
    if (!student) {
        return <Typography color="text.secondary">No student record found.</Typography>;
    }

    const visa = student.visa;

    const downloadVisaSummary = () => {
        const lines = [
            "IMS-IS — VISA SUMMARY",
            "======================",
            `Student: ${student.full_name}`,
            `Student ID: ${student.student_id_number}`,
            `Nationality: ${student.nationality}`,
            `Institution: ${student.institution?.name || "—"}`,
            "",
            `Visa Type: ${visa?.visa_type || "—"}`,
            `Visa Number: ${visa?.visa_number || "—"}`,
            `Status: ${visa?.status || "—"}`,
            `Start Date: ${visa?.start_date || "—"}`,
            `End Date: ${visa?.end_date || "—"}`,
            "",
            `Generated: ${new Date().toLocaleString()}`,
        ];
        downloadTextFile(`visa-summary-${student.student_id_number}.txt`, lines.join("\n"));
    };

    const downloadAttendanceCsv = () => {
        const rows = student.attendance || [];
        const header = "date,status,notes";
        const body = rows.map((r) => `${r.attendance_date},${r.status},${(r.notes || "").replace(/,/g, ";")}`).join("\n");
        downloadTextFile(`attendance-history-${student.student_id_number}.csv`, `${header}\n${body}`);
    };

    const attendanceColumns = [
        { id: "attendance_date", label: "Date" },
        {
            id: "status",
            label: "Status",
            render: (row: AttendanceRecord) => (
                <Chip
                    label={row.status}
                    size="small"
                    color={row.status === "PRESENT" ? "success" : row.status === "LATE" ? "warning" : row.status === "ABSENT" ? "error" : "default"}
                />
            ),
        },
        { id: "notes", label: "Notes", render: (row: AttendanceRecord) => row.notes || "—" },
    ];

    return (
        <Box>
            <Typography variant="h5" fontWeight={800} color="#1E293B" mb={3}>My Documents</Typography>

            <Stack spacing={3}>
                <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #E2E8F0" }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                        <Box>
                            <Typography variant="subtitle1" fontWeight={700}>Digital Student ID</Typography>
                            <Typography variant="body2" color="text.secondary">Blockchain-verified digital identity with QR verification.</Typography>
                        </Box>
                        <Button variant="contained" startIcon={<BadgeIcon />} sx={{ borderRadius: 2, fontWeight: 700 }} onClick={() => setCardOpen(true)}>
                            View Digital ID
                        </Button>
                    </Stack>
                </Paper>

                <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #E2E8F0" }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                        <Box>
                            <Typography variant="subtitle1" fontWeight={700}>Visa Summary</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {visa ? `${visa.visa_type} · ${visa.status} · expires ${visa.end_date}` : "No visa on file"}
                            </Typography>
                        </Box>
                        <Button variant="outlined" startIcon={<DownloadIcon />} sx={{ borderRadius: 2, fontWeight: 700 }} onClick={downloadVisaSummary}>
                            Download
                        </Button>
                    </Stack>
                </Paper>

                <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #E2E8F0" }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={2}>
                        <Typography variant="subtitle1" fontWeight={700}>Attendance History</Typography>
                        <Button variant="outlined" startIcon={<DownloadIcon />} sx={{ borderRadius: 2, fontWeight: 700 }} onClick={downloadAttendanceCsv}>
                            Download CSV
                        </Button>
                    </Stack>
                    <DataTable columns={attendanceColumns} data={student.attendance || []} searchable={false} />
                </Paper>
            </Stack>

            <StudentCardDialog open={cardOpen} studentId={studentId || null} onClose={() => setCardOpen(false)} />
        </Box>
    );
}
