import { Box, Typography, Grid, Button, Tabs, Tab, Stack, CircularProgress } from "@mui/material";
import { GetApp as ReportIcon } from "@mui/icons-material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { StatsCard } from "./StatsCard";
import { ComplianceTable } from "./ComplianceTable";
import { CriticalAlerts } from "./CriticalAlerts";
import { useGlobalKPIs } from "../../../hooks/useAnalytics";

export function OverviewTab() {
    const [locationTab, setLocationTab] = useState(0);
    const navigate = useNavigate();
    const { data: kpis, isLoading, error } = useGlobalKPIs();

    const handleLocationChange = (_event: React.SyntheticEvent, newValue: number) => {
        setLocationTab(newValue);
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" py={10}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Typography color="error">Error loading dashboard metrics. Please try again later.</Typography>;
    }

    return (
        <Box>
            {/* Header Area */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={4}>
                <Box>
                    <Typography variant="h3" fontWeight={900} color="text.primary" gutterBottom>
                        Immigration Officer Dashboard
                    </Typography>
                    <Typography variant="body1" color="text.secondary" fontWeight={500}>
                        Monitor student visa compliance and risk signals nationwide.
                    </Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        onClick={() => navigate("/students")}
                        sx={{
                            borderRadius: '12px',
                            textTransform: 'none',
                            px: 3,
                            py: 1.5,
                            fontWeight: 700,
                        }}
                    >
                        View Students
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<ReportIcon />}
                        sx={{
                            borderRadius: '12px',
                            textTransform: 'none',
                            px: 3,
                            py: 1.5,
                            fontWeight: 700,
                            boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)'
                        }}
                    >
                        Generate Report
                    </Button>
                </Stack>
            </Stack>

            {/* Location Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
                <Tabs value={locationTab} onChange={handleLocationChange} sx={{
                    '& .MuiTab-root': {
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '1rem',
                        minWidth: 100,
                        color: 'text.secondary',
                        '&.Mui-selected': {
                            color: 'primary.main'
                        }
                    },
                    '& .MuiTabs-indicator': {
                        height: 3,
                        borderRadius: '3px 3px 0 0'
                    }
                }}>
                    <Tab label="National" />
                    <Tab label="Almaty" disabled />
                    <Tab label="Astana" disabled />
                </Tabs>
            </Box>

            {/* KPI Cards */}
            <Grid container spacing={3} mb={4}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatsCard
                        label="Total Students"
                        value={kpis?.total_students.toLocaleString() || "0"}
                        trend="Overall system"
                        trendValue={0}
                        trendType="positive"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatsCard
                        label="Active Visas"
                        value={kpis?.active_visas.toLocaleString() || "0"}
                        trend="Current active"
                        trendValue={0}
                        trendType="positive"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatsCard
                        label="Overdue Notices"
                        value={kpis?.overdue_notifications.toLocaleString() || "0"}
                        trend="Requires attention"
                        trendValue={0}
                        trendType="negative"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatsCard
                        label="High-Risk Alerts"
                        value={kpis?.high_risk_alerts.toLocaleString() || "0"}
                        trend="Critical status"
                        trendValue={0}
                        trendType="negative"
                    />
                </Grid>
            </Grid>

            {/* Compliance and Alerts Section */}
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, lg: 8 }}>
                    <ComplianceTable />
                </Grid>
                <Grid size={{ xs: 12, lg: 4 }}>
                    <CriticalAlerts />
                </Grid>
            </Grid>
        </Box>
    );
}
