import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    CircularProgress,
    Stack,
    IconButton,
    Typography
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import DigitalStudentCard from "../DigitalStudentCard";
import { useStudentCard, useMintCardToken } from "../../hooks/useStudentCards";
import { useEffect, useState } from "react";

interface StudentCardDialogProps {
    open: boolean;
    studentId: string | null;
    onClose: () => void;
}

export function StudentCardDialog({ open, studentId, onClose }: StudentCardDialogProps) {
    const { data: card, isLoading: cardLoading } = useStudentCard(studentId || "");
    const { mutate: mintToken, isPending: loadingToken } = useMintCardToken();
    const [token, setToken] = useState<string | null>(null);

    // Reset the token during render when the dialog closes, rather than in an
    // effect — this is React's recommended pattern for adjusting state in
    // response to a prop change (avoids an extra synchronous setState-in-effect).
    const [wasOpen, setWasOpen] = useState(open);
    if (open !== wasOpen) {
        setWasOpen(open);
        if (!open) setToken(null);
    }

    useEffect(() => {
        if (open && card?.id) {
            mintToken(card.id, {
                onSuccess: (res) => setToken(res.token),
                onError: (err) => console.error("Failed to mint token:", err),
            });
        }
    }, [open, card?.id, mintToken]);

    const isLoading = cardLoading || loadingToken;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md">
            <DialogTitle>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight={800}>Digital Student ID</Typography>
                    <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
                </Stack>
            </DialogTitle>
            <DialogContent dividers sx={{ bgcolor: "#F1F5F9", display: "flex", justifyContent: "center", p: 4 }}>
                {isLoading ? (
                    <Box sx={{ py: 10 }}>
                        <CircularProgress />
                    </Box>
                ) : card && card.status === "ACTIVE" && token ? (
                    <DigitalStudentCard
                        open={open}
                        onClose={onClose}
                        student={{
                            id: card.id,
                            fullName: card.student.full_name,
                            dateOfBirth: card.student.date_of_birth,
                            sex: (card.student as any).sex || card.student.metadata?.sex || "—",
                            nationality: card.student.nationality,
                            photo: card.student.photo_url,
                            schoolName: card.institution.name,
                            schoolAddress: card.institution.address || "—",
                            schoolLogo: card.institution.logo_url,
                            cityRegion: card.institution.city || "Almaty",
                            phoneNumber: card.student.phone || "—",
                            dateOfIssue: new Date(card.created_at).toLocaleDateString(),
                            dateOfExpiry: card.expires_at ? new Date(card.expires_at).toLocaleDateString() : (card.student.visa?.end_date ? new Date(card.student.visa.end_date).toLocaleDateString() : "—"),
                            qrData: `${window.location.origin}/verify?t=${token}`,
                        }}
                    />
                ) : card ? (
                    <Stack alignItems="center" spacing={2} py={4}>
                        <Typography color="warning.main" fontWeight={700}>
                            Card Status: {card.status}
                        </Typography>
                        <Typography color="text.secondary" textAlign="center">
                            The digital ID is currently {card.status.toLowerCase()}.
                            {card.status === 'PENDING' ? ' It may require additional processing.' : ''}
                        </Typography>
                    </Stack>
                ) : (
                    <Typography color="text.secondary">
                        No digital ID card record found for this student.
                    </Typography>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} variant="contained" sx={{ borderRadius: 2 }}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}
