import React, { useMemo } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import { DashboardShell } from "../components/DashboardShell";
import { OverviewTab } from "../components/dashboard/student/OverviewTab";
import { DocumentsTab } from "../components/dashboard/student/DocumentsTab";
import { VisaRenewalTab } from "../components/dashboard/student/VisaRenewalTab";
import { MessagesTab } from "../components/dashboard/student/MessagesTab";
import { ContactInfoTab } from "../components/dashboard/student/ContactInfoTab";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} id={`student-tabpanel-${index}`} aria-labelledby={`student-tab-${index}`} {...other}>
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
}

export default function StudentDashboard() {
    const location = useLocation();
    const navigate = useNavigate();
    const { profile } = useAuth();

    const tabValue = useMemo(() => {
        const tab = new URLSearchParams(location.search).get("tab");
        if (tab === "documents") return 1;
        if (tab === "renewal") return 2;
        if (tab === "messages") return 3;
        if (tab === "contact") return 4;
        return 0;
    }, [location.search]);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        const tabs = ["overview", "documents", "renewal", "messages", "contact"];
        navigate(`/dashboard?tab=${tabs[newValue]}`);
    };

    const studentId = profile?.student_id || undefined;

    return (
        <DashboardShell title={profile?.full_name || "Student Portal"}>
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="student dashboard tabs" textColor="primary" indicatorColor="primary">
                    <Tab label="Overview" />
                    <Tab label="My Documents" />
                    <Tab label="Visa Renewal" />
                    <Tab label="Messages" />
                    <Tab label="Contact Info" />
                </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
                <OverviewTab studentId={studentId} />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
                <DocumentsTab studentId={studentId} />
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
                <VisaRenewalTab studentId={studentId} />
            </TabPanel>
            <TabPanel value={tabValue} index={3}>
                <MessagesTab studentId={studentId} />
            </TabPanel>
            <TabPanel value={tabValue} index={4}>
                <ContactInfoTab studentId={studentId} />
            </TabPanel>
        </DashboardShell>
    );
}
