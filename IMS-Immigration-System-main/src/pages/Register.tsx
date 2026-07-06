// src/pages/Register.tsx
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
    MenuItem,
} from "@mui/material";
import {
    Visibility,
    VisibilityOff,
    ArrowBack,
    PersonAddOutlined,
} from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../auth/AuthProvider";

const registerSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    fullName: z.string().min(2, "Full name is required"),
    role: z.enum(["IMMIGRATION", "INSTITUTION"]),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
    const navigate = useNavigate();
    const { signUp } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            role: "INSTITUTION",
        },
    });

    const onSubmit = async (data: RegisterForm) => {
        setIsLoading(true);
        setAuthError(null);

        try {
            await signUp(data.email, data.password, {
                full_name: data.fullName,
                role: data.role
            });
            navigate("/onboarding");
        } catch (error: any) {
            setAuthError(error.message || "Failed to create account. Please try again.");
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
                            <PersonAddOutlined sx={{ fontSize: 32, color: "primary.main" }} />
                        </Box>
                        <Typography variant="h4" fontWeight={800} gutterBottom>
                            Create Account
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Register your institution or immigration authority
                        </Typography>
                    </Box>

                    {/* Error Alert */}
                    {authError && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {authError}
                        </Alert>
                    )}

                    {/* Register Form */}
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Stack spacing={3}>
                            <TextField
                                {...register("fullName")}
                                label="Full Name"
                                fullWidth
                                error={!!errors.fullName}
                                helperText={errors.fullName?.message}
                                placeholder="John Doe"
                                InputProps={{
                                    sx: { borderRadius: 2 },
                                }}
                            />

                            <TextField
                                {...register("email")}
                                label="Email Address"
                                type="email"
                                fullWidth
                                autoComplete="email"
                                error={!!errors.email}
                                helperText={errors.email?.message}
                                placeholder="admin@institution.edu.kz"
                                InputProps={{
                                    sx: { borderRadius: 2 },
                                }}
                            />

                            <Controller
                                name="role"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Account Type"
                                        select
                                        fullWidth
                                        error={!!errors.role}
                                        helperText={errors.role?.message}
                                        InputProps={{
                                            sx: { borderRadius: 2 },
                                        }}
                                    >
                                        <MenuItem value="INSTITUTION">Educational Institution</MenuItem>
                                        <MenuItem value="IMMIGRATION">Immigration Authority</MenuItem>
                                    </TextField>
                                )}
                            />

                            <TextField
                                {...register("password")}
                                label="Password"
                                type={showPassword ? "text" : "password"}
                                fullWidth
                                autoComplete="new-password"
                                error={!!errors.password}
                                helperText={errors.password?.message}
                                placeholder="Minimum 6 characters"
                                InputProps={{
                                    sx: { borderRadius: 2 },
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <TextField
                                {...register("confirmPassword")}
                                label="Confirm Password"
                                type={showConfirmPassword ? "text" : "password"}
                                fullWidth
                                autoComplete="new-password"
                                error={!!errors.confirmPassword}
                                helperText={errors.confirmPassword?.message}
                                placeholder="Re-enter your password"
                                InputProps={{
                                    sx: { borderRadius: 2 },
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                edge="end"
                                            >
                                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
                                {isLoading ? "Creating account..." : "Create Account"}
                            </Button>
                        </Stack>
                    </form>

                    {/* Footer Links */}
                    <Box sx={{ mt: 4, textAlign: "center" }}>
                        <Typography variant="body2" color="text.secondary">
                            Already have an account?{" "}
                            <Link
                                component={RouterLink}
                                to="/login"
                                sx={{
                                    color: "primary.main",
                                    textDecoration: "none",
                                    fontWeight: 600,
                                    "&:hover": {
                                        textDecoration: "underline",
                                    },
                                }}
                            >
                                Sign in
                            </Link>
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