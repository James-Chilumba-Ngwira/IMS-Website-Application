// Minimal stand-in for supabase-js's GoTrue auth client — session persisted
// to localStorage, backed by the seeded demo users in store.ts.

import { getDb, uid } from "./store";

const SESSION_KEY = "ims_mock_session_v2";

export interface MockUser {
    id: string;
    email: string;
    user_metadata: Record<string, unknown>;
}
export interface MockSession {
    access_token: string;
    user: MockUser;
}

type AuthChangeCallback = (event: string, session: MockSession | null) => void;
const listeners = new Set<AuthChangeCallback>();

function readSession(): MockSession | null {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        return raw ? (JSON.parse(raw) as MockSession) : null;
    } catch {
        return null;
    }
}

function writeSession(session: MockSession | null) {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
}

function emit(event: string, session: MockSession | null) {
    listeners.forEach((cb) => cb(event, session));
}

async function signInWithPassword({ email, password }: { email: string; password: string }) {
    const db = getDb();
    const account = db.authUsers.find((u) => u.email === email);
    if (!account || account.password !== password) {
        return { data: { user: null, session: null }, error: { message: "Invalid login credentials" } };
    }
    const user: MockUser = { id: account.id, email: account.email, user_metadata: account.user_metadata };
    const session: MockSession = { access_token: "mock-" + uid(), user };
    writeSession(session);
    emit("SIGNED_IN", session);
    return { data: { user, session }, error: null };
}

async function signUp({
    email,
    password,
    options,
}: {
    email: string;
    password: string;
    options?: { data?: { full_name?: string; role?: string } };
}) {
    const db = getDb();
    if (db.authUsers.some((u) => u.email === email)) {
        return { data: { user: null, session: null }, error: { message: "User already registered" } };
    }
    const id = uid();
    const metadata = options?.data ?? {};
    db.authUsers.push({ id, email, password, user_metadata: metadata, created_at: new Date().toISOString() });
    const user: MockUser = { id, email, user_metadata: metadata };
    const session: MockSession = { access_token: "mock-" + uid(), user };
    writeSession(session);
    emit("SIGNED_IN", session);
    return { data: { user, session }, error: null };
}

async function signOut() {
    writeSession(null);
    emit("SIGNED_OUT", null);
    return { error: null };
}

async function getSession() {
    return { data: { session: readSession() }, error: null };
}

async function getUser() {
    const session = readSession();
    return { data: { user: session?.user ?? null }, error: null };
}

function onAuthStateChange(callback: AuthChangeCallback) {
    listeners.add(callback);
    return {
        data: {
            subscription: {
                unsubscribe: () => listeners.delete(callback),
            },
        },
    };
}

export const auth = {
    signInWithPassword,
    signUp,
    signOut,
    getSession,
    getUser,
    onAuthStateChange,
};
