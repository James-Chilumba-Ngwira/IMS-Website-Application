import { Paper, Typography, Box, Stack, alpha, CircularProgress } from '@mui/material';
import {
    GppBad as FraudIcon,
    EventBusy as OverdueIcon,
    ErrorOutline as AlertIcon
} from '@mui/icons-material';
import { useSystemCriticalAlerts } from '../../../hooks/useAnalytics';

export function CriticalAlerts() {
    const { data: alerts = [], isLoading } = useSystemCriticalAlerts();

    const getIcon = (type: string) => {
        switch (type) {
            case 'VISA_ALERT': return <OverdueIcon sx={{ color: '#EF4444' }} />;
            case 'FRAUD': return <FraudIcon sx={{ color: '#EF4444' }} />;
            default: return <AlertIcon sx={{ color: '#F59E0B' }} />;
        }
    };

    const getBgColor = (type: string) => {
        switch (type) {
            case 'VISA_ALERT':
            case 'FRAUD': return '#FEF2F2';
            default: return '#FFFBEB';
        }
    };

    return (
        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', height: '100%' }}>
            <Typography variant="h6" fontWeight={800} color="text.primary" mb={4}>
                Critical Alerts
            </Typography>

            {isLoading ? (
                <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress size={24} />
                </Box>
            ) : alerts.length === 0 ? (
                <Typography variant="body2" color="text.secondary" align="center" py={4}>
                    No critical alerts at this time.
                </Typography>
            ) : (
                <Stack spacing={2}>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {alerts.map((alert: any) => (
                        <Box
                            key={alert.id}
                            sx={{
                                p: 2,
                                borderRadius: 3,
                                border: `1px solid ${alpha(getIcon(alert.type).props.sx.color, 0.1)}`,
                                bgcolor: getBgColor(alert.type),
                                display: 'flex',
                                gap: 2
                            }}
                        >
                            <Box sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                bgcolor: '#FFFFFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                            }}>
                                {getIcon(alert.type)}
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" fontWeight={800} color="#1E293B" lineHeight={1.2} mb={0.5}>
                                    {alert.title}
                                </Typography>
                                <Typography variant="caption" fontWeight={700} color="#EF4444" display="block">
                                    Student ID: {alert.studentId}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                    {alert.time} - {alert.location}
                                </Typography>
                            </Box>
                        </Box>
                    ))}
                </Stack>
            )}
        </Paper>
    );
}
