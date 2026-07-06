import { useMutation } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";

export type StudentVisaPayload = {
    student: {
        full_name: string;
        student_id_number: string;
        nationality: string; // MUST match DB
        date_of_birth: string;
        passport_number?: string | null;
        email?: string | null;
        phone?: string | null;
    };
    visa: {
        visa_type: string;
        visa_number?: string | null;
        status: "ACTIVE" | "EXPIRED" | "REVOKED";
        start_date: string;
        end_date: string;
    };
};

async function getMyInstitutionId() {
    const { data: sessionData, error } = await supabase.auth.getSession();
    if (error) throw error;

    const user = sessionData.session?.user;
    if (!user) throw new Error("User not authenticated");

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("institution_id")
        .eq("user_id", user.id)
        .single();

    if (profileError) throw profileError;
    if (!profile?.institution_id) {
        throw new Error("Institution ID not found for this user.");
    }

    return profile.institution_id as string;
}

export function useStudentRegistration() {
    return useMutation({
        mutationFn: async (payload: StudentVisaPayload) => {
            const institution_id = await getMyInstitutionId();

            // 1️⃣ Insert Student (MATCHES YOUR TABLE EXACTLY)
            const { data: studentData, error: studentError } = await supabase
                .from("students")
                .insert({
                    institution_id,
                    full_name: payload.student.full_name,
                    student_id_number: payload.student.student_id_number,
                    nationality: payload.student.nationality,
                    date_of_birth: payload.student.date_of_birth,
                    passport_number: payload.student.passport_number ?? null,
                    email: payload.student.email ?? null,
                    phone: payload.student.phone ?? null,
                })
                .select("id")
                .single();

            if (studentError) {
                console.error("Student Insert Error:", studentError);
                throw studentError;
            }

            const student_id = studentData.id;

            // 2️⃣ Insert Visa (MATCHES YOUR visas table)
            const { error: visaError } = await supabase
                .from("visas")
                .insert({
                    student_id,
                    visa_type: payload.visa.visa_type,
                    visa_number: payload.visa.visa_number ?? null,
                    start_date: payload.visa.start_date,
                    end_date: payload.visa.end_date,
                    status: payload.visa.status,
                });

            if (visaError) {
                console.error("Visa Insert Error:", visaError);
                throw visaError;
            }

            // 3️⃣ Audit Log (MATCHES DB table: audit_logs)
            const { data: userData } = await supabase.auth.getUser();
            await supabase.from("audit_logs").insert({
                user_id: userData.user?.id,
                action: "CREATE",
                table_name: "students",
                record_id: student_id,
                changes: { payload }
            });

            return { student_id };
        },
    });
}