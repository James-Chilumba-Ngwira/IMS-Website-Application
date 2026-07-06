import { Paper, Typography, Box, Stack, alpha, useTheme } from '@mui/material';
import { TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon } from '@mui/icons-material';

interface StatsCardProps {
    label: string;
    value: string | number;
    trend: string;
    trendValue: number;
    trendType: 'positive' | 'negative';
}

export function StatsCard({ label, value, trend, trendValue, trendType }: StatsCardProps) {
    const theme = useTheme();

    // Determine color based on trend and trendType (e.g., increase in alerts is bad)
    const isSuccess = (trendValue >= 0 && trendType === 'positive') || (trendValue < 0 && trendType === 'negative');
    const color = isSuccess ? theme.palette.success.main : theme.palette.error.main;
    const Icon = trendValue >= 0 ? TrendingUpIcon : TrendingDownIcon;

    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                borderRadius: 4,
                border: '1px solid #E2E8F0',
                bgcolor: '#FFFFFF',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
            }}
        >
            <Typography variant="body2" color="text.secondary" fontWeight={500} mb={1}>
                {label}
            </Typography>
            <Typography variant="h3" fontWeight={800} color="text.primary" mb={1.5}>
                {value}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        color: color,
                        bgcolor: alpha(color, 0.1),
                        px: 1,
                        py: 0.25,
                        borderRadius: 1,
                        fontSize: '0.75rem',
                        fontWeight: 700
                    }}
                >
                    <Icon sx={{ fontSize: '1rem', mr: 0.5 }} />
                    {Math.abs(trendValue)}%
                </Box>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    {trend}
                </Typography>
            </Stack>
        </Paper>
    );
}
