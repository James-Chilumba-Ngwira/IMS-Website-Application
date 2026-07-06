import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import type { Message, MessageSenderRole } from "../types/database.types";

// ===================================
// Fetch Hooks
// ===================================

export function useMessages(studentId?: string) {
    return useQuery({
        queryKey: ["messages", studentId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("messages")
                .select("*")
                .eq("student_id", studentId)
                .order("created_at", { ascending: true });

            if (error) throw error;
            return data as Message[];
        },
        enabled: !!studentId,
    });
}

export function useInstitutionMessages(institutionId?: string) {
    return useQuery({
        queryKey: ["messages", "institution", institutionId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("messages")
                .select("*, student:students(full_name, student_id_number)")
                .eq("institution_id", institutionId)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as Message[];
        },
        enabled: !!institutionId,
    });
}

// ===================================
// Mutation Hooks
// ===================================

export function useSendMessage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: {
            student_id: string;
            institution_id: string;
            sender_role: MessageSenderRole;
            sender_name: string;
            body: string;
        }) => {
            const { data, error } = await supabase
                .from("messages")
                .insert({ ...payload, read: false })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["messages", data.student_id] });
            queryClient.invalidateQueries({ queryKey: ["messages", "institution", data.institution_id] });
        },
    });
}

export function useMarkMessagesRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ studentId, senderRole }: { studentId: string; senderRole: MessageSenderRole }) => {
            const { error } = await supabase
                .from("messages")
                .update({ read: true })
                .eq("student_id", studentId)
                .eq("sender_role", senderRole);
            if (error) throw error;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["messages", variables.studentId] });
            queryClient.invalidateQueries({ queryKey: ["messages", "institution"] });
        },
    });
}
