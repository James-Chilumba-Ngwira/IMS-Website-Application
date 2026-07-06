import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import type { AuditLog } from "../types/database.types";

export function useAuditLogs() {
    return useQuery({
        queryKey: ["audit_logs"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("audit_logs")
                .select("*, user:profiles(full_name, role)") // Join assuming profiles is linked via user_id
                .order("created_at", { ascending: false })
                .limit(100); // Last 100 logs

            if (error) throw error;

            // Map the joined data correctly if needed, though Supabase returns nested objects
            return data as unknown as (AuditLog & { user: { full_name: string; role: string } })[];
        },
    });
}
