import { z } from "zod";

// ==============================================================================
// Enums
// ==============================================================================
export type UserRole = "IMMIGRATION" | "INSTITUTION" | "STUDENT";
export type InstitutionType = "UNIVERSITY" | "COLLEGE" | "LANGUAGE_SCHOOL";
export type VisaStatus = "ACTIVE" | "EXPIRED" | "CANCELLED" | "PENDING_RENEWAL";
export type AttendanceStatus = "PRESENT" | "ABSENT" | "EXCUSED" | "LATE";
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

// ==============================================================================
// Database Tables Interfaces
// ==============================================================================

export interface Institution {
    id: string;
    name: string;
    institution_type: InstitutionType;
    address: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    license_number: string | null;
    created_at: string;
    updated_at: string;
}

export interface Profile {
    user_id: string;
    role: UserRole;
    institution_id: string | null;
    student_id: string | null;
    full_name: string | null;
    created_at: string;
    updated_at: string;
}

export interface Student {
    id: string;
    institution_id: string;
    student_id_number: string;
    full_name: string;
    nationality: string;
    passport_number: string | null;
    date_of_birth: string;
    email: string | null;
    phone: string | null;
    metadata: Record<string, any>;
    created_at: string;
    updated_at: string;

    // Joined fields (optional)
    institution?: Institution;
    visa?: Visa;
    attendance?: AttendanceRecord[];
}

export interface Visa {
    id: string;
    student_id: string;
    visa_type: string;
    visa_number: string | null;
    start_date: string;
    end_date: string;
    status: VisaStatus;
    metadata: Record<string, any>;
    created_at: string;
    updated_at: string;
}

export interface AttendanceRecord {
    id: string;
    student_id: string;
    attendance_date: string;
    status: AttendanceStatus;
    notes: string | null;
    created_at: string;
}

export interface VerificationRequest {
    id: string;
    student_id: string;
    verified_by: string;
    verification_type: string;
    result: Record<string, any>;
    created_at: string;
}

export interface Notification {
    id: string;
    user_id: string;
    notification_type: string;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
}

export interface AuditLog {
    id: string;
    user_id: string;
    action: string;
    table_name: string;
    record_id: string;
    changes: Record<string, any> | null;
    created_at: string;
}

export type VisaRenewalStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface VisaRenewalRequest {
    id: string;
    student_id: string;
    visa_id: string;
    institution_id: string;
    requested_end_date: string;
    reason: string;
    status: VisaRenewalStatus;
    reviewed_by: string | null;
    review_note: string | null;
    created_at: string;
    updated_at: string;

    // Joined fields (optional)
    student?: Student;
    visa?: Visa;
}

export type MessageSenderRole = "STUDENT" | "INSTITUTION";

export interface Message {
    id: string;
    student_id: string;
    institution_id: string;
    sender_role: MessageSenderRole;
    sender_name: string;
    body: string;
    read: boolean;
    created_at: string;

    // Joined fields (optional)
    student?: Student;
}

// ==============================================================================
// Zod Schemas for Validation
// ==============================================================================

export const StudentSchema = z.object({
    student_id_number: z.string().min(1, "Student ID is required"),
    full_name: z.string().min(1, "Full name is required"),
    nationality: z.string().min(1, "Nationality is required"),
    passport_number: z.string().optional().nullable(),
    date_of_birth: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date format",
    }),
    email: z.string().email("Invalid email").optional().or(z.literal("")).nullable(),
    phone: z.string().optional().nullable(),
});

export const VisaSchema = z.object({
    visa_type: z.string().min(1, "Visa type is required"),
    visa_number: z.string().optional().nullable(),
    start_date: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid start date"),
    end_date: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid end date"),
    status: z.enum(["ACTIVE", "EXPIRED", "CANCELLED", "PENDING_RENEWAL"]),
}).refine((data) => new Date(data.end_date) > new Date(data.start_date), {
    message: "End date must be after start date",
    path: ["end_date"],
});

export const StudentRegistrationSchema = z.object({
    student: StudentSchema,
    visa: VisaSchema,
});

export type CreateStudentDTO = z.infer<typeof StudentRegistrationSchema>;
export type CreateVisaDTO = z.infer<typeof VisaSchema>;
