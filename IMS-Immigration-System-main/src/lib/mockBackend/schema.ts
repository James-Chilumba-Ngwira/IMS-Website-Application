// Relation map used to resolve embedded selects (e.g. "visa:visas(*)") and
// dot-path filters (e.g. .eq("student.institution_id", id)) against the
// in-memory store, mirroring the foreign keys declared in supabase/setup.sql.

export type TableName =
    | "institutions"
    | "profiles"
    | "students"
    | "visas"
    | "attendance_records"
    | "verification_requests"
    | "audit_logs"
    | "student_cards"
    | "blockchain_ledger"
    | "analytics_summary"
    | "visa_renewal_requests"
    | "messages";

export type RelationKind = "belongsTo" | "hasMany";

export interface RelationDef {
    table: TableName;
    kind: RelationKind;
    /** column on the table that OWNS the relation entry (belongsTo: local FK column; hasMany: local PK column, usually "id") */
    localKey: string;
    /** column on the RELATED table that matches localKey */
    foreignKey: string;
    /** if set, resolve by hopping through another relation first (used for the one relation with no direct FK) */
    hopThrough?: { relation: string };
}

export const RELATIONS: Partial<Record<TableName, Record<string, RelationDef>>> = {
    profiles: {
        institution: { table: "institutions", kind: "belongsTo", localKey: "institution_id", foreignKey: "id" },
        student: { table: "students", kind: "belongsTo", localKey: "student_id", foreignKey: "id" },
    },
    students: {
        institution: { table: "institutions", kind: "belongsTo", localKey: "institution_id", foreignKey: "id" },
        visas: { table: "visas", kind: "hasMany", localKey: "id", foreignKey: "student_id" },
        visa: { table: "visas", kind: "hasMany", localKey: "id", foreignKey: "student_id" },
        attendance_records: { table: "attendance_records", kind: "hasMany", localKey: "id", foreignKey: "student_id" },
        attendance: { table: "attendance_records", kind: "hasMany", localKey: "id", foreignKey: "student_id" },
        student_cards: { table: "student_cards", kind: "hasMany", localKey: "id", foreignKey: "student_id" },
        visa_renewal_requests: { table: "visa_renewal_requests", kind: "hasMany", localKey: "id", foreignKey: "student_id" },
        messages: { table: "messages", kind: "hasMany", localKey: "id", foreignKey: "student_id" },
    },
    visa_renewal_requests: {
        student: { table: "students", kind: "belongsTo", localKey: "student_id", foreignKey: "id" },
        visa: { table: "visas", kind: "belongsTo", localKey: "visa_id", foreignKey: "id" },
        institution: { table: "institutions", kind: "belongsTo", localKey: "institution_id", foreignKey: "id" },
    },
    messages: {
        student: { table: "students", kind: "belongsTo", localKey: "student_id", foreignKey: "id" },
        institution: { table: "institutions", kind: "belongsTo", localKey: "institution_id", foreignKey: "id" },
    },
    visas: {
        student: { table: "students", kind: "belongsTo", localKey: "student_id", foreignKey: "id" },
    },
    attendance_records: {
        student: { table: "students", kind: "belongsTo", localKey: "student_id", foreignKey: "id" },
    },
    verification_requests: {
        student: { table: "students", kind: "belongsTo", localKey: "student_id", foreignKey: "id" },
        institution: { table: "institutions", kind: "belongsTo", localKey: "institution_id", foreignKey: "id" },
    },
    audit_logs: {
        user: { table: "profiles", kind: "belongsTo", localKey: "user_id", foreignKey: "user_id" },
    },
    student_cards: {
        student: { table: "students", kind: "belongsTo", localKey: "student_id", foreignKey: "id" },
        institution: { table: "institutions", kind: "belongsTo", localKey: "institution_id", foreignKey: "id" },
        // visas has no direct FK to student_cards — resolve via the student it belongs to.
        visa: { table: "visas", kind: "hasMany", localKey: "student_id", foreignKey: "student_id", hopThrough: { relation: "student" } },
    },
    institutions: {
        students: { table: "students", kind: "hasMany", localKey: "id", foreignKey: "institution_id" },
    },
};

// hasMany relations aliased with a singular name (e.g. "visa" not "visas") are
// treated by the rest of the app as a single most-recent row, not an array.
export const SINGULAR_HASMANY_ALIASES = new Set(["visa"]);
