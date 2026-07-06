import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import type { Institution } from "../types/database.types";

// ===================================
// Fetch Hooks
// ===================================

export function useInstitutions() {
    return useQuery({
        queryKey: ["institutions"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("institutions")
                .select("*")
                .order("name", { ascending: true });

            if (error) throw error;
            return data as Institution[];
        },
    });
}

export function useInstitution(id: string) {
    return useQuery({
        queryKey: ["institution", id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("institutions")
                .select("*")
                .eq("id", id)
                .single();

            if (error) throw error;
            return data as Institution;
        },
        enabled: !!id,
    });
}


// ===================================
// Mutation Hooks (Immigration Only)
// ===================================

export function useCreateInstitution() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (institution: Omit<Institution, "id" | "created_at" | "updated_at">) => {
            const { data, error } = await supabase
                .from("institutions")
                .insert(institution)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["institutions"] });
        },
    });
}
