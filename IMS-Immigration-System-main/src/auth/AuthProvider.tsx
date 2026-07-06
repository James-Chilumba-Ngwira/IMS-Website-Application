import React from "react";
import { supabase } from "../lib/supabaseClient";
import type { Profile } from "../types/database.types";

type AuthContextValue = {
    user: any | null;
    profile: Profile | null;
    loading: boolean;
    signOut: () => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, metadata?: { full_name: string; role: 'IMMIGRATION' | 'INSTITUTION' | 'STUDENT' }) => Promise<any>;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = React.useState<any | null>(null);
    const [profile, setProfile] = React.useState<Profile | null>(null);
    const [loading, setLoading] = React.useState(true);

    const fetchProfile = async (userId: string) => {
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", userId)
            .single();

        if (!error && data) {
            setProfile(data as Profile);
        }
    };

    React.useEffect(() => {
        let mounted = true;

        supabase.auth.getSession().then(({ data }) => {
            if (!mounted) return;
            const sessionUser = data.session?.user ?? null;
            setUser(sessionUser);
            if (sessionUser) {
                fetchProfile(sessionUser.id);
            }
            setLoading(false);
        });

        const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
            const sessionUser = session?.user ?? null;
            setUser(sessionUser);
            if (sessionUser) {
                fetchProfile(sessionUser.id);
            } else {
                setProfile(null);
            }
            setLoading(false);
        });

        return () => {
            mounted = false;
            sub.subscription.unsubscribe();
        };
    }, []);

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
    };

    const signUp = async (email: string, password: string, metadata?: { full_name: string; role: 'IMMIGRATION' | 'INSTITUTION' | 'STUDENT' }) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata
            }
        });

        if (error) throw error;

        // If your DB has a trigger to create profiles from auth.users, this might be redundant.
        // But many IMS setups use a manual insert or a trigger. 
        // Based on previous history, we manually insert profiles if the trigger isn't there.
        if (data.user && metadata) {
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    user_id: data.user.id,
                    full_name: metadata.full_name,
                    role: metadata.role
                });
            if (profileError) console.error("Profile creation error:", profileError);
        }

        return data;
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, signOut, signIn, signUp }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = React.useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
}