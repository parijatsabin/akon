/**
 * AuthContext — Supabase Auth backed.
 *
 * Replaces the previous hardcoded SHA-256 credential store.
 * Uses Supabase email/password auth via the REST API directly
 * (no SDK — keeps the bundle small, Worker-compatible pattern).
 *
 * After login:
 *  - Supabase access_token stored in sessionStorage (8-hour TTL)
 *  - api client picks it up automatically via setApiToken()
 *  - user_type checked from profiles table → routes admin to /admin
 *
 * Future mobile app: same Supabase project, same auth flow,
 * different client (React Native / Expo).
 */

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from "react";
import { setApiToken, clearApiToken } from "../../api/client.ts";

// ── Supabase REST auth endpoints ──────────────────────────────
// VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are injected at
// build time by Vite from .env (public, safe to expose in browser).
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// ── Session storage ───────────────────────────────────────────
const SESSION_KEY = "anok_sb_session";

interface StoredSession {
    access_token: string;
    refresh_token: string;
    expires_at: number;   // unix timestamp (seconds)
    user_id: string;
    username: string;
    user_type: "customer" | "admin";
}

function readSession(): StoredSession | null {
    try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        const s = JSON.parse(raw) as StoredSession;
        // Treat as expired 60 s early to avoid edge-case race
        if (Date.now() / 1000 > s.expires_at - 60) {
            sessionStorage.removeItem(SESSION_KEY);
            return null;
        }
        return s;
    } catch {
        return null;
    }
}

function writeSession(s: StoredSession): void {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
}

function clearSession(): void {
    sessionStorage.removeItem(SESSION_KEY);
}

// ── Context shape ─────────────────────────────────────────────
interface AuthContextValue {
    isAuthenticated: boolean;
    userType: "customer" | "admin" | null;
    username: string | null;
    userId: string | null;
    login: (email: string, password: string) => Promise<{ ok: boolean; error?: string; userType?: "customer" | "admin" }>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<StoredSession | null>(() => {
        const s = readSession();
        if (s) setApiToken(s.access_token);
        return s;
    });

    // Re-validate session every minute
    useEffect(() => {
        const id = setInterval(() => {
            const s = readSession();
            if (!s) {
                clearApiToken();
                setSession(null);
            }
        }, 60_000);
        return () => clearInterval(id);
    }, []);

    const login = useCallback(
        async (
            email: string,
            password: string
        ): Promise<{ ok: boolean; error?: string; userType?: "customer" | "admin" }> => {

            // 1. Authenticate via Supabase Auth REST
            const authRes = await fetch(
                `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "apikey": SUPABASE_ANON_KEY,
                    },
                    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
                }
            );

            if (!authRes.ok) {
                const err = await authRes.json().catch(() => ({})) as { error_description?: string };
                return {
                    ok: false,
                    error: err.error_description ?? "Invalid email or password.",
                };
            }

            const authData = await authRes.json() as {
                access_token: string;
                refresh_token: string;
                expires_in: number;
                user: { id: string; email: string };
            };

            // 2. Fetch user_type from profiles table via the Worker API
            //    We set the token first so the API call is authenticated.
            setApiToken(authData.access_token);

            const profileRes = await fetch(
                `${SUPABASE_URL}/rest/v1/profiles?id=eq.${authData.user.id}&select=user_type,is_active`,
                {
                    headers: {
                        "Authorization": `Bearer ${authData.access_token}`,
                        "apikey": SUPABASE_ANON_KEY,
                    },
                }
            );

            let userType: "customer" | "admin" = "customer";

            if (profileRes.ok) {
                const profiles = await profileRes.json() as Array<{ user_type: string; is_active: boolean }>;
                const profile = profiles[0];
                if (profile?.is_active === false) {
                    clearApiToken();
                    return { ok: false, error: "This account has been deactivated." };
                }
                if (profile?.user_type === "admin" || profile?.user_type === "customer") {
                    userType = profile.user_type;
                }
            }

            // 3. Persist session
            const stored: StoredSession = {
                access_token: authData.access_token,
                refresh_token: authData.refresh_token,
                expires_at: Math.floor(Date.now() / 1000) + authData.expires_in,
                user_id: authData.user.id,
                username: authData.user.email.split("@")[0],
                user_type: userType,
            };

            writeSession(stored);
            setSession(stored);

            return { ok: true, userType };
        },
        []
    );

    const logout = useCallback(async () => {
        // Revoke the Supabase session
        const token = session?.access_token;
        if (token) {
            await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "apikey": SUPABASE_ANON_KEY,
                },
            }).catch(() => {/* ignore network errors on logout */ });
        }
        clearSession();
        clearApiToken();
        setSession(null);
    }, [session]);

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated: session !== null,
                userType: session?.user_type ?? null,
                username: session?.username ?? null,
                userId: session?.user_id ?? null,
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
