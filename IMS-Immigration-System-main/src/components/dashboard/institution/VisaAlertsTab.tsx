import { Box, Typography, Chip } from "@mui/material";
import { useExpiringVisas } from "../../../hooks/useVisas";
import { DataTable } from "../../DataTable";
import type { Visa } from "../../../types/database.types";

export function VisaAlertsTab() {
    const { data: visas = [], isLoading } = useExpiringVisas(90); // 90 days alert

    const columns = [
        {
            id: "student",
            label: "Student",
            render: (row: Visa) => (row as any).student?.full_name || "Unknown"
        },
        {
            id: "visa_number",
            label: "Visa #",
        },
        {
            id: "end_date",
            label: "Expiring On",
            render: (row: Visa) => {
                const date = new Date(row.end_date);
                const today = new Date();
                const diffTime = Math.abs(date.getTime() - today.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return (
                    <Box component="span">
                        {row.end_date}
                        <Typography component="span" variant="caption" color="error" sx={{ ml: 1, fontWeight: 'bold' }}>
                            ({diffDays} days left)
                        </Typography>
                    </Box>
                )
            }
        },
        {
            id: "status",
            label: "Status",
            render: (row: Visa) => <Chip label={row.status} size="small" color="warning" />
        },
    ];

    return (
        <Box>
            <Typography variant="h6" mb={2} color="warning.main">Visas Expiring Soon (Next 90 Days)</Typography>
            <DataTable
                columns={columns}
                data={visas}
                isLoading={isLoading}
                searchPlaceholder="Search alerts..."
            />
        </Box>
    );
}
