import { Box, Dialog, DialogContent, IconButton, Button, Stack, Typography } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import kzLogo from "../assets/kz-logo.png";
import kbtuLogoDefault from "../assets/kbtu-logo.png";
import kimepLogoDefault from "../assets/kimep-logo.png";
import schoolPlaceholder from "../assets/school-placeholder.png";

export interface StudentCardData {
    // Student Info
    id: string; // The card internal ID or card number
    fullName: string;
    dateOfBirth: string;
    sex: string;
    nationality: string;
    photo?: string | null;

    // School Info
    schoolName: string;
    schoolAddress: string;
    schoolLogo?: string | null;

    // Additional Info
    dateOfIssue: string;
    dateOfExpiry: string;
    phoneNumber: string;
    cityRegion: string;

    // QR Code Data
    qrData?: string;
}

interface DigitalStudentCardProps {
    open: boolean;
    onClose: () => void;
    student: StudentCardData;
}

const getSchoolLogo = (name: string, logoUrl?: string | null) => {
    if (logoUrl) return logoUrl;
    const lowerName = name.toLowerCase();
    if (lowerName.includes("kbtu") || lowerName.includes("kazakh-british")) return kbtuLogoDefault;
    if (lowerName.includes("kimep")) return kimepLogoDefault;
    return schoolPlaceholder;
};

const getWatermarkText = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("kbtu") || lowerName.includes("kazakh-british")) return "KBTU";
    if (lowerName.includes("kimep")) return "KIMEP";
    return "STUDENT";
};

export default function DigitalStudentCard({ open, onClose, student }: DigitalStudentCardProps) {
    const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

    useEffect(() => {
        if (student.qrData || student.id) {
            const dataToEncode = student.qrData || `CARD-${student.id}`;
            QRCode.toDataURL(dataToEncode, {
                width: 300,
                margin: 1,
                errorCorrectionLevel: "H",
            })
                .then(setQrCodeUrl)
                .catch(console.error);
        }
    }, [student.qrData, student.id]);

    const schoolLogo = getSchoolLogo(student.schoolName, student.schoolLogo);
    const watermark = getWatermarkText(student.schoolName);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    maxWidth: 1200,
                    boxShadow: 'none',
                    bgcolor: 'transparent'
                },
            }}
        >
            <Box sx={{ position: "relative", bgcolor: "transparent" }}>
                {/* Close Button */}
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: "absolute",
                        right: 16,
                        top: 16,
                        zIndex: 10,
                        bgcolor: "white",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                        "&:hover": {
                            bgcolor: "grey.100",
                        },
                    }}
                >
                    <CloseIcon />
                </IconButton>

                <DialogContent sx={{ p: 0, overflow: "visible" }}>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: { xs: "column", md: "row" },
                            gap: 4,
                            p: 6,
                            bgcolor: "#F1F5F9",
                            borderRadius: 4,
                            minHeight: 600,
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {/* Front Side of Card */}
                        <Box
                            sx={{
                                width: 500,
                                height: 315, // Maintain aspect ratio roughly
                                bgcolor: "white",
                                borderRadius: 3,
                                overflow: "hidden",
                                boxShadow: "0 20px 50px rgba(0,0,0,0.12)",
                                position: "relative",
                                flexShrink: 0,
                            }}
                        >
                            {/* Watermark */}
                            <Typography
                                sx={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    opacity: 0.04,
                                    fontSize: "80px",
                                    fontWeight: 900,
                                    color: "#2563eb",
                                    pointerEvents: "none",
                                    whiteSpace: "nowrap",
                                    zIndex: 0
                                }}
                            >
                                {watermark}
                            </Typography>

                            {/* Card Header */}
                            <Box
                                sx={{
                                    bgcolor: "#ffffff",
                                    p: 2,
                                    borderBottom: "1px solid #f1f5f9",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    position: 'relative',
                                    zIndex: 1
                                }}
                            >
                                {/* Kazakhstan Flag */}
                                <Box
                                    sx={{
                                        width: 70,
                                        height: 44,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src={kzLogo}
                                        alt="Kazakhstan Flag"
                                        sx={{ width: "100%", height: "100%", objectFit: 'contain' }}
                                    />
                                </Box>

                                {/* Title */}
                                <Box sx={{ flex: 1, textAlign: "center", px: 2 }}>
                                    <Typography sx={{ fontSize: "11px", fontWeight: 800, color: "#1e293b", lineHeight: 1.1 }}>
                                        KAZAKHSTAN INTERNATIONAL<br />STUDENT DIGITAL ID
                                    </Typography>
                                </Box>

                                {/* School Logo */}
                                <Box
                                    sx={{
                                        width: 70,
                                        height: 44,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src={schoolLogo}
                                        alt="School Logo"
                                        sx={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                                    />
                                </Box>
                            </Box>

                            {/* Card Body */}
                            <Box sx={{ display: "flex", p: 2.5, gap: 2.5, position: 'relative', zIndex: 1 }}>
                                {/* Left Side - Photo */}
                                <Box sx={{ flexShrink: 0 }}>
                                    <Box
                                        sx={{
                                            width: 130,
                                            height: 160,
                                            bgcolor: "#f8fafc",
                                            borderRadius: 1.5,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            overflow: "hidden",
                                            position: "relative",
                                            border: "1px solid #e2e8f0"
                                        }}
                                    >
                                        <Box
                                            component="img"
                                            src={student.photo || "https://placehold.co/400x500?text=PHOTO"}
                                            alt="Student"
                                            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                                        />

                                        {/* Printed Date Label */}
                                        <Box
                                            sx={{
                                                position: "absolute",
                                                left: 0,
                                                bottom: 0,
                                                bgcolor: "rgba(15, 23, 42, 0.8)",
                                                color: "white",
                                                fontSize: 7,
                                                px: 0.5,
                                                py: 0.2,
                                                transform: "rotate(-90deg)",
                                                transformOrigin: "bottom left",
                                                whiteSpace: "nowrap",
                                                fontWeight: 600
                                            }}
                                        >
                                            Printed since: {new Date().toLocaleDateString()}
                                        </Box>
                                    </Box>

                                    {/* Barcode */}
                                    <Box
                                        sx={{
                                            mt: 1.5,
                                            height: 34,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: 0.5,
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                background: "repeating-linear-gradient(90deg, #000 0px, #000 1px, #fff 1px, #fff 3px)",
                                                width: "100%",
                                                height: 24,
                                                opacity: 0.8
                                            }}
                                        />
                                    </Box>
                                    <Typography sx={{ fontSize: 9, textAlign: "center", mt: 0.5, fontFamily: "monospace", opacity: 0.6 }}>
                                        {student.id.replace(/[^0-9]/g, "").slice(0, 10)}
                                    </Typography>
                                </Box>

                                {/* Right Side - Info */}
                                <Box sx={{ flex: 1 }}>
                                    <Stack spacing={1.2}>
                                        <Box>
                                            <Typography sx={{ fontSize: 9, color: "#64748b", fontWeight: 600, mb: 0.2 }}>
                                                First, Middle, Surname
                                            </Typography>
                                            <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>
                                                {student.fullName}
                                            </Typography>
                                        </Box>

                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography sx={{ fontSize: 9, color: "#64748b", fontWeight: 600, mb: 0.2 }}>Date of Birth</Typography>
                                                <Typography sx={{ fontSize: 11, fontWeight: 700 }}>{student.dateOfBirth}</Typography>
                                            </Box>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography sx={{ fontSize: 9, color: "#64748b", fontWeight: 600, mb: 0.2 }}>Sex</Typography>
                                                <Typography sx={{ fontSize: 11, fontWeight: 700 }}>{student.sex}</Typography>
                                            </Box>
                                        </Box>

                                        <Box>
                                            <Typography sx={{ fontSize: 9, color: "#64748b", fontWeight: 600, mb: 0.2 }}>
                                                Country of Citizenship
                                            </Typography>
                                            <Typography sx={{ fontSize: 11, fontWeight: 700 }}>{student.nationality}</Typography>
                                        </Box>

                                        <Box>
                                            <Typography sx={{ fontSize: 9, color: "#64748b", fontWeight: 600, mb: 0.2 }}>School Name</Typography>
                                            <Typography sx={{ fontSize: 10, fontWeight: 700, lineHeight: 1.2, color: '#1e293b' }}>
                                                {student.schoolName}
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    {/* ID Number at Bottom */}
                                    <Box
                                        sx={{
                                            mt: 1.5,
                                            pt: 1,
                                            borderTop: "1px solid #f1f5f9",
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1
                                        }}
                                    >
                                        <Typography sx={{ fontSize: 9, color: "#64748b", fontWeight: 700 }}>ID:</Typography>
                                        <Typography sx={{ fontSize: 11, fontWeight: 800, fontFamily: "monospace", letterSpacing: 0.5 }}>
                                            {student.id}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>

                            {/* Footer Note */}
                            <Typography
                                sx={{
                                    position: "absolute",
                                    bottom: 8,
                                    left: 0,
                                    right: 0,
                                    textAlign: "center",
                                    fontSize: 7,
                                    color: "#94a3b8",
                                    px: 2,
                                    fontWeight: 500
                                }}
                            >
                                This card is an official digital student identification issued by the state of Kazakhstan.
                            </Typography>
                        </Box>

                        {/* Back Side of Card */}
                        <Box
                            sx={{
                                width: 500,
                                height: 315,
                                bgcolor: "white",
                                borderRadius: 3,
                                overflow: "hidden",
                                boxShadow: "0 20px 50px rgba(0,0,0,0.12)",
                                position: "relative",
                                flexShrink: 0,
                            }}
                        >
                            <Box sx={{ p: 4, height: "100%", display: "flex" }}>
                                {/* Additional Information Section */}
                                <Box sx={{ flex: 1.2, display: "flex", flexDirection: "column" }}>
                                    <Typography sx={{ fontWeight: 800, fontSize: 14, mb: 3, color: '#0f172a' }}>
                                        ADDITIONAL INFO
                                    </Typography>

                                    <Stack spacing={2}>
                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography sx={{ fontSize: 9, color: "#64748b", fontWeight: 600, mb: 0.5 }}>Date of Issue</Typography>
                                                <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{student.dateOfIssue}</Typography>
                                            </Box>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography sx={{ fontSize: 9, color: "#64748b", fontWeight: 600, mb: 0.5 }}>Date of Expiry</Typography>
                                                <Typography sx={{ fontSize: 13, fontWeight: 700, color: "error.main" }}>
                                                    {student.dateOfExpiry}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Box>
                                            <Typography sx={{ fontSize: 9, color: "#64748b", fontWeight: 600, mb: 0.5 }}>Phone Number</Typography>
                                            <Typography sx={{ fontSize: 12, fontWeight: 700 }}>{student.phoneNumber}</Typography>
                                        </Box>

                                        <Box>
                                            <Typography sx={{ fontSize: 9, color: "#64748b", fontWeight: 600, mb: 0.5 }}>City/Region</Typography>
                                            <Typography sx={{ fontSize: 12, fontWeight: 700 }}>{student.cityRegion}</Typography>
                                        </Box>

                                        <Box>
                                            <Typography sx={{ fontSize: 9, color: "#64748b", fontWeight: 600, mb: 0.5 }}>School Address</Typography>
                                            <Typography sx={{ fontSize: 10, fontWeight: 700, lineHeight: 1.3 }}>
                                                {student.schoolAddress}
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    <Box sx={{ mt: 'auto' }}>
                                        <Typography
                                            sx={{
                                                fontSize: 7,
                                                color: "#94a3b8",
                                                lineHeight: 1.4,
                                                fontWeight: 500
                                            }}
                                        >
                                            If you find this card, please return to the issuing organization (vmp.gov.kz) or to the nearest police station.
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* QR Code Section */}
                                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8fafc', borderRadius: 2, ml: 2 }}>
                                    {qrCodeUrl && (
                                        <Box
                                            component="img"
                                            src={qrCodeUrl}
                                            alt="QR Code"
                                            sx={{
                                                width: 130,
                                                height: 130,
                                                border: "1px solid #e2e8f0",
                                                borderRadius: 2,
                                                p: 1.5,
                                                bgcolor: "white",
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                                            }}
                                        />
                                    )}
                                    <Typography sx={{ mt: 2, fontSize: 11, fontWeight: 800, color: "#1e293b" }}>
                                        SCAN TO VERIFY
                                    </Typography>
                                    <Typography sx={{ fontSize: 8, color: "#94a3b8", mt: 0.5, fontWeight: 600 }}>
                                        IMS Blockchain Verified
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Box>

                    {/* Bottom Actions */}
                    <Box sx={{ p: 3, textAlign: "center", bgcolor: "#f1f5f9", display: 'flex', justifyContent: 'center', gap: 2 }}>
                        <Button variant="contained" size="large" onClick={onClose} sx={{ px: 8, borderRadius: 2 }}>
                            CLOSE
                        </Button>
                    </Box>
                </DialogContent>
            </Box>
        </Dialog>
    );
}