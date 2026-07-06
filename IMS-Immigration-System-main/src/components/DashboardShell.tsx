import React from 'react';
import {
    Box,
    Drawer,
    List,
    Typography,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Stack,
    alpha,
    useTheme,
    Button
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    Assessment as AssessmentIcon,
    Logout as LogoutIcon,
    Business as BusinessIcon,
    FactCheck as VerifyIcon,
    PersonAdd as PersonAddIcon,
    Settings as SettingsIcon,
    Notifications as NotificationsIcon,
    Search as SearchIcon,
    KeyboardCommandKey as CommandIcon,
    Badge as BadgeIcon,
    Flight as FlightIcon,
    Chat as ChatIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { useInstitution } from '../hooks/useInstitutions';

const drawerWidth = 260;

interface DashboardShellProps {
    children: React.ReactNode;
    title?: string;
}

export function DashboardShell({ children, title }: DashboardShellProps) {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { profile, signOut } = useAuth();
    const { data: institution } = useInstitution(profile?.institution_id || '');

    const [searchInput, setSearchInput] = React.useState("");

    const isImmigration = profile?.role === 'IMMIGRATION';
    const isStudent = profile?.role === 'STUDENT';

    const menuItems = isImmigration ? [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard?tab=overview' },
        { text: 'Students', icon: <PeopleIcon />, path: '/dashboard?tab=students' },
        { text: 'Universities', icon: <BusinessIcon />, path: '/dashboard?tab=institutions' },
        { text: 'Reports', icon: <AssessmentIcon />, path: '/dashboard?tab=reports' },
        { text: 'Alerts', icon: <NotificationsIcon />, path: '/dashboard?tab=alerts' },
        { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    ] : isStudent ? [
        { text: 'Overview', icon: <DashboardIcon />, path: '/dashboard' },
        { text: 'My Documents', icon: <BadgeIcon />, path: '/dashboard?tab=documents' },
        { text: 'Visa Renewal', icon: <FlightIcon />, path: '/dashboard?tab=renewal' },
        { text: 'Messages', icon: <ChatIcon />, path: '/dashboard?tab=messages' },
        { text: 'Contact Info', icon: <PersonAddIcon />, path: '/dashboard?tab=contact' },
        { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    ] : [
        { text: 'Overview', icon: <DashboardIcon />, path: '/dashboard' },
        { text: 'Students', icon: <PeopleIcon />, path: '/dashboard?tab=students' },
        { text: 'Register Student', icon: <PersonAddIcon />, path: '/dashboard?tab=register' },
        { text: 'Attendance', icon: <VerifyIcon />, path: '/dashboard?tab=attendance' },
        { text: 'Alerts', icon: <NotificationsIcon />, path: '/dashboard?tab=alerts' },
        { text: 'Visa Renewals', icon: <FlightIcon />, path: '/dashboard?tab=renewals' },
        { text: 'Messages', icon: <ChatIcon />, path: '/dashboard?tab=messages' },
        { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    ];

    // Helper to get initials
    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const handleSearchSubmit = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && searchInput.trim()) {
            navigate(`/dashboard?tab=students&search=${encodeURIComponent(searchInput.trim())}`);
            setSearchInput("");
        }
    };

    return (
        <Box sx={{ display: 'flex', bgcolor: '#F8FAFC', minHeight: '100vh', width: '100%' }}>
            {/* Sidebar */}
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        borderRight: '1px solid #E2E8F0',
                        bgcolor: '#FFFFFF',
                        display: 'flex',
                        flexDirection: 'column'
                    },
                }}
            >
                {/* Logo Section */}
                <Box sx={{ p: 3, display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{
                        width: 40,
                        height: 40,
                        bgcolor: 'primary.main',
                        borderRadius: 2,
                        display: 'grid',
                        placeItems: 'center',
                        mr: 1.5,
                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
                    }}>
                        <Typography variant="h6" color="white" fontWeight={900}>IMS</Typography>
                    </Box>
                    <Typography variant="h6" fontWeight={800} color="#0F172A" letterSpacing="-0.5px">
                        Oversight
                    </Typography>
                </Box>

                <List sx={{ px: 2, flexGrow: 1 }}>
                    {menuItems.map((item) => {
                        const isSettings = item.path === '/settings';
                        const isActive = location.pathname === item.path || (isSettings && location.pathname === '/settings');

                        // Handle dashboard tabs separately
                        const isDashboard = item.path.startsWith('/dashboard');
                        const searchParams = new URLSearchParams(location.search);
                        const currentTab = searchParams.get('tab') || 'overview';
                        const itemUrl = new URL(item.path, window.location.origin);
                        const itemTab = itemUrl.searchParams.get('tab');

                        const isTabMatch = !itemTab || itemTab === currentTab;
                        const reallyActive = isDashboard ? (location.pathname === '/dashboard' && isTabMatch) : isActive;

                        return (
                            <ListItem key={item.text} disablePadding sx={{ display: 'block', mb: 0.5 }}>
                                <ListItemButton
                                    onClick={() => navigate(item.path)}
                                    sx={{
                                        minHeight: 48,
                                        px: 2.5,
                                        borderRadius: 2,
                                        bgcolor: reallyActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                                        color: reallyActive ? theme.palette.primary.main : '#64748B',
                                        position: 'relative',
                                        '&:hover': {
                                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                                        },
                                        ...(reallyActive && {
                                            '&::before': {
                                                content: '""',
                                                position: 'absolute',
                                                left: 0,
                                                top: '20%',
                                                bottom: '20%',
                                                width: 4,
                                                bgcolor: 'primary.main',
                                                borderRadius: '0 4px 4px 0'
                                            }
                                        })
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            minWidth: 0,
                                            mr: 2,
                                            justifyContent: 'center',
                                            color: reallyActive ? theme.palette.primary.main : 'inherit',
                                        }}
                                    >
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.text}
                                        sx={{
                                            '& .MuiTypography-root': {
                                                fontWeight: reallyActive ? 800 : 500,
                                                fontSize: '0.95rem'
                                            }
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>

                {/* Bottom Section */}
                <Box sx={{ px: 2, pb: 4 }}>
                    {!isImmigration && !isStudent && (
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            startIcon={<PersonAddIcon />}
                            onClick={() => navigate('/dashboard?tab=register')}
                            sx={{
                                borderRadius: 3,
                                py: 1.5,
                                fontWeight: 800,
                                textTransform: 'none',
                                mb: 3,
                                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)',
                                fontSize: '0.9rem'
                            }}
                        >
                            New Student Record
                        </Button>
                    )}

                    <List disablePadding>
                        <ListItem disablePadding sx={{ display: 'block', mb: 0.5 }}>
                            <ListItemButton
                                onClick={() => navigate('/settings')}
                                sx={{
                                    borderRadius: 2,
                                    px: 2,
                                    color: location.pathname === '/settings' ? 'primary.main' : '#64748B',
                                    bgcolor: location.pathname === '/settings' ? alpha(theme.palette.primary.main, 0.1) : 'transparent'
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 0, mr: 2, color: 'inherit' }}>
                                    <SettingsIcon sx={{ fontSize: 20 }} />
                                </ListItemIcon>
                                <ListItemText primary="Settings" sx={{ '& .MuiTypography-root': { fontWeight: 500, fontSize: '0.9rem' } }} />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding sx={{ display: 'block', mb: 0.5 }}>
                            <ListItemButton onClick={() => window.open('https://help.ims.kz', '_blank')} sx={{ borderRadius: 2, px: 2, color: '#64748B' }}>
                                <ListItemIcon sx={{ minWidth: 0, mr: 2, color: 'inherit' }}>
                                    <VerifyIcon sx={{ fontSize: 20 }} />
                                </ListItemIcon>
                                <ListItemText primary="Help Center" sx={{ '& .MuiTypography-root': { fontWeight: 500, fontSize: '0.9rem' } }} />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding sx={{ display: 'block' }}>
                            <ListItemButton
                                onClick={signOut}
                                sx={{
                                    borderRadius: 2,
                                    px: 2,
                                    color: 'error.main',
                                    '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.05) }
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 0, mr: 2, color: 'inherit' }}>
                                    <LogoutIcon sx={{ fontSize: 20 }} />
                                </ListItemIcon>
                                <ListItemText primary="Sign Out" sx={{ '& .MuiTypography-root': { fontWeight: 500, fontSize: '0.9rem' } }} />
                            </ListItemButton>
                        </ListItem>
                    </List>
                </Box>
            </Drawer>

            {/* Main Content Area */}
            <Box component="main" sx={{
                flexGrow: 1,
                width: `calc(100% - ${drawerWidth}px)`,
                minHeight: '100vh',
                bgcolor: '#F8FAFC',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Professional Header */}
                <Box sx={{
                    height: 80,
                    bgcolor: 'white',
                    borderBottom: '1px solid #E2E8F0',
                    px: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10
                }}>
                    {/* Search Bar - CENTERED */}
                    <Box sx={{ display: 'flex', flexGrow: 1, justifyContent: 'center' }}>
                        <Box sx={{
                            width: '100%',
                            maxWidth: 500,
                            height: 48,
                            bgcolor: '#F1F5F9',
                            borderRadius: '12px',
                            px: 2,
                            display: 'flex',
                            alignItems: 'center',
                            color: '#64748B',
                            border: '1px solid transparent',
                            '&:focus-within': { border: '1px solid #3B82F6', bgcolor: 'white', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' },
                            transition: 'all 0.2s'
                        }}>
                            <SearchIcon sx={{ fontSize: 22, mr: 1.5 }} />
                            <input
                                placeholder="Search by Passport, Visa ID, or Name..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyDown={handleSearchSubmit}
                                style={{
                                    border: 'none',
                                    background: 'transparent',
                                    outline: 'none',
                                    width: '100%',
                                    fontSize: '0.9rem',
                                    color: '#1E293B',
                                    fontWeight: 500
                                }}
                            />
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                bgcolor: 'white',
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                border: '1px solid #E2E8F0',
                                gap: 0.5
                            }}>
                                <CommandIcon sx={{ fontSize: 12 }} />
                                <Typography variant="caption" fontWeight={700} sx={{ fontSize: 10 }}>K</Typography>
                            </Box>
                        </Box>
                    </Box>

                    {/* Right Profile Section */}
                    <Stack direction="row" spacing={3} alignItems="center" sx={{ ml: 4 }}>
                        <NotificationsIcon sx={{ color: '#64748B', cursor: 'pointer' }} />

                        <Box sx={{ width: '1px', height: 32, bgcolor: '#E2E8F0' }} />

                        <Stack direction="row" spacing={2} alignItems="center">
                            <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="subtitle2" fontWeight={800} color="#1E293B">
                                    {title || (isImmigration ? "National Inspector" : isStudent ? "Student" : "University Admin")}
                                </Typography>
                                <Typography variant="caption" fontWeight={600} color="#64748B" display="block">
                                    {isImmigration ? "National Oversight" : (institution?.name || (isStudent ? "" : "KIMEP University"))}
                                </Typography>
                            </Box>

                            <Box sx={{
                                width: 44,
                                height: 44,
                                borderRadius: '10px',
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                display: 'grid',
                                placeItems: 'center',
                                border: `1.5px solid ${alpha(theme.palette.primary.main, 0.2)}`
                            }}
                                onClick={() => navigate('/settings')}
                                style={{ cursor: 'pointer' }}
                            >
                                <Typography variant="subtitle2" fontWeight={900} color="primary.main">
                                    {getInitials(profile?.full_name || (isImmigration ? "National Inspector" : isStudent ? "Student" : "University Admin"))}
                                </Typography>
                            </Box>
                        </Stack>
                    </Stack>
                </Box>

                <Box sx={{ p: 6, flexGrow: 1 }}>
                    {children}
                </Box>
            </Box>
        </Box>
    );
}
