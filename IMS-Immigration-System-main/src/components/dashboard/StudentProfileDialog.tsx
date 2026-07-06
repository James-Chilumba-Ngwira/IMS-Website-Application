import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    Typography,
    Box,
    Stack,
    Chip,
    Avatar,
    IconButton,
    CircularProgress,
    Paper,
    alpha,
    Alert,
    AlertTitle
} from '@mui/material';
import {
    Close as CloseIcon,
    Badge as BadgeIcon,
    Public as PublicIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    CalendarToday as DateIcon,
    VpnKey as PassportIcon,
    Assignment as VisaIcon,
    CheckCircle as VerifiedIcon,
    Error as UnverifiedIcon
} from '@mui/icons-material';
import { useStudent } from '../../hooks/useStudents';
import { useAuth } from '../../auth/AuthProvider';
import { useApproveStudent } from '../../hooks/useVerification';
import type { Visa, AttendanceRecord } from '../../types/database.types';

interface StudentProfileDialogProps {
    open: boolean;
    studentId: string | null;
    onClose: () => void;
}

export function StudentProfileDialog({ open, studentId, onClose }: StudentProfileDialogProps) {
    const { profile } = useAuth();
    const { data: student, isLoading } = useStudent(studentId || '');
    const { mutate: approveStudent, isPending: isApproving } = useApproveStudent();

    if (!studentId) return null;

    const isImmigration = profile?.role === 'IMMIGRATION';
    const metadata = (student?.metadata || {}) as any;
    const verificationStatus = metadata.verification_status || 'PENDING';

    // Supabase joins can return arrays or objects. We handle both for robustness.
    const visa = (Array.isArray(student?.visa) ? student.visa[0] : student?.visa) as Visa | undefined;
    const attendance = student?.attendance as AttendanceRecord[] | undefined;

    const handleVerify = (status: 'VERIFIED' | 'REJECTED') => {
        if (!studentId) return;
        approveStudent({
            studentId,
            status,
            notes: status === 'VERIFIED' ? 'Approved by officer' : 'Rejected by officer'
        });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="body">
            <DialogTitle sx={{ pb: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Typography variant="h6" fontWeight={800}>Student Profile</Typography>
                        <Chip
                            label={verificationStatus}
                            color={verificationStatus === 'VERIFIED' ? 'success' : (verificationStatus === 'REJECTED' ? 'error' : 'warning')}
                            size="small"
                            variant="filled"
                            sx={{ fontWeight: 800, fontSize: '0.65rem' }}
                        />
                    </Stack>
                    <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
                </Stack>
            </DialogTitle>
            <DialogContent dividers sx={{ bgcolor: '#F8FAFC' }}>
                {isLoading ? (
                    <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>
                ) : student ? (
                    <Box>
                        {/* Status Alert for Immigration */}
                        {isImmigration && verificationStatus === 'PENDING' && (
                            <Alert severity="info" sx={{ mb: 3, borderRadius: 3, border: '1px solid #BAE6FD' }}>
                                <AlertTitle sx={{ fontWeight: 700 }}>Verification Required</AlertTitle>
                                This student record is pending verification. Please review the details below.
                            </Alert>
                        )}

                        {/* Header Area */}
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, mb: 3, border: '1px solid #E2E8F0' }}>
                            <Stack direction="row" spacing={3} alignItems="center">
                                <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: 32, boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }}>
                                    {student.full_name?.charAt(0) || 'S'}
                                </Avatar>
                                <Box>
                                    <Typography variant="h5" fontWeight={900} color="#1E293B">{student.full_name}</Typography>
                                    <Typography variant="body2" color="text.secondary" fontWeight={600}>ID: {student.student_id_number}</Typography>
                                    <Stack direction="row" spacing={1} mt={1.5}>
                                        <Chip
                                            label={visa?.status || 'NO VISA'}
                                            color={visa?.status === 'ACTIVE' ? 'success' : (visa?.status ? 'error' : 'default')}
                                            size="small"
                                            sx={{ fontWeight: 700 }}
                                        />
                                        <Chip
                                            label={student.nationality}
                                            variant="outlined"
                                            size="small"
                                            sx={{ fontWeight: 600, bgcolor: '#FFFFFF' }}
                                            icon={<PublicIcon sx={{ fontSize: '1rem !important' }} />}
                                        />
                                    </Stack>
                                </Box>
                            </Stack>
                        </Paper>

                        <Grid container spacing={3}>
                            {/* Personal Details */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Paper elevation={0} sx={{ p: 3, borderRadius: 4, height: '100%', border: '1px solid #E2E8F0' }}>
                                    <Typography variant="subtitle2" fontWeight={800} color="primary" gutterBottom sx={{ letterSpacing: 0.5 }}>PERSONAL INFORMATION</Typography>
                                    <Stack spacing={2.5} mt={2}>
                                        <DetailItem icon={<EmailIcon fontSize="small" />} label="Email" value={student.email || 'Not provided'} />
                                        <DetailItem icon={<PhoneIcon fontSize="small" />} label="Phone" value={student.phone || 'Not provided'} />
                                        <DetailItem icon={<DateIcon fontSize="small" />} label="Date of Birth" value={student.date_of_birth} />
                                        <DetailItem icon={<PassportIcon fontSize="small" />} label="Passport Number" value={student.passport_number || 'N/A'} />
                                    </Stack>
                                </Paper>
                            </Grid>

                            {/* Visa Details */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Paper elevation={0} sx={{ p: 3, borderRadius: 4, height: '100%', border: '1px solid #E2E8F0' }}>
                                    <Typography variant="subtitle2" fontWeight={800} color="primary" gutterBottom sx={{ letterSpacing: 0.5 }}>VISA & ENROLLMENT</Typography>
                                    <Stack spacing={2.5} mt={2}>
                                        <DetailItem icon={<VisaIcon fontSize="small" />} label="Visa Type" value={visa?.visa_type || 'N/A'} />
                                        <DetailItem icon={<BadgeIcon fontSize="small" />} label="Visa Number" value={visa?.visa_number || 'N/A'} />
                                        <DetailItem icon={<DateIcon fontSize="small" />} label="Visa Validity" value={visa ? `${visa.start_date} to ${visa.end_date}` : 'N/A'} />
                                        <DetailItem icon={<BadgeIcon fontSize="small" />} label="Enrolled Institution" value={student.institution?.name || 'N/A'} />
                                    </Stack>
                                </Paper>
                            </Grid>

                            {/* Attendance Summary */}
                            <Grid size={{ xs: 12 }}>
                                <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #E2E8F0' }}>
                                    <Typography variant="subtitle2" fontWeight={800} color="primary" gutterBottom sx={{ letterSpacing: 0.5 }}>RECENT ATTENDANCE</Typography>
                                    {attendance && attendance.length > 0 ? (
                                        <Stack direction="row" spacing={1.5} sx={{ overflowX: 'auto', pb: 1, mt: 2 }}>
                                            {attendance.slice(0, 7).map((record) => (
                                                <Paper key={record.id} elevation={0} sx={{
                                                    p: 2,
                                                    borderRadius: 3,
                                                    border: '1px solid #E2E8F0',
                                                    minWidth: 110,
                                                    textAlign: 'center',
                                                    bgcolor: record.status === 'PRESENT' ? alpha('#10B981', 0.05) : alpha('#EF4444', 0.05)
                                                }}>
                                                    <Typography variant="caption" display="block" color="text.secondary" fontWeight={600}>{record.attendance_date}</Typography>
                                                    <Chip
                                                        label={record.status}
                                                        size="small"
                                                        color={record.status === 'PRESENT' ? 'success' : (record.status === 'ABSENT' ? 'error' : 'warning')}
                                                        sx={{ mt: 1, height: 22, fontSize: '0.7rem', fontWeight: 700 }}
                                                    />
                                                </Paper>
                                            ))}
                                        </Stack>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>No attendance records found.</Typography>
                                    )}
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>
                ) : (
                    <Typography>Student not found.</Typography>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 3, bgcolor: '#FFFFFF' }}>
                <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
                    {isImmigration && verificationStatus === 'PENDING' && (
                        <>
                            <Button
                                fullWidth
                                variant="contained"
                                color="success"
                                startIcon={isApproving ? <CircularProgress size={20} color="inherit" /> : <VerifiedIcon />}
                                onClick={() => handleVerify('VERIFIED')}
                                disabled={isApproving}
                                sx={{ borderRadius: 3, py: 1.5, fontWeight: 800 }}
                            >
                                Verify Student
                            </Button>
                            <Button
                                fullWidth
                                variant="outlined"
                                color="error"
                                startIcon={<UnverifiedIcon />}
                                onClick={() => handleVerify('REJECTED')}
                                disabled={isApproving}
                                sx={{ borderRadius: 3, py: 1.5, fontWeight: 800 }}
                            >
                                Reject Record
                            </Button>
                        </>
                    )}
                    <Button
                        onClick={onClose}
                        variant={isImmigration && verificationStatus === 'PENDING' ? "text" : "contained"}
                        fullWidth={!(isImmigration && verificationStatus === 'PENDING')}
                        sx={{ borderRadius: 3, py: 1.5, fontWeight: 800 }}
                    >
                        Close
                    </Button>
                </Stack>
            </DialogActions>
        </Dialog>
    );
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Box sx={{ color: 'text.secondary', mt: 0.2 }}>{icon}</Box>
            <Box>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>{label}</Typography>
                <Typography variant="body2" fontWeight={500}>{value}</Typography>
            </Box>
        </Stack>
    );
}
