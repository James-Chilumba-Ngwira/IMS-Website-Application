import { useMemo, useState } from "react";
import { Box, Paper, Typography, Stack, TextField, Button, CircularProgress, List, ListItemButton, ListItemText, Badge, Divider } from "@mui/material";
import { Send as SendIcon } from "@mui/icons-material";
import { useAuth } from "../../../auth/AuthProvider";
import { useInstitutionMessages, useMessages, useSendMessage } from "../../../hooks/useMessages";

export function InstitutionMessagesTab() {
    const { profile } = useAuth();
    const { data: allMessages = [], isLoading } = useInstitutionMessages(profile?.institution_id || undefined);
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

    const conversations = useMemo(() => {
        const byStudent = new Map<string, { studentId: string; studentName: string; lastMessage: string; lastAt: string; unread: number }>();
        for (const m of allMessages) {
            const existing = byStudent.get(m.student_id);
            const unreadIncrement = m.sender_role === "STUDENT" && !m.read ? 1 : 0;
            if (!existing) {
                byStudent.set(m.student_id, {
                    studentId: m.student_id,
                    studentName: m.student?.full_name || "Unknown Student",
                    lastMessage: m.body,
                    lastAt: m.created_at,
                    unread: unreadIncrement,
                });
            } else {
                existing.unread += unreadIncrement;
                if (new Date(m.created_at) > new Date(existing.lastAt)) {
                    existing.lastMessage = m.body;
                    existing.lastAt = m.created_at;
                }
            }
        }
        return Array.from(byStudent.values()).sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime());
    }, [allMessages]);

    const activeStudentId = selectedStudentId || conversations[0]?.studentId || null;
    const { data: thread = [], isLoading: threadLoading } = useMessages(activeStudentId || undefined);
    const { mutate: sendMessage, isPending } = useSendMessage();
    const [body, setBody] = useState("");

    const activeConversation = conversations.find((c) => c.studentId === activeStudentId);

    const handleSend = () => {
        if (!activeStudentId || !profile?.institution_id || !body.trim()) return;
        sendMessage(
            {
                student_id: activeStudentId,
                institution_id: profile.institution_id,
                sender_role: "INSTITUTION",
                sender_name: profile.full_name || "Institution",
                body: body.trim(),
            },
            { onSuccess: () => setBody("") }
        );
    };

    if (isLoading) {
        return <Box sx={{ py: 10, textAlign: "center" }}><CircularProgress /></Box>;
    }

    return (
        <Box>
            <Typography variant="h6" mb={2}>Student Messages</Typography>
            <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #E2E8F0", display: "flex", height: 560, overflow: "hidden" }}>
                <Box sx={{ width: 280, borderRight: "1px solid #E2E8F0", overflowY: "auto" }}>
                    {conversations.length === 0 ? (
                        <Typography color="text.secondary" sx={{ p: 2 }}>No conversations yet.</Typography>
                    ) : (
                        <List disablePadding>
                            {conversations.map((c) => (
                                <ListItemButton
                                    key={c.studentId}
                                    selected={c.studentId === activeStudentId}
                                    onClick={() => setSelectedStudentId(c.studentId)}
                                >
                                    <ListItemText
                                        primary={
                                            <Badge color="error" variant="dot" invisible={c.unread === 0} sx={{ "& .MuiBadge-badge": { right: -8 } }}>
                                                {c.studentName}
                                            </Badge>
                                        }
                                        secondary={c.lastMessage}
                                        secondaryTypographyProps={{ noWrap: true }}
                                    />
                                </ListItemButton>
                            ))}
                        </List>
                    )}
                </Box>

                <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                    {!activeStudentId ? (
                        <Box sx={{ m: "auto", color: "text.secondary" }}>Select a conversation</Box>
                    ) : (
                        <>
                            <Box sx={{ p: 2, borderBottom: "1px solid #E2E8F0" }}>
                                <Typography fontWeight={700}>{activeConversation?.studentName}</Typography>
                            </Box>
                            <Box sx={{ flexGrow: 1, overflowY: "auto", p: 3 }}>
                                {threadLoading ? (
                                    <CircularProgress size={20} />
                                ) : (
                                    <Stack spacing={2}>
                                        {thread.map((m) => {
                                            const isMine = m.sender_role === "INSTITUTION";
                                            return (
                                                <Stack key={m.id} direction="row" justifyContent={isMine ? "flex-end" : "flex-start"}>
                                                    <Box
                                                        sx={{
                                                            maxWidth: "70%",
                                                            bgcolor: isMine ? "primary.main" : "#F1F5F9",
                                                            color: isMine ? "white" : "#1E293B",
                                                            px: 2,
                                                            py: 1.25,
                                                            borderRadius: 3,
                                                        }}
                                                    >
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
                            <Divider />
                            <Stack direction="row" spacing={1.5} sx={{ p: 2 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Reply to student..."
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}
                                />
                                <Button variant="contained" endIcon={<SendIcon />} disabled={!body.trim() || isPending} onClick={handleSend} sx={{ borderRadius: 2.5, fontWeight: 700, px: 3 }}>
                                    Send
                                </Button>
                            </Stack>
                        </>
                    )}
                </Box>
            </Paper>
        </Box>
    );
}
