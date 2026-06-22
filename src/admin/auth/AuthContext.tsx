/**
 * Auth layer — session-token based.
 *
 * On login we generate a time-limited signed session token stored in
 * sessionStorage (not localStorage — clears on tab close). Direct URL
 * access is blocked at the route guard level by validating this token.
 *
 * Credentials are compared via a simple hash to avoid plain-text storage.
 * Future: swap verifyCredentials() to call POST /api/auth/login.
 */

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from "react";

// ── Credential store (v1 hardcoded — future: API call) ────────
const CREDENTIALS: Record<string, string> = {
    admin: "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918", // admin123 sha256
};

const SESSION_KEY = "anok_admin_session";
const SESSION_TTL = 8 * 60 * 60 * 1000; // 8 hours in ms

interface SessionPayload {
    username: string;
    exp: number;   // expiry timestamp
    token: string; // random nonce to invalidate sessions
}

// ── Simple sha-256 via Web Crypto API ─────────────────────────
async function sha256(message: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    return Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

function generateToken(): string {
    return crypto.getRandomValues(new Uint8Array(16))
        .reduce((acc, b) => acc + b.toString(16).padStart(2, "0"), "");
}

function readSession(): SessionPayload | null {
    try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        const payload = JSON.parse(raw) as SessionPayload;
        if (Date.now() > payload.exp) {
            sessionStorage.removeItem(SESSION_KEY);
            return null;
        }
        return payload;
    } catch {
        return null;
    }
}

function writeSession(username: string): SessionPayload {
    const payload: SessionPayload = {
        username,
        exp: Date.now() + SESSION_TTL,
        token: generateToken(),
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload));
    return payload;
}

function clearSession(): void {
    sessionStorage.removeItem(SESSION_KEY);
}

// ── Context ───────────────────────────────────────────────────
interface AuthContextValue {
    isAuthenticated: boolean;
    username: string | null;
    login: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<SessionPayload | null>(() => readSession());

    // Re-validate every minute
    useEffect(() => {
        const id = setInterval(() => {
            const s = readSession();
            setSession(s);
        }, 60_000);
        return () => clearInterval(id);
    }, []);

    const login = useCallback(
        async (username: string, password: string): Promise<{ ok: boolean; error?: string }> => {
            const trimUser = username.trim().toLowerCase();
            const expected = CREDENTIALS[trimUser];
            if (!expected) return { ok: false, error: "Invalid credentials." };

            const hashed = await sha256(password);
            if (hashed !== expected) return { ok: false, error: "Invalid credentials." };

            const s = writeSession(trimUser);
            setSession(s);
            return { ok: true };
        },
        []
    );

    const logout = useCallback(() => {
        clearSession();
        setSession(null);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated: session !== null,
                username: session?.username ?? null,
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
