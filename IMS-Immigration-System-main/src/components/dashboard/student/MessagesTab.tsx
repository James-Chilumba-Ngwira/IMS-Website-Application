import { useState } from "react";
import { Box, Paper, Typography, Stack, TextField, Button, CircularProgress, Avatar } from "@mui/material";
import { Send as SendIcon } from "@mui/icons-material";
import { useAuth } from "../../../auth/AuthProvider";
import { useStudent } from "../../../hooks/useStudents";
import { useMessages, useSendMessage } from "../../../hooks/useMessages";

interface MessagesTabProps {
    studentId?: string;
}

export function MessagesTab({ studentId }: MessagesTabProps) {
    const { profile } = useAuth();
    const { data: student } = useStudent(studentId || "");
    const { data: messages = [], isLoading } = useMessages(studentId);
    const { mutate: sendMessage, isPending } = useSendMessage();
    const [body, setBody] = useState("");

    const handleSend = () => {
        if (!student || !body.trim()) return;
        sendMessage(
            {
                student_id: student.id,
                institution_id: student.institution_id,
                sender_role: "STUDENT",
                sender_name: profile?.full_name || student.full_name,
                body: body.trim(),
            },
            { onSuccess: () => setBody("") }
        );
    };

    return (
        <Box>
            <Typography variant="h5" fontWeight={800} color="#1E293B" mb={3}>Messages</Typography>

            <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #E2E8F0", display: "flex", flexDirection: "column", height: 520 }}>
                <Box sx={{ flexGrow: 1, overflowY: "auto", p: 3 }}>
                    {isLoading ? (
                        <Box sx={{ py: 6, textAlign: "center" }}><CircularProgress size={20} /></Box>
                    ) : messages.length === 0 ? (
                        <Typography color="text.secondary">No messages yet — say hello to your institution.</Typography>
                    ) : (
                        <Stack spacing={2}>
                            {messages.map((m) => {
                                const isMine = m.sender_role === "STUDENT";
                                return (
                                    <Stack key={m.id} direction="row" spacing={1.5} justifyContent={isMine ? "flex-end" : "flex-start"}>
                                        {!isMine && <Avatar sx={{ width: 32, height: 32, fontSize: 13, bgcolor: "primary.main" }}>{m.sender_name[0]}</Avatar>}
                                        <Box
                                            sx={{
                                                maxWidth: "70%",
                                                bgcolor: isMine ? "primary.main" : "#F1F5F9",
                                                color: isMine ? "white" : "#1E293B",
                                                px: 2,
                                                py: 1.25,
                                                borderRadius: 3,
                                                borderTopRightRadius: isMine ? 4 : 12,
                                                borderTopLeftRadius: isMine ? 12 : 4,
                                            }}
                                        >
                                            {!isMine && <Typography variant="caption" fontWeight={700} display="block">{m.sender_name}</Typography>}
                                            <Typography variant="body2">{m.body}</Typography>
                                            <Typography variant="caption" sx={{ opacity: 0.7, display: "block", mt: 0.5 }}>
                                                {new Date(m.created_at).toLocaleString()}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                );
                            })}
                        </Stack>
                    )}
                </Box>
                <Stack direction="row" spacing={1.5} sx={{ p: 2, borderTop: "1px solid #E2E8F0" }}>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Write a message to your institution..."
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}
                    />
                    <Button variant="contained" endIcon={<SendIcon />} disabled={!body.trim() || isPending} onClick={handleSend} sx={{ borderRadius: 2.5, fontWeight: 700, px: 3 }}>
                        Send
                    </Button>
                </Stack>
            </Paper>
        </Box>
    );
}
