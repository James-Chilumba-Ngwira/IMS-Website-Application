import React, { useMemo } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import { DashboardShell } from "../components/DashboardShell";
import { OverviewTab } from "../components/dashboard/institution/OverviewTab";
import { MyStudentsTab } from "../components/dashboard/institution/MyStudentsTab";
import { RegisterStudentTab } from "../components/dashboard/institution/RegisterStudentTab";
import { AttendanceTab } from "../components/dashboard/institution/AttendanceTab";
import { VisaAlertsTab } from "../components/dashboard/institution/VisaAlertsTab";
import { RenewalRequestsTab } from "../components/dashboard/institution/RenewalRequestsTab";
import { InstitutionMessagesTab } from "../components/dashboard/institution/InstitutionMessagesTab";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { useInstitution } from "../hooks/useInstitutions";

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ py: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export default function InstitutionDashboard() {
    const location = useLocation();
    const navigate = useNavigate();
    const { profile } = useAuth();
    const { data: institution } = useInstitution(profile?.institution_id || "");

    // Parse tab and search from URL
    const queryParams = new URLSearchParams(location.search);
    const urlSearch = queryParams.get("search") || "";

    const tabValue = useMemo(() => {
        const tab = new URLSearchParams(location.search).get('tab');
        if (tab === 'students') return 1;
        if (tab === 'register') return 2;
        if (tab === 'attendance') return 3;
        if (tab === 'alerts') return 4;
        if (tab === 'renewals') return 5;
        if (tab === 'messages') return 6;
        return 0;
    }, [location.search]);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        const tabs = ['overview', 'students', 'register', 'attendance', 'alerts', 'renewals', 'messages'];
        // When switching tabs, we might want to clear search if not students.
        // For now, let's just navigate to the tab.
        navigate(`/dashboard?tab=${tabs[newValue]}`);
    };


    const dashboardTitle = institution ? `${institution.name} Portal` : "Institution Portal";

    return (
        <DashboardShell title={dashboardTitle}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="institution dashboard tabs" textColor="primary" indicatorColor="primary">
                    <Tab label="Overview" />
                    <Tab label="My Students" />
                    <Tab label="Register Student" />
                    <Tab label="Record Attendance" />
                    <Tab label="Visa Alerts" />
                    <Tab label="Visa Renewals" />
                    <Tab label="Messages" />
                </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
                <OverviewTab institutionId={profile?.institution_id || undefined} />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
                <MyStudentsTab initialSearch={urlSearch} />
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
                <RegisterStudentTab />
            </TabPanel>
            <TabPanel value={tabValue} index={3}>
                <AttendanceTab />
            </TabPanel>
            <TabPanel value={tabValue} index={4}>
                <VisaAlertsTab />
            </TabPanel>
            <TabPanel value={tabValue} index={5}>
                <RenewalRequestsTab />
            </TabPanel>
            <TabPanel value={tabValue} index={6}>
                <InstitutionMessagesTab />
            </TabPanel>
        </DashboardShell>
    );
}