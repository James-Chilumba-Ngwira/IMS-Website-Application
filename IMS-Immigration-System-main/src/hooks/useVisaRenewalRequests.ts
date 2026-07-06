import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import type { VisaRenewalRequest } from "../types/database.types";

// ===================================
// Fetch Hooks
// ===================================

export function useMyVisaRenewalRequests(studentId?: string) {
    return useQuery({
        queryKey: ["visa_renewal_requests", "student", studentId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("visa_renewal_requests")
                .select("*, visa:visas(*)")
                .eq("student_id", studentId)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as VisaRenewalRequest[];
        },
        enabled: !!studentId,
    });
}

export function useInstitutionVisaRenewalRequests(institutionId?: string) {
    return useQuery({
        queryKey: ["visa_renewal_requests", "institution", institutionId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("visa_renewal_requests")
                .select("*, student:students(full_name, student_id_number), visa:visas(*)")
                .eq("institution_id", institutionId)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as VisaRenewalRequest[];
        },
        enabled: !!institutionId,
    });
}

// ===================================
// Mutation Hooks
// ===================================

export function useRequestVisaRenewal() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: {
            student_id: string;
            visa_id: string;
            institution_id: string;
            requested_end_date: string;
            reason: string;
        }) => {
            const { data, error } = await supabase
                .from("visa_renewal_requests")
                .insert({ ...payload, status: "PENDING", reviewed_by: null, review_note: null })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["visa_renewal_requests", "student", data.student_id] });
            queryClient.invalidateQueries({ queryKey: ["visa_renewal_requests", "institution", data.institution_id] });
        },
    });
}

export function useReviewVisaRenewal() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            status,
            reviewNote,
            reviewedBy,
            visaId,
            requestedEndDate,
        }: {
            id: string;
            status: "APPROVED" | "REJECTED";
            reviewNote: string;
            reviewedBy: string;
            visaId: string;
            requestedEndDate: string;
        }) => {
            if (status === "APPROVED") {
                const { error: visaError } = await supabase
                    .from("visas")
                    .update({ end_date: requestedEndDate, status: "ACTIVE" })
                    .eq("id", visaId);
                if (visaError) throw visaError;
            }

            const { data, error } = await supabase
                .from("visa_renewal_requests")
                .update({ status, review_note: reviewNote, reviewed_by: reviewedBy })
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["visa_renewal_requests"] });
            queryClient.invalidateQueries({ queryKey: ["visas"] });
            queryClient.invalidateQueries({ queryKey: ["students"] });
            queryClient.invalidateQueries({ queryKey: ["student", data.student_id] });
        },
    });
}
