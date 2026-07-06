import { Box, Typography, Chip } from "@mui/material";
import { useVisas } from "../../../hooks/useVisas";
import { DataTable } from "../../DataTable";
import type { Visa } from "../../../types/database.types";

export function VisasTab() {
    const { data: visas = [], isLoading } = useVisas();

    const columns = [
        {
            id: "student",
            label: "Student",
            render: (row: Visa) => (row as any).student?.full_name || "Unknown"
        },
        { id: "visa_number", label: "Visa Number" },
        { id: "visa_type", label: "Type" },
        { id: "start_date", label: "Valid From" },
        { id: "end_date", label: "Valid Until" },
        {
            id: "status",
            label: "Status",
            render: (row: Visa) => (
                <Chip
                    label={row.status}
                    color={row.status === 'ACTIVE' ? 'success' : 'error'}
                    size="small"
                />
            )
        },
    ];

    return (
        <Box>
            <Typography variant="h6" mb={2}>Visa Registry</Typography>
            <DataTable
                columns={columns}
                data={visas}
                isLoading={isLoading}
                searchPlaceholder="Search visas..."
            />
        </Box>
    );
}
