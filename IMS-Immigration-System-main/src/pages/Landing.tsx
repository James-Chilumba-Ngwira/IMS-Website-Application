// src/pages/Landing.tsx
import {
    Box,
    Button,
    Chip,
    Container,
    Grid,
    Paper,
    Stack,
    Typography,
    Divider,
} from "@mui/material";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import QrCode2OutlinedIcon from "@mui/icons-material/QrCode2Outlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import { Link as RouterLink } from "react-router-dom";

function FeatureCard({
    icon,
    title,
    desc,
}: {
    icon: React.ReactNode;
    title: string;
    desc: string;
}) {
    return (
        <Paper
            elevation={0}
            sx={{
                p: 4,
                height: "100%",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 12px 24px rgba(0,0,0,0.1)",
                    borderColor: "primary.main",
                },
            }}
        >
            <Stack spacing={2}>
                <Box
                    sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "primary.50",
                        color: "primary.main",
                    }}
                >
                    {icon}
                </Box>

                <Typography variant="h6" fontWeight={700}>
                    {title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {desc}
                </Typography>
            </Stack>
        </Paper>
    );
}

export default function Landing() {
    return (
        <Box
            sx={{
                minHeight: "100vh",
                bgcolor: "#f8fafc",
            }}
        >
            {/* Header */}
            <Box
                component="header"
                sx={{
                    bgcolor: "white",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    py: 2,
                }}
            >
                <Container maxWidth="lg">
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <Typography
                            variant="h6"
                            fontWeight={700}
                            sx={{
                                color: "primary.main",
                                letterSpacing: "-0.5px"
                            }}
                        >
                            IMS-IS Platform
                        </Typography>

                        <Stack direction="row" spacing={2}>
                            <Button
                                component={RouterLink}
                                to="/login"
                                variant="outlined"
                                sx={{
                                    textTransform: "none",
                                    fontWeight: 600,
                                    px: 3
                                }}
                            >
                                Login
                            </Button>
                            <Button
                                component={RouterLink}
                                to="/register"
                                variant="contained"
                                sx={{
                                    textTransform: "none",
                                    fontWeight: 600,
                                    px: 3
                                }}
                            >
                                Register / Sign Up
                            </Button>
                        </Stack>
                    </Stack>
                </Container>
            </Box>

            {/* Hero Section */}
            <Box sx={{ bgcolor: "white", py: { xs: 6, md: 10 } }}>
                <Container maxWidth="lg">
                    <Grid container spacing={6} alignItems="center">
                        <Grid size={{ xs: 12, md: 7 }}>
                            <Typography
                                component="h1"
                                sx={{
                                    fontSize: { xs: "2.25rem", md: "3rem" },
                                    fontWeight: 800,
                                    lineHeight: 1.2,
                                    mb: 3,
                                    color: "text.primary",
                                    letterSpacing: "-1px"
                                }}
                            >
                                Immigration Management System for International Students
                            </Typography>

                            <Typography
                                variant="h6"
                                sx={{
                                    mb: 4,
                                    lineHeight: 1.7,
                                    color: "text.secondary",
                                    fontWeight: 400,
                                    fontSize: "1.125rem"
                                }}
                            >
                                A centralized digital platform for immigration authorities and educational
                                institutions to manage student registration, visa lifecycle, attendance
                                monitoring, and secure QR-based identity verification.
                            </Typography>

                            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 4 }}>
                                <Button
                                    component={RouterLink}
                                    to="/dashboard"
                                    size="large"
                                    variant="contained"
                                    sx={{
                                        textTransform: "none",
                                        fontWeight: 600,
                                        px: 4,
                                        py: 1.5,
                                        fontSize: "1rem"
                                    }}
                                >
                                    Access System
                                </Button>
                                <Button
                                    component={RouterLink}
                                    to="/register"
                                    size="large"
                                    variant="outlined"
                                    sx={{
                                        textTransform: "none",
                                        fontWeight: 600,
                                        px: 4,
                                        py: 1.5,
                                        fontSize: "1rem"
                                    }}
                                >
                                    Institution Registration
                                </Button>
                            </Stack>

                            <Stack
                                direction="row"
                                spacing={1}
                                sx={{ flexWrap: "wrap", gap: 1 }}
                            >
                                <Chip
                                    icon={<ApartmentOutlinedIcon fontSize="small" />}
                                    label="Immigration Authority"
                                    variant="outlined"
                                    sx={{ fontWeight: 500 }}
                                />
                                <Chip
                                    icon={<SchoolOutlinedIcon fontSize="small" />}
                                    label="Universities & Schools"
                                    variant="outlined"
                                    sx={{ fontWeight: 500 }}
                                />
                                <Chip
                                    icon={<VerifiedUserOutlinedIcon fontSize="small" />}
                                    label="Authorized Verification Bodies"
                                    variant="outlined"
                                    sx={{ fontWeight: 500 }}
                                />
                            </Stack>
                        </Grid>

                        <Grid size={{ xs: 12, md: 5 }}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 4,
                                    borderRadius: 2,
                                    border: "1px solid",
                                    borderColor: "divider",
                                    bgcolor: "#f8fafc",
                                }}
                            >
                                <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                                    System Capabilities
                                </Typography>
                                <Divider sx={{ mb: 3 }} />
                                <Stack spacing={2.5}>
                                    {[
                                        "Digital Student Identity Issuance",
                                        "Visa Status Monitoring & Renewal Tracking",
                                        "Attendance and Institutional Compliance Monitoring",
                                        "Secure QR-Based Legitimacy Verification",
                                        "Tamper-Evident Records with Blockchain Hashing"
                                    ].map((capability, idx) => (
                                        <Box key={idx} sx={{ display: "flex", alignItems: "flex-start" }}>
                                            <Box
                                                sx={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: "50%",
                                                    bgcolor: "primary.main",
                                                    mt: 0.75,
                                                    mr: 2,
                                                    flexShrink: 0,
                                                }}
                                            />
                                            <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                                                {capability}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Stack>
                            </Paper>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Features Section */}
            <Box sx={{ py: { xs: 6, md: 10 } }}>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: "center", mb: 6 }}>
                        <Typography
                            variant="h3"
                            fontWeight={800}
                            sx={{
                                mb: 2,
                                letterSpacing: "-0.5px"
                            }}
                        >
                            Core System Features
                        </Typography>
                        <Typography
                            variant="h6"
                            color="text.secondary"
                            sx={{ fontWeight: 400 }}
                        >
                            Built with security, transparency, and efficiency at its core
                        </Typography>
                    </Box>

                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <FeatureCard
                                icon={<QrCode2OutlinedIcon sx={{ fontSize: 32 }} />}
                                title="QR Code Verification"
                                desc="Instant identity validation through secure QR scanning with minimal data exposure."
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <FeatureCard
                                icon={<SecurityOutlinedIcon sx={{ fontSize: 32 }} />}
                                title="Blockchain Integrity Layer"
                                desc="Immutable hash records ensuring tamper-proof digital identity and visa data."
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <FeatureCard
                                icon={<InsightsOutlinedIcon sx={{ fontSize: 32 }} />}
                                title="Smart Analytics Module"
                                desc="Machine learning–driven insights for visa expiry prediction and compliance risk detection."
                            />
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Footer */}
            <Box
                component="footer"
                sx={{
                    bgcolor: "white",
                    borderTop: "1px solid",
                    borderColor: "divider",
                    py: 4,
                }}
            >
                <Container maxWidth="lg">
                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        justifyContent="space-between"
                        alignItems="center"
                        spacing={2}
                    >
                        <Typography variant="body2" color="text.secondary">
                            Immigration Management System for International Students (IMS-IS)
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Secure • Transparent • Scalable Digital Identity Infrastructure
                        </Typography>
                    </Stack>
                </Container>
            </Box>
        </Box>
    );
}