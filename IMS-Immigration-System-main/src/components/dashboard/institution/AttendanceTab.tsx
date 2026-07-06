import { useState } from "react";
import { Box, Typography, TextField, Button, MenuItem, Paper, Autocomplete, Alert, Snackbar } from "@mui/material";
import { useStudents } from "../../../hooks/useStudents";
import { useProfile } from "../../../profile/useProfile";
import { useCreateAttendance, useAttendanceRecords } from "../../../hooks/useAttendance";
import { DataTable } from "../../DataTable";
import type { Student } from "../../../types/database.types";

export function AttendanceTab() {
    const { data: profile } = useProfile();
    const { data: students = [], isLoading: loadingStudents } = useStudents(profile?.institution_id || undefined);

    // Form State
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [status, setStatus] = useState("PRESENT");
    const [notes, setNotes] = useState("");

    // Mutation
    const { mutate: createAttendance, isPending: isSubmitting, error } = useCreateAttendance();
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // Recent Records (only if student selected)
    const { data: records = [], isLoading: loadingRecords } = useAttendanceRecords(selectedStudent?.id || "");

    const handleSubmit = () => {
        if (!selectedStudent) return;

        createAttendance(
            {
                student_id: selectedStudent.id,
                attendance_date: date,
                status: status as any,
                notes: notes,
            },
            {
                onSuccess: () => {
                    setSuccessMsg("Attendance recorded!");
                    setNotes("");
                },
            }
        );
    };

    const columns = [
        { id: "attendance_date", label: "Date" },
        { id: "status", label: "Status" },
        { id: "notes", label: "Notes" },
        { id: "created_at", label: "Logged At", render: (row: any) => new Date(row.created_at).toLocaleString() },
    ];

    return (
        <Box maxWidth="md">
            <Typography variant="h6" mb={3}>Record Attendance</Typography>

            <Paper sx={{ p: 3, mb: 4 }}>
                <Box sx={{ display: 'grid', gap: 2 }}>
                    <Autocomplete
                        options={students}
                        getOptionLabel={(option) => `${option.full_name} (${option.student_id_number})`}
                        value={selectedStudent}
                        onChange={(_, newValue) => setSelectedStudent(newValue)}
                        loading={loadingStudents}
                        renderInput={(params) => <TextField {...params} label="Select Student" required />}
                    />

                    <TextField
                        type="date"
                        label="Date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        required
                    />

                    <TextField
                        select
                        label="Status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        required
                    >
                        <MenuItem value="PRESENT">Present</MenuItem>
                        <MenuItem value="ABSENT">Absent</MenuItem>
                        <MenuItem value="LATE">Late</MenuItem>
                        <MenuItem value="EXCUSED">Excused</MenuItem>
                    </TextField>

                    <TextField
                        label="Notes"
                        multiline
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />

                    {error && (
                        <Alert severity="error">{(error as any).message}</Alert>
                    )}

                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={!selectedStudent || isSubmitting}
                    >
                        {isSubmitting ? "Recording..." : "Submit Record"}
                    </Button>
                </Box>
            </Paper>

            {selectedStudent && (
                <Box>
                    <Typography variant="subtitle1" mb={1}>Recent Attendance: {selectedStudent.full_name}</Typography>
                    <DataTable
                        columns={columns}
                        data={records}
                        isLoading={loadingRecords}
                        searchable={false}
                    />
                </Box>
            )}

            <Snackbar
                open={!!successMsg}
                autoHideDuration={6000}
                onClose={() => setSuccessMsg(null)}
                message={successMsg}
            />
        </Box>
    );
}
