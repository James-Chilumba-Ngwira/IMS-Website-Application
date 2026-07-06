import { Box, Button, Typography, Stack } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { useInstitutions } from "../../../hooks/useInstitutions";
import { DataTable } from "../../DataTable";
import type { Institution } from "../../../types/database.types";
import { useNavigate } from "react-router-dom";

export function InstitutionsTab() {
    const { data: institutions = [], isLoading } = useInstitutions();
    const navigate = useNavigate();

    const columns = [
        { id: "name", label: "Institution Name" },
        { id: "institution_type", label: "Type" },
        { id: "license_number", label: "License #" },
        { id: "contact_email", label: "Email" },
        { id: "created_at", label: "Registered On", render: (row: Institution) => new Date(row.created_at).toLocaleDateString() },
    ];

    const handleRowClick = (institutionId: string) => {
        navigate(`/dashboard?tab=students&institutionId=${institutionId}`);
    };

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Registered Institutions</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => console.log('Add institution placeholder')}
                >
                    Add Institution
                </Button>
            </Stack>

            <DataTable
                columns={columns}
                data={institutions}
                isLoading={isLoading}
                searchPlaceholder="Search institutions..."
                onRowClick={(row) => handleRowClick(row.id)}
            />
            {/* TODO: Add Institution Dialog */}
        </Box>
    );
}
