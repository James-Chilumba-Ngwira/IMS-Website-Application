import { useState } from "react";
import { Box, Paper, Typography, Stack, TextField, Button, CircularProgress } from "@mui/material";
import { useSnackbar } from "notistack";
import { useStudent, useUpdateMyContactInfo } from "../../../hooks/useStudents";

interface ContactInfoTabProps {
    studentId?: string;
}

export function ContactInfoTab({ studentId }: ContactInfoTabProps) {
    const { enqueueSnackbar } = useSnackbar();
    const { data: student, isLoading } = useStudent(studentId || "");
    const { mutate: updateContactInfo, isPending } = useUpdateMyContactInfo();

    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [loadedFor, setLoadedFor] = useState<string | null>(null);

    // Sync local form state once, when the student record first arrives —
    // avoids clobbering in-progress edits on background refetches.
    if (student && loadedFor !== student.id) {
        setLoadedFor(student.id);
        setEmail(student.email || "");
        setPhone(student.phone || "");
    }

    const handleSave = () => {
        if (!student) return;
        updateContactInfo(
            { studentId: student.id, email, phone },
            {
                onSuccess: () => enqueueSnackbar("Contact info updated", { variant: "success" }),
                onError: () => enqueueSnackbar("Failed to update contact info", { variant: "error" }),
            }
        );
    };

    if (isLoading) {
        return <Box sx={{ py: 10, textAlign: "center" }}><CircularProgress /></Box>;
    }
    if (!student) {
        return <Typography color="text.secondary">No student record found.</Typography>;
    }

    return (
        <Box>
            <Typography variant="h5" fontWeight={800} color="#1E293B" mb={3}>Contact Info</Typography>

            <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: "1px solid #E2E8F0", maxWidth: 480 }}>
                <Typography variant="body2" color="text.secondary" mb={3}>
                    Keep your email and phone number up to date so your institution and immigration office can reach you.
                </Typography>
                <Stack spacing={3}>
                    <TextField
                        label="Full Name"
                        value={student.full_name}
                        disabled
                        fullWidth
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#F8FAFC" } }}
                    />
                    <TextField
                        label="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        fullWidth
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    />
                    <TextField
                        label="Phone Number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        fullWidth
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    />
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <Button variant="contained" onClick={handleSave} disabled={isPending} sx={{ borderRadius: 2, fontWeight: 700, px: 4 }}>
                            {isPending ? "Saving..." : "Save Changes"}
                        </Button>
                    </Box>
                </Stack>
            </Paper>
        </Box>
    );
}
