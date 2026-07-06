import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import type { VerificationRequest } from "../types/database.types";

export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

// ===================================
// Fetch Hooks
// ===================================

export function useVerificationLogs(studentId?: string) {
    return useQuery({
        queryKey: ["verification_logs", studentId],
        queryFn: async () => {
            let query = supabase
                .from("verification_requests")
                .select("*, student:students(full_name, nationality, student_id_number)")
                .order("created_at", { ascending: false });

            if (studentId) {
                query = query.eq("student_id", studentId);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data as VerificationRequest[];
        },
    });
}


// ===================================
// Mutation Hooks
// ===================================

export function useVerifyStudent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (studentIdNumber: string) => {
            // 1. Check if student exists in the specialized view (mocking secure lookup)
            const { data, error } = await supabase
                .from("students") // Using students table directly for simplicity in this refinement
                .select("*")
                .eq("student_id_number", studentIdNumber)
                .single();

            // If not found or error, logic to handle "Not Verified"
            const result = data ? { status: "FOUND", student: data } : { status: "NOT_FOUND" };

            // 2. Log the request
            if (data?.id) {
                await supabase.from("verification_requests").insert({
                    student_id: data.id,
                    verified_by: (await supabase.auth.getUser()).data.user?.id,
                    verification_type: "MANUAL_CHECK",
                    result: result
                });
            }

            if (error && error.code !== "PGRST116") throw error; // PGRST116 is "no rows found"

            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["verification_logs"] });
        }
    });
}

export function useApproveStudent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ studentId, status, notes }: { studentId: string, status: VerificationStatus, notes?: string }) => {
            // Fetch current metadata
            const { data: student, error: fetchError } = await supabase
                .from("students")
                .select("metadata")
                .eq("id", studentId)
                .single();

            if (fetchError) throw fetchError;

            const updatedMetadata = {
                ...(student.metadata || {}),
                verification_status: status,
                verification_notes: notes,
                verified_at: new Date().toISOString(),
                verified_by: (await supabase.auth.getUser()).data.user?.id
            };

            const { data, error } = await supabase
                .from("students")
                .update({ metadata: updatedMetadata })
                .eq("id", studentId)
                .select()
                .single();

            if (error) throw error;

            // Log verification request for history
            await supabase.from("verification_requests").insert({
                student_id: studentId,
                verified_by: (await supabase.auth.getUser()).data.user?.id,
                verification_type: 'MANUAL_APPROVAL',
                result: { status, notes }
            });

            return data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["student", variables.studentId] });
            queryClient.invalidateQueries({ queryKey: ["students"] });
            queryClient.invalidateQueries({ queryKey: ["verification_logs"] });
        },
    });
}
