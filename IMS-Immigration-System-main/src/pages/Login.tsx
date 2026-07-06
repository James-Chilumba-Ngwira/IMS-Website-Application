// src/pages/Login.tsx
import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
    Box,
    Button,
    Container,
    TextField,
    Typography,
    Paper,
    Stack,
    Alert,
    InputAdornment,
    IconButton,
    Link,
} from "@mui/material";
import {
    Visibility,
    VisibilityOff,
    ArrowBack,
    LoginOutlined,
} from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../auth/AuthProvider";

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
    const navigate = useNavigate();
    const { signIn } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginForm) => {
        setIsLoading(true);
        setAuthError(null);

        try {
            await signIn(data.email, data.password);
            navigate("/dashboard");
        } catch (error: any) {
            setAuthError(error.message || "Failed to sign in. Please check your credentials.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "#f8fafc",
                py: 4,
            }}
        >
            <Container maxWidth="sm">
                {/* Back to Home Button */}
                <Button
                    component={RouterLink}
                    to="/"
                    startIcon={<ArrowBack />}
                    sx={{
                        mb: 3,
                        color: "text.secondary",
                        textTransform: "none",
                        fontWeight: 600,
                        "&:hover": {
                            color: "primary.main",
                        },
                    }}
                >
                    Back to Home
                </Button>

                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 3, sm: 5 },
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                    }}
                >
                    {/* Header */}
                    <Box sx={{ textAlign: "center", mb: 4 }}>
                        <Box
                            sx={{
                                width: 64,
                                height: 64,
                                borderRadius: 2,
                                bgcolor: "primary.50",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                mx: "auto",
                                mb: 2,
                            }}
                        >
                            <LoginOutlined sx={{ fontSize: 32, color: "primary.main" }} />
                        </Box>
                        <Typography variant="h4" fontWeight={800} gutterBottom>
                            Welcome Back
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Sign in to access your IMS-IS account
                        </Typography>
                    </Box>

                    {/* Error Alert */}
                    {authError && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {authError}
                        </Alert>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Stack spacing={3}>
                            <TextField
                                {...register("email")}
                                label="Email Address"
                                type="email"
                                fullWidth
                                autoComplete="email"
                                error={!!errors.email}
                                helperText={errors.email?.message}
                                placeholder="admin@nu.edu.kz"
                                InputProps={{
                                    sx: { borderRadius: 2 },
                                }}
                            />

                            <TextField
                                {...register("password")}
                                label="Password"
                                type={showPassword ? "text" : "password"}
                                fullWidth
                                autoComplete="current-password"
                                error={!!errors.password}
                                helperText={errors.password?.message}
                                placeholder="Enter your password"
                                InputProps={{
                                    sx: { borderRadius: 2 },
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                                aria-label="toggle password visibility"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                fullWidth
                                disabled={isLoading}
                                sx={{
                                    py: 1.5,
                                    textTransform: "none",
                                    fontWeight: 600,
                                    fontSize: "1rem",
                                    borderRadius: 2,
                                }}
                            >
                                {isLoading ? "Signing in..." : "Sign In"}
                            </Button>
                        </Stack>
                    </form>

                    {/* Footer Links */}
                    <Box sx={{ mt: 4, textAlign: "center" }}>
                        <Typography variant="body2" color="text.secondary">
                            Don't have an account?{" "}
                            <Link
                                component={RouterLink}
                                to="/register"
                                sx={{
                                    color: "primary.main",
                                    textDecoration: "none",
                                    fontWeight: 600,
                                    "&:hover": {
                                        textDecoration: "underline",
                                    },
                                }}
                            >
                                Sign up
                            </Link>
                        </Typography>
                    </Box>

                    {/* Demo Credentials */}
                    <Box
                        sx={{
                            mt: 4,
                            p: 2,
                            bgcolor: "grey.50",
                            borderRadius: 2,
                            border: "1px solid",
                            borderColor: "divider",
                        }}
                    >
                        <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" gutterBottom>
                            Demo Credentials
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                            Immigration: immigration@test.kz / password123
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                            Institution: admin@nu.edu.kz / password123
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                            Student: chinedu.okafor@student.kz / password123
                        </Typography>
                    </Box>
                </Paper>

                {/* Platform Name */}
                <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                    sx={{ mt: 3 }}
                >
                    IMS-IS Platform © 2026
                </Typography>
            </Container>
        </Box>
    );
}