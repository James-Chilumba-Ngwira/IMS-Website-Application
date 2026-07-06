import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import type { Visa } from "../types/database.types";

// ===================================
// Fetch Hooks
// ===================================

export function useVisas(institutionId?: string) {
    return useQuery({
        queryKey: ["visas", institutionId],
        queryFn: async () => {
            let query = supabase
                .from("visas")
                .select("*, student:students(full_name, institution_id)")
                .order("end_date", { ascending: true });

            if (institutionId) {
                // We need to filter by student's institution_id
                query = query
                    .eq("student.institution_id", institutionId);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data as Visa[];
        },
    });
}

export function useExpiringVisas(daysBefore: number = 30) {
    return useQuery({
        queryKey: ["visas", "expiring", daysBefore],
        queryFn: async () => {
            const today = new Date();
            const futureDate = new Date();
            futureDate.setDate(today.getDate() + daysBefore);

            const { data, error } = await supabase
                .from("visas")
                .select("*, student:students(*, institution:institutions(name))")
                .eq("status", "ACTIVE")
                .lte("end_date", futureDate.toISOString().split('T')[0])
                .gte("end_date", today.toISOString().split('T')[0])
                .order("end_date", { ascending: true });

            if (error) throw error;
            return data as Visa[];
        },
    });
}


// ===================================
// Mutation Hooks
// ===================================

export function useUpdateVisa() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: Partial<Visa> }) => {
            const { data, error } = await supabase
                .from("visas")
                .update(updates)
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["visas"] });
            queryClient.invalidateQueries({ queryKey: ["student"] });
        },
    });
}
