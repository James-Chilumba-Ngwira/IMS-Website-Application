import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import type { AttendanceRecord, AttendanceStatus } from "../types/database.types";

export type CreateAttendanceDTO = {
    student_id: string;
    attendance_date: string;
    status: AttendanceStatus;
    notes?: string;
};

// ===================================
// Fetch Hooks
// ===================================

export function useAttendanceRecords(studentId: string) {
    return useQuery({
        queryKey: ["attendance", studentId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("attendance_records")
                .select("*")
                .eq("student_id", studentId)
                .order("attendance_date", { ascending: false });

            if (error) throw error;
            return data as AttendanceRecord[];
        },
        enabled: !!studentId,
    });
}


// ===================================
// Mutation Hooks
// ===================================

export function useCreateAttendance() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (attendance: CreateAttendanceDTO) => {
            const { data, error } = await supabase
                .from("attendance_records")
                .insert(attendance)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["attendance", variables.student_id] });
            queryClient.invalidateQueries({ queryKey: ["student", variables.student_id] });
        },
    });
}

export function useBulkAttendance() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (attendanceList: CreateAttendanceDTO[]) => {
            const { data, error } = await supabase
                .from("attendance_records")
                .insert(attendanceList)
                .select();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            // Invalidate all attendance queries since we don't know exactly which students were updated easily without iterating
            queryClient.invalidateQueries({ queryKey: ["attendance"] });
        },
    });
}
