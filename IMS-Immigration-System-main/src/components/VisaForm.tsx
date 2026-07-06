import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    TextField,
    Grid,
    MenuItem,
    Box,
    Typography,
    Paper,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { VisaSchema } from "../types/database.types";

type VisaData = z.infer<typeof VisaSchema>;

interface VisaFormProps {
    onSubmit: (data: Partial<VisaData>) => void;
    isLoading?: boolean;
    defaultValues?: Partial<VisaData>;
    isEditMode?: boolean;
}

export function VisaForm({ onSubmit, isLoading = false, defaultValues, isEditMode = false }: VisaFormProps) {
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<VisaData>({
        resolver: zodResolver(VisaSchema),
        defaultValues: {
            visa_type: defaultValues?.visa_type ?? "C9",
            status: defaultValues?.status ?? "ACTIVE",
            visa_number: defaultValues?.visa_number ?? null,
            start_date: defaultValues?.start_date ?? new Date().toISOString().split('T')[0],
            end_date: defaultValues?.end_date ?? new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        },
    });

    return (
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                <Typography variant="h6" gutterBottom color="primary">
                    {isEditMode ? "Update Visa Details" : "New Visa Details"}
                </Typography>
                <Grid container spacing={2} mb={4}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Controller
                            name="visa_type"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    select
                                    label="Visa Type"
                                    fullWidth
                                    error={!!errors.visa_type}
                                    helperText={errors.visa_type?.message}
                                >
                                    <MenuItem value="C9">C9 (Student)</MenuItem>
                                    <MenuItem value="C3">C3 (Work)</MenuItem>
                                </TextField>
                            )}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Controller
                            name="visa_number"
                            control={control}
                            render={({ field: { value, onChange, ...field } }) => (
                                <TextField
                                    {...field}
                                    value={value || ""}
                                    onChange={(e) => onChange(e.target.value || null)}
                                    label="Visa Number"
                                    fullWidth
                                    error={!!errors.visa_number}
                                    helperText={errors.visa_number?.message}
                                />
                            )}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Controller
                            name="start_date"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Start Date"
                                    type="date"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    error={!!errors.start_date}
                                    helperText={errors.start_date?.message}
                                />
                            )}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Controller
                            name="end_date"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="End Date"
                                    type="date"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    error={!!errors.end_date}
                                    helperText={errors.end_date?.message}
                                />
                            )}
                        />
                    </Grid>

                    {isEditMode && (
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Controller
                                name="status"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        select
                                        label="Visa Status"
                                        fullWidth
                                        error={!!errors.status}
                                        helperText={errors.status?.message}
                                        defaultValue="ACTIVE"
                                    >
                                        <MenuItem value="ACTIVE">Active</MenuItem>
                                        <MenuItem value="EXPIRED">Expired</MenuItem>
                                        <MenuItem value="CANCELLED">Cancelled</MenuItem>
                                        <MenuItem value="PENDING_RENEWAL">Pending Renewal</MenuItem>
                                    </TextField>
                                )}
                            />
                        </Grid>
                    )}
                </Grid>

                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                    <LoadingButton
                        type="submit"
                        variant="contained"
                        loading={isLoading}
                        size="large"
                    >
                        {isEditMode ? "Update Visa" : "Create Visa"}
                    </LoadingButton>
                </Box>
            </Box>
        </Paper>
    );
}
