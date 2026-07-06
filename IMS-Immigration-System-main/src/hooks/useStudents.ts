import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import type { Student } from "../types/database.types";

// ===================================
// Fetch Hooks
// ===================================

export function useStudents(institutionId?: string) {
    return useQuery({
        queryKey: ["students", institutionId],
        queryFn: async () => {
            let query = supabase
                .from("students")
                .select("*, visa:visas(*), institution:institutions(name)")
                .order("created_at", { ascending: false });

            if (institutionId) {
                query = query.eq("institution_id", institutionId);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data as Student[];
        },
    });
}

export function useStudent(id: string) {
    return useQuery({
        queryKey: ["student", id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("students")
                .select("*, visa:visas(*), institution:institutions(*), attendance:attendance_records(*)")
                .eq("id", id)
                .single();

            if (error) throw error;
            return data as Student;
        },
        enabled: !!id,
    });
}

// ===================================
// Mutation Hooks
// ===================================

export function useUpdateMyContactInfo() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ studentId, email, phone }: { studentId: string; email: string; phone: string }) => {
            const { data, error } = await supabase
                .from("students")
                .update({ email, phone })
                .eq("id", studentId)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["student", variables.studentId] });
            queryClient.invalidateQueries({ queryKey: ["students"] });
        },
    });
}

export function useCreateStudent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: { student: any; visa: any; institution_id: string }) => {
            // 1. Create Student
            const { data: studentData, error: studentError } = await supabase
                .from("students")
                .insert({
                    ...payload.student,
                    institution_id: payload.institution_id,
                })
                .select()
                .single();

            if (studentError) throw studentError;

            // 2. Create Visa
            const { error: visaError } = await supabase
                .from("visas")
                .insert({
                    student_id: studentData.id,
                    ...payload.visa,
                });

            if (visaError) throw visaError;

            // 3. Log Audit (Optional explicitly here, or via triggers/backend)
            await supabase.from("audit_logs").insert({
                action: "CREATE",
                table_name: "students",
                record_id: studentData.id,
                changes: payload,
                user_id: (await supabase.auth.getUser()).data.user?.id
            });

            return studentData;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["students"] });
        },
    });
}
