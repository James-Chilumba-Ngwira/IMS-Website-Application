import { Container, Typography, Paper, Box, Stack, TextField, Avatar, Button, alpha, FormControl, InputLabel, Select, MenuItem, Grid } from "@mui/material";
import { useAuth } from "../auth/AuthProvider";
import { useState } from "react";
import { useSnackbar } from "notistack";
import {
    Person as PersonIcon,
    Email as EmailIcon,
    Shield as ShieldIcon
} from "@mui/icons-material";

export default function SettingsPage() {
    const { profile, user } = useAuth();
    const { enqueueSnackbar } = useSnackbar();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        fullName: profile?.full_name || "",
        role: profile?.role || "INSTITUTION",
        email: user?.email || "",
    });

    const handleSave = async () => {
        setIsLoading(true);
        // Mock API call delay
        await new Promise(r => setTimeout(r, 800));
        enqueueSnackbar("Profile updated successfully", { variant: "success" });
        setIsLoading(false);
    };

    return (
        <Container maxWidth="md" sx={{ py: 6 }}>
            <Box mb={5}>
                <Typography variant="h4" fontWeight={900} color="#1E293B" letterSpacing="-0.5px">
                    Profile Settings
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Manage your administrative identity and account preferences.
                </Typography>
            </Box>

            <Grid container spacing={4}>
                {/* Left: Identity Card */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper elevation={0} sx={{
                        p: 4,
                        borderRadius: 4,
                        border: '1px solid #E2E8F0',
                        textAlign: 'center',
                        bgcolor: 'white'
                    }}>
                        <Avatar
                            src={`https://ui-avatars.com/api/?name=${formData.fullName || 'User'}&background=random`}
                            sx={{ width: 100, height: 100, mx: 'auto', mb: 3, border: '6px solid #F8FAFC' }}
                        />
                        <Typography variant="h6" fontWeight={800}>{formData.fullName || "Admin"}</Typography>
                        <Typography variant="caption" color="primary" fontWeight={700} sx={{
                            bgcolor: alpha('#2563EB', 0.1),
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            mt: 1,
                            display: 'inline-block'
                        }}>
                            {formData.role}
                        </Typography>
                    </Paper>
                </Grid>

                {/* Right: Edit Form */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: 'white' }}>
                        <Stack spacing={4}>
                            <Box>
                                <Typography variant="subtitle2" fontWeight={800} color="#1E293B" mb={3} display="flex" alignItems="center" gap={1}>
                                    <PersonIcon fontSize="small" color="primary" /> Basic Information
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            fullWidth
                                            label="Full Name"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            variant="outlined"
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            fullWidth
                                            disabled
                                            label="Email Address"
                                            value={formData.email}
                                            variant="outlined"
                                            InputProps={{ startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.disabled', fontSize: 20 }} /> }}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: '#F8FAFC' } }}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>

                            <Box>
                                <Typography variant="subtitle2" fontWeight={800} color="#1E293B" mb={3} display="flex" alignItems="center" gap={1}>
                                    <ShieldIcon fontSize="small" color="primary" /> Role & Permissions
                                </Typography>
                                <FormControl fullWidth>
                                    <InputLabel id="role-label">Account Role</InputLabel>
                                    <Select
                                        labelId="role-label"
                                        value={formData.role}
                                        label="Account Role"
                                        disabled
                                        sx={{ borderRadius: 2.5, bgcolor: '#F8FAFC' }}
                                    >
                                        <MenuItem value="IMMIGRATION">Immigration Officer</MenuItem>
                                        <MenuItem value="INSTITUTION">University Admin</MenuItem>
                                        <MenuItem value="STUDENT">Student</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>

                            <Box sx={{ pt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                <Button variant="text" sx={{ fontWeight: 700, px: 3 }}>Cancel</Button>
                                <Button
                                    variant="contained"
                                    onClick={handleSave}
                                    disabled={isLoading}
                                    sx={{
                                        px: 4,
                                        py: 1.5,
                                        borderRadius: 2.5,
                                        fontWeight: 800,
                                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
                                    }}
                                >
                                    {isLoading ? "Saving..." : "Save Changes"}
                                </Button>
                            </Box>
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
}
