// In-memory + localStorage-persisted "database" for the demo backend.
// Replaces a real Supabase project (Postgres + Auth) so the app works as a
// fully self-contained static site with no external service dependency.

const STORAGE_KEY = "ims_mock_db_v3";

export interface AuthUser {
    id: string;
    email: string;
    password: string;
    user_metadata: { full_name?: string; role?: string };
    created_at: string;
}

export interface DbShape {
    authUsers: AuthUser[];
    institutions: Record<string, unknown>[];
    profiles: Record<string, unknown>[];
    students: Record<string, unknown>[];
    visas: Record<string, unknown>[];
    attendance_records: Record<string, unknown>[];
    verification_requests: Record<string, unknown>[];
    audit_logs: Record<string, unknown>[];
    student_cards: Record<string, unknown>[];
    blockchain_ledger: Record<string, unknown>[];
    analytics_summary: Record<string, unknown>[];
    visa_renewal_requests: Record<string, unknown>[];
    messages: Record<string, unknown>[];
}

export function uid(): string {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
    return "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export async function sha256Hex(input: string): Promise<string> {
    const bytes = new TextEncoder().encode(input);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function daysFromNow(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
}
function daysAgo(days: number): string {
    return daysFromNow(-days);
}

function buildSeed(): DbShape {
    const instNU = "inst-nu";
    const instKBTU = "inst-kbtu";
    const instKazNU = "inst-kaznu";

    const institutions = [
        { id: instNU, name: "Nazarbayev University", institution_type: "UNIVERSITY", address: "53 Kabanbay Batyr Ave, Astana", contact_email: "international@nu.edu.kz", contact_phone: "+7 7172 706 000", license_number: "EDU-NU-001", created_at: daysAgo(400), updated_at: daysAgo(10) },
        { id: instKBTU, name: "Kazakh-British Technical University", institution_type: "UNIVERSITY", address: "59 Tole Bi St, Almaty", contact_email: "international@kbtu.kz", contact_phone: "+7 727 357 4242", license_number: "EDU-KBTU-002", created_at: daysAgo(390), updated_at: daysAgo(12) },
        { id: instKazNU, name: "Al-Farabi Kazakh National University", institution_type: "UNIVERSITY", address: "71 Al-Farabi Ave, Almaty", contact_email: "intl@kaznu.kz", contact_phone: "+7 727 377 3300", license_number: "EDU-KAZNU-003", created_at: daysAgo(380), updated_at: daysAgo(20) },
    ];

    const immigrationUserId = "user-immigration";
    const nuAdminUserId = "user-nu-admin";
    // Linked to student-1 (Chinedu Okafor, NU) and student-6 (Li Wei, KBTU) below —
    // the latter has a PENDING_RENEWAL visa so the demo lands on an interesting state.
    const student1UserId = "user-student-1";
    const student6UserId = "user-student-6";

    const authUsers: AuthUser[] = [
        { id: immigrationUserId, email: "immigration@test.kz", password: "password123", user_metadata: { full_name: "Aizhan Nurlanovna", role: "IMMIGRATION" }, created_at: daysAgo(400) },
        { id: nuAdminUserId, email: "admin@nu.edu.kz", password: "password123", user_metadata: { full_name: "Serik Bolatov", role: "INSTITUTION" }, created_at: daysAgo(400) },
        { id: student1UserId, email: "chinedu.okafor@student.kz", password: "password123", user_metadata: { full_name: "Chinedu Okafor", role: "STUDENT" }, created_at: daysAgo(300) },
        { id: student6UserId, email: "li.wei@student.kz", password: "password123", user_metadata: { full_name: "Li Wei", role: "STUDENT" }, created_at: daysAgo(275) },
    ];

    const profiles = [
        { user_id: immigrationUserId, role: "IMMIGRATION", institution_id: null, student_id: null, full_name: "Aizhan Nurlanovna", created_at: daysAgo(400), updated_at: daysAgo(400) },
        { user_id: nuAdminUserId, role: "INSTITUTION", institution_id: instNU, student_id: null, full_name: "Serik Bolatov", created_at: daysAgo(400), updated_at: daysAgo(400) },
        { user_id: student1UserId, role: "STUDENT", institution_id: instNU, student_id: "student-1", full_name: "Chinedu Okafor", created_at: daysAgo(300), updated_at: daysAgo(300) },
        { user_id: student6UserId, role: "STUDENT", institution_id: instKBTU, student_id: "student-6", full_name: "Li Wei", created_at: daysAgo(275), updated_at: daysAgo(275) },
    ];

    // [name, nationality, institution, visaStatus, visaEndOffsetDays, program]
    const roster: Array<[string, string, string, string, number, string]> = [
        ["Chinedu Okafor", "Nigeria", instNU, "ACTIVE", 240, "Computer Science"],
        ["Amina Yusuf", "Nigeria", instNU, "ACTIVE", 18, "Petroleum Engineering"],
        ["Rahul Sharma", "India", instNU, "ACTIVE", 5, "Data Science"],
        ["Fatima Zahra", "Egypt", instKBTU, "ACTIVE", 300, "Business Administration"],
        ["Ahmet Yilmaz", "Turkey", instKBTU, "ACTIVE", 45, "Mechanical Engineering"],
        ["Li Wei", "China", instKBTU, "PENDING_RENEWAL", 12, "Finance"],
        ["Jamshid Karimov", "Uzbekistan", instKBTU, "ACTIVE", 180, "Information Systems"],
        ["Bekzat Amanov", "Uzbekistan", instKazNU, "EXPIRED", -20, "Law"],
        ["Otgonbayar Batbold", "Mongolia", instKazNU, "ACTIVE", 210, "International Relations"],
        ["Grace Adebayo", "Nigeria", instKazNU, "ACTIVE", 90, "Medicine"],
        ["Min-jun Park", "South Korea", instNU, "ACTIVE", 150, "Robotics"],
        ["Elena Volkova", "Russia", instKBTU, "ACTIVE", 60, "Architecture"],
        ["Hassan Ibrahim", "Pakistan", instKazNU, "EXPIRED", -5, "Civil Engineering"],
        ["Sara Ahmed", "Pakistan", instNU, "ACTIVE", 270, "Economics"],
    ];

    const students: Record<string, unknown>[] = [];
    const visas: Record<string, unknown>[] = [];
    const attendance_records: Record<string, unknown>[] = [];
    const student_cards: Record<string, unknown>[] = [];
    const blockchain_ledger: Record<string, unknown>[] = [];
    const verification_requests: Record<string, unknown>[] = [];
    const audit_logs: Record<string, unknown>[] = [];

    roster.forEach(([full_name, nationality, institution_id, visaStatus, endOffset, program], idx) => {
        const studentId = `student-${idx + 1}`;
        const cardId = `card-${idx + 1}`;
        const recordHash = `seedhash${idx + 1}${studentId}`.padEnd(64, "0").slice(0, 64);
        const txId = "tx_" + recordHash.slice(0, 16);

        students.push({
            id: studentId,
            institution_id,
            student_id_number: `${institution_id.toUpperCase().replace("INST-", "")}-${2024_000 + idx}`,
            full_name,
            nationality,
            passport_number: `P${100000 + idx}`,
            date_of_birth: `${1999 + (idx % 6)}-0${(idx % 9) + 1}-1${idx % 9}`,
            email: `${full_name.toLowerCase().replace(/[^a-z]+/g, ".")}@student.kz`,
            phone: `+7 70${idx}1234567`.slice(0, 15),
            metadata: { program },
            created_at: daysAgo(300 - idx * 5),
            updated_at: daysAgo(10),
        });

        visas.push({
            id: `visa-${idx + 1}`,
            student_id: studentId,
            visa_type: "Student Visa (Type D)",
            visa_number: `VN-${300000 + idx}`,
            start_date: daysAgo(300 - idx * 5),
            end_date: daysFromNow(endOffset),
            status: visaStatus,
            metadata: {},
            created_at: daysAgo(300 - idx * 5),
            updated_at: daysAgo(10),
        });

        // A handful of attendance records per student
        for (let d = 0; d < 5; d++) {
            attendance_records.push({
                id: uid(),
                student_id: studentId,
                attendance_date: daysAgo(d * 7),
                status: d === 2 && idx % 4 === 0 ? "ABSENT" : d === 1 && idx % 5 === 0 ? "LATE" : "PRESENT",
                notes: null,
                created_at: daysAgo(d * 7),
            });
        }

        student_cards.push({
            id: cardId,
            student_id: studentId,
            institution_id,
            status: visaStatus === "EXPIRED" ? "EXPIRED" : "ACTIVE",
            token_version: 1,
            record_hash: recordHash,
            blockchain_tx_id: txId,
            created_at: daysAgo(250 - idx * 5),
            updated_at: daysAgo(10),
        });

        blockchain_ledger.push({
            id: uid(),
            card_id: cardId,
            record_hash: recordHash,
            blockchain_tx_id: txId,
            created_at: daysAgo(250 - idx * 5),
        });
    });

    // A few historical verification scans and audit entries for realism
    verification_requests.push(
        { id: uid(), student_id: "student-1", card_id: "card-1", institution_id: instNU, verified_by: immigrationUserId, verification_type: "QR_SCAN", result: { status: "VALID" }, reason: null, user_agent: null, device_id: null, client_ip: null, created_at: daysAgo(2) },
        { id: uid(), student_id: "student-8", card_id: "card-8", institution_id: instKazNU, verified_by: immigrationUserId, verification_type: "QR_SCAN", result: { status: "INVALID" }, reason: "card_expired", user_agent: null, device_id: null, client_ip: null, created_at: daysAgo(1) },
    );
    audit_logs.push(
        { id: uid(), user_id: nuAdminUserId, action: "CREATE", table_name: "students", record_id: "student-1", changes: { seed: true }, created_at: daysAgo(300) },
        { id: uid(), user_id: immigrationUserId, action: "ISSUE_CARD", table_name: "student_cards", record_id: "card-1", changes: { seed: true }, created_at: daysAgo(250) },
    );

    // Li Wei's visa is already PENDING_RENEWAL with 12 days left — a pending
    // renewal request against it lands the demo on a realistic in-progress state.
    const visa_renewal_requests: Record<string, unknown>[] = [
        {
            id: uid(),
            student_id: "student-6",
            visa_id: "visa-6",
            institution_id: instKBTU,
            requested_end_date: daysFromNow(377),
            reason: "Continuing into my final semester of the Finance program; current visa expires before my program end date.",
            status: "PENDING",
            reviewed_by: null,
            review_note: null,
            created_at: daysAgo(3),
            updated_at: daysAgo(3),
        },
        {
            id: uid(),
            student_id: "student-1",
            visa_id: "visa-1",
            institution_id: instNU,
            requested_end_date: daysFromNow(240),
            reason: "Routine annual renewal ahead of expiry.",
            status: "APPROVED",
            reviewed_by: nuAdminUserId,
            review_note: "Approved — documents on file.",
            created_at: daysAgo(200),
            updated_at: daysAgo(195),
        },
    ];

    const messages: Record<string, unknown>[] = [
        {
            id: uid(),
            student_id: "student-1",
            institution_id: instNU,
            sender_role: "INSTITUTION",
            sender_name: "Serik Bolatov",
            body: "Welcome to Nazarbayev University! Let us know if you have any questions about your visa or attendance requirements.",
            read: true,
            created_at: daysAgo(280),
        },
        {
            id: uid(),
            student_id: "student-1",
            institution_id: instNU,
            sender_role: "STUDENT",
            sender_name: "Chinedu Okafor",
            body: "Thank you! Quick question — where can I update my phone number on file?",
            read: true,
            created_at: daysAgo(279),
        },
        {
            id: uid(),
            student_id: "student-6",
            institution_id: instKBTU,
            sender_role: "STUDENT",
            sender_name: "Li Wei",
            body: "Hi, I've just submitted a visa renewal request since mine expires soon. Could you confirm it's been received?",
            read: false,
            created_at: daysAgo(3),
        },
    ];

    const today = new Date().toISOString().split("T")[0];
    const activeVisas = visas.filter((v) => v.status === "ACTIVE").length;
    const overdue = visas.filter((v) => v.status === "ACTIVE" && (v.end_date as string) < today).length;
    const highRisk = visas.filter((v) => v.status === "EXPIRED" || (v.status === "ACTIVE" && (v.end_date as string) < daysFromNow(7))).length;

    const analytics_summary = [
        {
            id: uid(),
            total_students: students.length,
            active_visas: activeVisas,
            overdue_notifications: overdue,
            high_risk_alerts: highRisk,
            updated_at: new Date().toISOString(),
        },
    ];

    return {
        authUsers,
        institutions,
        profiles,
        students,
        visas,
        attendance_records,
        verification_requests,
        audit_logs,
        student_cards,
        blockchain_ledger,
        analytics_summary,
        visa_renewal_requests,
        messages,
    };
}

let db: DbShape | null = null;

export function getDb(): DbShape {
    if (db) return db;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            db = JSON.parse(raw) as DbShape;
            return db;
        }
    } catch {
        // fall through to reseed
    }
    db = buildSeed();
    persist();
    return db;
}

export function persist() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch {
        // storage full/unavailable — demo continues in-memory only
    }
}

export function resetDb() {
    db = buildSeed();
    persist();
}
