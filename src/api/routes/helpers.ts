/**
 * Shared route helpers — response builders and auth checks.
 */

import type { WorkerEnv } from "../db/supabase.ts";

// ── Response helpers ─────────────────────────────────────────
export function jsonOk<T>(data: T, status = 200): Response {
    return new Response(JSON.stringify({ ok: true, data }), {
        status,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
    });
}

export function jsonError(error: string, status = 400): Response {
    return new Response(JSON.stringify({ ok: false, error }), {
        status,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
    });
}

export function corsHeaders(): Response {
    return new Response(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
    });
}

// ── Auth helpers ─────────────────────────────────────────────
interface AuthSuccess { ok: true; userId: string; userType: string }
interface AuthFailure { ok: false; error: string }
type AuthResult = AuthSuccess | AuthFailure;

/**
 * Validates the Bearer JWT from the request against Supabase.
 * Returns the user's id and user_type if valid.
 */
export async function verifyToken(
    req: Request,
    env: WorkerEnv
): Promise<AuthResult> {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        return { ok: false, error: "Missing authorization token" };
    }

    const token = authHeader.slice(7);

    // Validate against Supabase Auth
    const res = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
        headers: {
            "Authorization": `Bearer ${token}`,
            "apikey": env.SUPABASE_ANON_KEY,
        },
    });

    if (!res.ok) return { ok: false, error: "Invalid or expired token" };

    const user = await res.json() as { id: string; user_metadata?: { user_type?: string } };

    // Also check profiles table for user_type (source of truth)
    const profileRes = await fetch(
        `${env.SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}&select=user_type,is_active`,
        {
            headers: {
                "Authorization": `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
                "apikey": env.SUPABASE_SERVICE_ROLE_KEY,
            },
        }
    );

    if (!profileRes.ok) return { ok: false, error: "Could not verify user profile" };

    const profiles = await profileRes.json() as Array<{ user_type: string; is_active: boolean }>;
    const profile = profiles[0];

    if (!profile) return { ok: false, error: "User profile not found" };
    if (!profile.is_active) return { ok: false, error: "Account is deactivated" };

    return { ok: true, userId: user.id, userType: profile.user_type };
}

/** Shortcut: requires admin user_type */
export async function requireAdmin(
    req: Request,
    env: WorkerEnv
): Promise<AuthResult> {
    const result = await verifyToken(req, env);
    if (!result.ok) return result;
    if (result.userType !== "admin") {
        return { ok: false, error: "Admin access required" };
    }
    return result;
}
