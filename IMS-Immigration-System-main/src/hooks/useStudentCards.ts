import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";

export function useIssueStudentCard() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async (studentId: string) => {
            const { data, error } = await supabase.rpc("issue_student_card", {
                p_student_id: studentId,
            });
            if (error) throw error;
            return data;
        },
        onSuccess: (_, studentId) => {
            qc.invalidateQueries({ queryKey: ["students"] });
            qc.invalidateQueries({ queryKey: ["student"] });
            qc.invalidateQueries({ queryKey: ["student_card", studentId] });
        },
    });
}

export function useStudentCard(studentId: string) {
    return useQuery({
        queryKey: ["student_card", studentId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("student_cards")
                .select("*, student:students(*, visa:visas(*)), institution:institutions(*)")
                .eq("student_id", studentId)
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();

            if (error) throw error;
            return data;
        },
        enabled: !!studentId,
    });
}

export function useMintCardToken() {
    return useMutation({
        mutationFn: async (cardId: string) => {
            const { data, error } = await supabase.functions.invoke("mint-card-token", {
                body: { card_id: cardId },
            });

            if (error) throw error;
            return data as { token: string; expires_in: number };
        },
    });
}