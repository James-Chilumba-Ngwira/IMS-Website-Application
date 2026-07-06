import { Box, Typography, Chip } from "@mui/material";
import { useVerificationLogs } from "../../../hooks/useVerification";
import { DataTable } from "../../DataTable";
import type { VerificationRequest } from "../../../types/database.types";

export function VerificationTab() {
    const { data: logs = [], isLoading } = useVerificationLogs();

    const columns = [
        {
            id: "student",
            label: "Student",
            render: (row: VerificationRequest) => (row as any).student?.full_name || "Unknown"
        },
        {
            id: "student_id",
            label: "ID Number",
            render: (row: VerificationRequest) => (row as any).student?.student_id_number || "N/A"
        },
        { id: "verification_type", label: "Type" },
        {
            id: "result",
            label: "Status",
            render: (row: any) => {
                const result = row.result;
                const status = typeof result === 'string' ? result : (result?.status || "UNKNOWN");

                const isSuccess = status === 'VALID' || status === 'VERIFIED';
                const isError = status === 'INVALID' || status === 'REJECTED';

                return (
                    <Chip
                        label={status}
                        color={isSuccess ? 'success' : (isError ? 'error' : 'warning')}
                        size="small"
                        sx={{ fontWeight: 700 }}
                    />
                );
            }
        },
        {
            id: "created_at",
            label: "Verified At",
            render: (row: VerificationRequest) => new Date(row.created_at).toLocaleString()
        },
    ];

    return (
        <Box>
            <Typography variant="h6" mb={2}>Verification Request Log</Typography>
            <DataTable
                columns={columns}
                data={logs}
                isLoading={isLoading}
                searchPlaceholder="Search logs..."
            />
        </Box>
    );
}
