import { Box, Typography, Grid, Paper, CircularProgress } from "@mui/material";
import { useAnalyticsSummary, useStudentsByNationality } from "../../../hooks/useAnalytics";

export function AnalyticsTab() {
    const { data: summary, isLoading: isLoadingSummary } = useAnalyticsSummary();
    const { data: nationalityStats, isLoading: isLoadingStats } = useStudentsByNationality();

    if (isLoadingSummary || isLoadingStats) {
        return <CircularProgress />;
    }

    return (
        <Box>
            <Typography variant="h6" mb={2}>System Analytics</Typography>

            <Grid container spacing={3} mb={4}>
                <Grid size={{ xs: 12, md: 3 }}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">{summary?.total_students || 0}</Typography>
                        <Typography variant="body2" color="text.secondary">Total Students</Typography>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="success.main">{summary?.active_visas || 0}</Typography>
                        <Typography variant="body2" color="text.secondary">Active Visas</Typography>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="error.main">{summary?.expired_visas || 0}</Typography>
                        <Typography variant="body2" color="text.secondary">Expired Visas</Typography>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="info.main">{summary?.total_institutions || 0}</Typography>
                        <Typography variant="body2" color="text.secondary">Institutions</Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* Placeholder for charts */}
            <Typography variant="subtitle1" gutterBottom>Student Demographics</Typography>
            <Paper sx={{ p: 3 }}>
                {nationalityStats?.map((stat: any) => (
                    <Box key={stat.name} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, borderBottom: '1px solid #eee' }}>
                        <Typography>{stat.name}</Typography>
                        <Typography fontWeight="bold">{stat.value}</Typography>
                    </Box>
                ))}
            </Paper>
        </Box>
    );
}
