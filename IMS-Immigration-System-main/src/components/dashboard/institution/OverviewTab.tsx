import {
    Grid,
    Paper,
    Box,
    Typography,
    Stack,
    LinearProgress,
    Checkbox,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    CircularProgress,
    Button,
    alpha
} from '@mui/material';
import {
    Warning as WarningIcon,
    Error as ErrorIcon,
    CheckCircle as CheckCircleIcon,
    People as StudentsIcon
} from '@mui/icons-material';
import { useNavigate } from "react-router-dom";
import { useInstitutionMetrics, useStudentsByNationality, useStudentsByProgram } from '../../../hooks/useAnalytics';

interface StatCardProps {
    label: string;
    value: string | number;
    color?: string;
    loading?: boolean;
}

function StatCard({ label, value, color = 'primary.main', loading }: StatCardProps) {
    return (
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', height: '100%', position: 'relative' }}>
            {loading && <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0, borderTopLeftRadius: 12, borderTopRightRadius: 12 }} />}
            <Typography variant="body2" color="text.secondary" fontWeight={500}>{label}</Typography>
            <Typography variant="h3" fontWeight={800} sx={{ mt: 1, color: color }}>
                {loading ? '...' : value}
            </Typography>
        </Paper>
    );
}

interface OverviewTabProps {
    institutionId?: string;
}

export function OverviewTab({ institutionId }: OverviewTabProps) {
    const navigate = useNavigate();
    const { data: metrics, isLoading: metricsLoading } = useInstitutionMetrics(institutionId);
    const { data: nationalityData, isLoading: nationalityLoading } = useStudentsByNationality(institutionId);
    const { data: programData, isLoading: programLoading } = useStudentsByProgram(institutionId);

    return (
        <Box>
            {/* Header Area */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h5" fontWeight={800} color="#1E293B">Campus Overview</Typography>
                <Button
                    variant="outlined"
                    startIcon={<StudentsIcon />}
                    onClick={() => navigate("/students")}
                    sx={{
                        borderRadius: '12px',
                        textTransform: 'none',
                        px: 3,
                        py: 1,
                        fontWeight: 700,
                    }}
                >
                    View Registry
                </Button>
            </Stack>

            {/* KPI Cards */}
            <Grid container spacing={3} mb={4}>
                <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                    <StatCard label="Total Intl Students" value={metrics?.total_students || 0} loading={metricsLoading} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                    <StatCard label="Visas < 60 Days" value={metrics?.visas_expiring_60 || 0} color="warning.main" loading={metricsLoading} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                    <StatCard label="Visas < 30 Days" value={metrics?.visas_expiring_30 || 0} color="#F59E0B" loading={metricsLoading} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                    <StatCard label="Visas < 7 Days" value={metrics?.visas_expiring_7 || 0} color="error.main" loading={metricsLoading} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #EF4444', bgcolor: alpha('#EF4444', 0.05) }}>
                        <Typography variant="body2" color="#EF4444" fontWeight={500}>Overdue Notices</Typography>
                        <Typography variant="h3" fontWeight={800} sx={{ mt: 1, color: '#EF4444' }}>
                            {metricsLoading ? '...' : (metrics?.overdue_notices || 0)}
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                {/* Visualizations Column */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Grid container spacing={3}>
                        {/* Top 5 Nationalities */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', minHeight: 400 }}>
                                <Typography variant="subtitle1" fontWeight={700} mb={3}>Top 5 Nationalities</Typography>
                                <Stack spacing={2.5}>
                                    {nationalityLoading && <CircularProgress size={20} />}
                                    {nationalityData?.map((item) => (
                                        <Box key={item.name}>
                                            <Stack direction="row" justifyContent="space-between" mb={0.5}>
                                                <Typography variant="caption" fontWeight={600}>{item.name}</Typography>
                                                <Typography variant="caption" color="text.secondary">{item.value}</Typography>
                                            </Stack>
                                            <LinearProgress
                                                variant="determinate"
                                                value={metrics?.total_students ? (item.value / metrics.total_students) * 100 : 0}
                                                sx={{
                                                    height: 10,
                                                    borderRadius: 5,
                                                    bgcolor: '#F1F5F9',
                                                    '& .MuiLinearProgress-bar': { bgcolor: '#3B82F6' }
                                                }}
                                            />
                                        </Box>
                                    ))}
                                    {(!nationalityLoading && nationalityData?.length === 0) && (
                                        <Typography variant="body2" color="text.secondary">No student data available.</Typography>
                                    )}
                                </Stack>
                            </Paper>
                        </Grid>

                        {/* Students by Program */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', minHeight: 400, display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="subtitle1" fontWeight={700} mb={3}>Students by Program</Typography>
                                <Box sx={{ flexGrow: 1, display: 'grid', placeItems: 'center', position: 'relative' }}>
                                    {programLoading ? <CircularProgress /> : (
                                        <Box sx={{
                                            width: 180,
                                            height: 180,
                                            borderRadius: '50%',
                                            border: '15px solid #F1F5F9',
                                            borderTopColor: '#3B82F6',
                                            borderRightColor: '#60A5FA',
                                            display: 'grid',
                                            placeItems: 'center'
                                        }}>
                                            <Box textAlign="center">
                                                <Typography variant="h4" fontWeight={800}>{metrics?.total_students || 0}</Typography>
                                                <Typography variant="caption" color="text.secondary">Students</Typography>
                                            </Box>
                                        </Box>
                                    )}
                                    <Box mt={2}>
                                        {programData?.slice(0, 3).map((p, i) => (
                                            <Typography key={i} variant="caption" display="block" color="text.secondary">
                                                • {p.name}: {p.value}
                                            </Typography>
                                        ))}
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>

                        {/* Monthly Arrivals */}
                        <Grid size={{ xs: 12 }}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0' }}>
                                <Stack direction="row" justifyContent="space-between" mb={3}>
                                    <Typography variant="subtitle1" fontWeight={700}>Monthly Arrivals</Typography>
                                </Stack>
                                <Box sx={{ height: 200, bgcolor: alpha('#3B82F6', 0.05), borderRadius: 2, display: 'grid', placeItems: 'center' }}>
                                    <Typography color="text.secondary" variant="body2">Arrivals Trend Data (Live update pending seeding)</Typography>
                                </Box>
                                <Stack direction="row" spacing={4} justifyContent="center" mt={2}>
                                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map(m => (
                                        <Typography key={m} variant="caption" color="text.secondary">{m}</Typography>
                                    ))}
                                </Stack>
                            </Paper>
                        </Grid>
                    </Grid>
                </Grid>

                {/* Widgets Column */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Stack spacing={3}>
                        {/* Today's Tasks */}
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0' }}>
                            <Typography variant="subtitle1" fontWeight={700} mb={2}>Today's Tasks</Typography>
                            <List disablePadding>
                                {[
                                    { title: 'Submit host notifications', subtitle: `${metrics?.visas_expiring_30 || 0} students expiring`, type: 'error' },
                                    { title: 'Review student attendance', subtitle: '3 overdue notices', type: 'warning' },
                                    { title: 'System status check', subtitle: 'Operational', type: 'success', checked: true },
                                ].map((task, i) => (
                                    <ListItem key={i} disablePadding sx={{ py: 1 }}>
                                        <ListItemIcon sx={{ minWidth: 40 }}>
                                            <Checkbox checked={task.checked} size="small" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={task.title}
                                            secondary={task.subtitle}
                                            primaryTypographyProps={{ variant: 'body2', fontWeight: 600, sx: { textDecoration: task.checked ? 'line-through' : 'none', opacity: task.checked ? 0.5 : 1 } }}
                                            secondaryTypographyProps={{ variant: 'caption', color: task.type === 'error' ? 'error.main' : 'text.secondary' }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>

                        {/* Recent Alerts */}
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0' }}>
                            <Typography variant="subtitle1" fontWeight={700} mb={2}>Recent Alerts</Typography>
                            <Stack spacing={2}>
                                {[
                                    { icon: <ErrorIcon color="error" />, bg: alpha('#EF4444', 0.1), title: `${metrics?.visas_expiring_7 || 0} Critical Visa Expiries`, time: 'Now' },
                                    { icon: <WarningIcon sx={{ color: '#F59E0B' }} />, bg: alpha('#F59E0B', 0.1), title: `${metrics?.overdue_notices || 0} Expired Active Visas`, time: 'Update required' },
                                    { icon: <CheckCircleIcon color="success" />, bg: alpha('#10B981', 0.1), title: 'Daily Report Generated', time: '1 hour ago' },
                                ].map((alert, i) => (
                                    <Stack key={i} direction="row" spacing={2} alignItems="center">
                                        <Box sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: '50%',
                                            bgcolor: alert.bg,
                                            display: 'grid',
                                            placeItems: 'center'
                                        }}>
                                            {alert.icon}
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" fontWeight={600}>{alert.title}</Typography>
                                            <Typography variant="caption" color="text.secondary">{alert.time}</Typography>
                                        </Box>
                                    </Stack>
                                ))}
                            </Stack>
                        </Paper>
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
}
