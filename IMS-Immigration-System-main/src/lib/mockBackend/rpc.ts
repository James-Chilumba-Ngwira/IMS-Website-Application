// Stand-in for the `issue_student_card` Postgres function in supabase/setup.sql —
// creates a student card + blockchain ledger entry + audit log in one call.

import { getDb, persist, uid, sha256Hex } from "./store";
import { auth } from "./auth";

export async function rpc(fn: string, args?: Record<string, unknown>) {
    if (fn === "issue_student_card") {
        return issueStudentCard(args?.p_student_id as string);
    }
    return { data: null, error: { message: `Unknown RPC function: ${fn}` } };
}

async function issueStudentCard(studentId: string) {
    const db = getDb();
    const student = db.students.find((s) => s.id === studentId);
    if (!student) {
        return { data: null, error: { message: "Student not found" } };
    }

    const recordHash = await sha256Hex(studentId + new Date().toISOString());
    const txId = "tx_" + recordHash.slice(0, 16);
    const cardId = uid();

    db.student_cards.push({
        id: cardId,
        student_id: studentId,
        institution_id: student.institution_id,
        status: "ACTIVE",
        token_version: 1,
        record_hash: recordHash,
        blockchain_tx_id: txId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    });

    db.blockchain_ledger.push({
        id: uid(),
        card_id: cardId,
        record_hash: recordHash,
        blockchain_tx_id: txId,
        created_at: new Date().toISOString(),
    });

    const { data: userData } = await auth.getUser();
    db.audit_logs.push({
        id: uid(),
        user_id: userData.user?.id ?? null,
        action: "ISSUE_CARD",
        table_name: "student_cards",
        record_id: cardId,
        changes: { student_id: studentId, card_id: cardId },
        created_at: new Date().toISOString(),
    });

    persist();

    return { data: { card_id: cardId, record_hash: recordHash, blockchain_tx_id: txId }, error: null };
}
