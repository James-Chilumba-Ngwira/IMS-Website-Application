import { Box, Container, Typography } from "@mui/material";
import DigitalStudentCard from "../components/DigitalStudentCard";

export default function DesignTest() {
    const atefaData = {
        id: "KBTU-2024-001",
        fullName: "Atefa James Emmanuel",
        dateOfBirth: "2002-06-28",
        sex: "Male",
        nationality: "Nigerian",
        photo: "https://placehold.co/400x500?text=ATEFA+PHOTO",
        schoolName: "Kazakh British Technical University",
        schoolAddress: "Tole Bi 59",
        cityRegion: "Almaty",
        phoneNumber: "+7 747 977 7542",
        dateOfIssue: "13/02/2026",
        dateOfExpiry: "13/02/2027",
        qrData: "https://ims.is/verify?t=test-token",
    };

    const kimepData = {
        ...atefaData,
        id: "KIMEP-2024-002",
        fullName: "John Doe",
        schoolName: "KIMEP University",
        schoolAddress: "2 Abai Ave",
        cityRegion: "Almaty",
    };

    return (
        <Container maxWidth="xl" sx={{ py: 8, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
            <Typography variant="h3" fontWeight={900} gutterBottom>
                Final Design Review: Digital Student ID
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 6 }}>
                Following user-provided specification and code structure.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Box>
                    <Typography variant="h5" fontWeight={800} sx={{ mb: 3 }}>KBTU SPEC</Typography>
                    <DigitalStudentCard open={true} onClose={() => { }} student={atefaData} />
                </Box>

                <Box>
                    <Typography variant="h5" fontWeight={800} sx={{ mb: 3 }}>KIMEP SPEC</Typography>
                    <DigitalStudentCard open={true} onClose={() => { }} student={kimepData} />
                </Box>
            </Box>
        </Container>
    );
}
