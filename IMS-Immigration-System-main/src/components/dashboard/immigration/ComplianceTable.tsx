import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Box,
    InputBase,
    IconButton,
    Stack,
    CircularProgress
} from '@mui/material';
import { Search as SearchIcon, FilterList as FilterIcon } from '@mui/icons-material';
import { useAllComplianceMetrics } from '../../../hooks/useAnalytics';
import { useNavigate } from 'react-router-dom';

export function ComplianceTable() {
    const { data: complianceData = [], isLoading } = useAllComplianceMetrics();
    const navigate = useNavigate();

    const handleRowClick = (institutionId: string) => {
        navigate(`/dashboard?tab=students&institutionId=${institutionId}`);
    };

    return (
        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h6" fontWeight={800} color="text.primary">
                    University Compliance
                </Typography>
                <Stack direction="row" spacing={2}>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        bgcolor: '#F1F5F9',
                        borderRadius: '24px',
                        px: 2,
                        py: 0.5,
                        width: 240
                    }}>
                        <SearchIcon sx={{ color: 'text.secondary', fontSize: 20, mr: 1 }} />
                        <InputBase
                            placeholder="Search university..."
                            sx={{ fontSize: 13, width: '100%' }}
                        />
                    </Box>
                    <IconButton size="small" sx={{ border: '1px solid #E2E8F0', borderRadius: 2, p: 1 }}>
                        <FilterIcon fontSize="small" />
                    </IconButton>
                </Stack>
            </Stack>

            <TableContainer>
                {isLoading ? (
                    <Box display="flex" justifyContent="center" p={4}>
                        <CircularProgress size={24} />
                    </Box>
                ) : (
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', py: 1 }}>University</TableCell>
                                <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', py: 1 }}>Compliant</TableCell>
                                <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', py: 1 }}>Nearing Expiry</TableCell>
                                <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', py: 1 }}>Overdue</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {complianceData.map((row: any) => (
                                <TableRow
                                    key={row.id}
                                    onClick={() => handleRowClick(row.id)}
                                    sx={{
                                        '&:last-child td, &:last-child th': { border: 0 },
                                        cursor: 'pointer',
                                        '&:hover': { bgcolor: '#F8FAFC' }
                                    }}
                                >
                                    <TableCell component="th" scope="row" sx={{ py: 2.5, fontWeight: 600, color: 'text.primary' }}>
                                        {row.university}
                                    </TableCell>
                                    <TableCell align="right" sx={{ py: 2.5, fontWeight: 700, color: '#10B981' }}>{row.compliant.toLocaleString()}</TableCell>
                                    <TableCell align="right" sx={{ py: 2.5, fontWeight: 700, color: '#F59E0B' }}>{row.nearing.toLocaleString()}</TableCell>
                                    <TableCell align="right" sx={{ py: 2.5, fontWeight: 700, color: '#EF4444' }}>{row.overdue.toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </TableContainer>
        </Paper>
    );
}
