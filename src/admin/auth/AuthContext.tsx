/**
 * Auth layer — real Supabase Auth.
 *
 * What this replaced: a sha256 of "admin123" hardcoded in the client bundle,
 * plus a sessionStorage flag with a random nonce nobody ever verified. There
 * was no server, so the route guard was decorative — anyone could set the
 * key by hand. Now the session is a signed JWT issued by Supabase, and every
 * request it authorises is checked again by RLS in the database.
 *
 * USERNAME vs EMAIL: the CMS asks for a username. Supabase Auth is
 * email-based, so a username maps to a synthetic internal address
 * <username>@auth.anok.local that receives no mail and exists only as an
 * auth identity. The real username lives in profiles.username, unique.
 * See MIGRATION.md §2 decision 1.
 *
 * The login() signature is unchanged from the old implementation, so
 * LoginPage did not need editing.
 */

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";

const AUTH_EMAIL_DOMAIN = "auth.anok.local";

/** Mirrors the app_role enum in migration 0001. */
export type AppRole = "superadmin" | "admin";

export interface Profile {
    id: string;
    username: string;
    full_name: string;
    role: AppRole;
    is_active: boolean;
}

interface AuthContextValue {
    isAuthenticated: boolean;
    /** True until the initial session lookup finishes. Guards must wait on it. */
    loading: boolean;
    username: string | null;
    profile: Profile | null;
    role: AppRole | null;
    isSuperadmin: boolean;
    login: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    /**
     * Loads the caller's own profile row. Readable because of the "staff read
     * profiles" policy; an anonymous caller gets nothing, which is intended.
     */
    const loadProfile = useCallback(async (userId: string): Promise<Profile | null> => {
        const { data, error } = await supabase
            .from("profiles")
            .select("id, username, full_name, role, is_active")
            .eq("id", userId)
            .maybeSingle();

        if (error) {
            console.error("[auth] Could not load profile.", error);
            return null;
        }
        return (data as Profile) ?? null;
    }, []);

    useEffect(() => {
        let cancelled = false;

        // Restore an existing session on mount, so a page refresh inside
        // /admin does not bounce the user back to the login screen.
        supabase.auth.getSession().then(async ({ data }) => {
            if (cancelled) return;
            if (data.session) {
                const p = await loadProfile(data.session.user.id);
                if (cancelled) return;
                setSession(data.session);
                setProfile(p);
            }
            setLoading(false);
        });

        // Supabase refreshes the token on its own; no polling interval needed.
        const { data: sub } = supabase.auth.onAuthStateChange(async (_event, next) => {
            if (cancelled) return;
            setSession(next);
            setProfile(next ? await loadProfile(next.user.id) : null);
        });

        return () => {
            cancelled = true;
            sub.subscription.unsubscribe();
        };
    }, [loadProfile]);

    const login = useCallback(
        async (username: string, password: string): Promise<{ ok: boolean; error?: string }> => {
            const clean = username.trim().toLowerCase();
            if (!clean || !password) return { ok: false, error: "Invalid credentials." };

            const { data, error } = await supabase.auth.signInWithPassword({
                email: `${clean}@${AUTH_EMAIL_DOMAIN}`,
                password,
            });

            // Deliberately generic: distinguishing "no such user" from "wrong
            // password" tells an attacker which usernames exist.
            if (error || !data.session) return { ok: false, error: "Invalid credentials." };

            const p = await loadProfile(data.session.user.id);

            // A deactivated account can still authenticate — is_active is our
            // flag, not Supabase's — so it has to be rejected here. RLS would
            // deny every action anyway, but the user deserves to know why.
            if (!p || !p.is_active) {
                await supabase.auth.signOut();
                return { ok: false, error: "This account has been deactivated." };
            }

            setSession(data.session);
            setProfile(p);
            return { ok: true };
        },
        [loadProfile]
    );

    const logout = useCallback(async () => {
        await supabase.auth.signOut();
        setSession(null);
        setProfile(null);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated: session !== null && profile !== null && profile.is_active,
                loading,
                username: profile?.username ?? null,
                profile,
                role: profile?.role ?? null,
                isSuperadmin: profile?.role === "superadmin",
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
    return ctx;
}
