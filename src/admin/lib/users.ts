/**
 * User administration — the CMS half of the account model.
 *
 * The split here is the whole design, so it is worth stating plainly: an
 * operation goes through the `admin-create-user` edge function if and only if
 * it needs the service-role key, which the browser will never hold.
 *
 *   through the function      create, resetPassword, remove
 *   straight from the browser listUsers, rename, setActive
 *
 * The second group is not a shortcut. Those are ordinary `profiles` writes,
 * and the superadmin RLS policies in migration 0001 already permit exactly
 * them — sending them through a privileged endpoint would create a second path
 * to guard for no gain. What stops a non-superadmin calling them is the
 * database, not this file.
 *
 * Nothing here re-checks the caller's role before acting. That check belongs
 * in RLS and in the edge function, both of which run somewhere the user cannot
 * edit. The UI hides what you cannot do; it does not decide it.
 */

import { supabase } from "../../lib/supabase";
import type { AppRole } from "../auth/AuthContext";

const FUNCTION_NAME = "admin-create-user";

export interface AdminUser {
    id: string;
    username: string;
    full_name: string;
    role: AppRole;
    is_active: boolean;
    created_at: string;
}

/** A password the server generated and will never show again. */
export interface Credentials {
    username: string;
    password: string;
}

export class UserAdminError extends Error {}

/**
 * Calls the edge function and unwraps its error shape.
 *
 * supabase-js reports a non-2xx as a FunctionsHttpError whose `message` is the
 * generic "Edge Function returned a non-2xx status code" — the actual reason
 * is in the response body. Without this, every failure would surface to the
 * editor as that same meaningless sentence.
 */
async function callFunction<T>(body: Record<string, unknown>): Promise<T> {
    const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, { body });

    if (error) {
        let message = error.message;
        const context = (error as { context?: Response }).context;

        if (context && typeof context.json === "function") {
            try {
                const parsed = (await context.json()) as { error?: string };
                if (parsed?.error) message = parsed.error;
            } catch {
                // Body was not JSON — a gateway or network failure. Keep the
                // original message rather than inventing a better-sounding one.
            }
        }
        throw new UserAdminError(message);
    }

    return data as T;
}

// ── Reads ─────────────────────────────────────────────────────

/**
 * Superadmins first, then oldest account first, so the ordering is stable and
 * a new admin lands at the bottom where the person who just made it is looking.
 */
export async function listUsers(): Promise<AdminUser[]> {
    const { data, error } = await supabase
        .from("profiles")
        .select("id, username, full_name, role, is_active, created_at")
        .order("role", { ascending: true })
        .order("created_at", { ascending: true });

    if (error) throw new UserAdminError(error.message);
    return (data ?? []) as AdminUser[];
}

// ── Privileged: through the edge function ─────────────────────

/** Creates an admin. The role is fixed server-side; it is not a parameter. */
export function createAdmin(username: string, fullName: string): Promise<Credentials> {
    return callFunction<Credentials>({ action: "create", username, fullName });
}

export function resetPassword(userId: string): Promise<Credentials> {
    return callFunction<Credentials>({ action: "reset-password", userId });
}

/** Deletes the auth user; `profiles` follows by cascade. Irreversible. */
export function remove(userId: string): Promise<{ username: string }> {
    return callFunction<{ username: string }>({ action: "delete", userId });
}

// ── Ordinary writes, gated by RLS ─────────────────────────────

export async function rename(userId: string, fullName: string): Promise<void> {
    const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName.trim() })
        .eq("id", userId);

    if (error) throw new UserAdminError(error.message);
}

/**
 * Deactivating is the reversible alternative to deleting, and the one the UI
 * pushes people toward. A deactivated account can still authenticate — Supabase
 * knows nothing about `is_active` — so AuthContext signs it straight back out,
 * and every RLS policy denies it through is_admin(). Two layers, neither of
 * them the UI.
 */
export async function setActive(userId: string, isActive: boolean): Promise<void> {
    const { error } = await supabase
        .from("profiles")
        .update({ is_active: isActive })
        .eq("id", userId);

    // guard_profile_write() raises here if this would strand the last active
    // superadmin, or if someone is editing their own flag. Both arrive as a
    // plain Postgres message, which is clearer than anything invented here.
    if (error) throw new UserAdminError(error.message);
}

// ── Self-service ──────────────────────────────────────────────

/**
 * Changes the signed-in user's own password.
 *
 * No service role and no edge function: Supabase allows a user to update their
 * own credentials with nothing but their session. This exists because there is
 * no other way out of a generated password — the synthetic
 * `<username>@auth.anok.local` address receives no mail, so there is no reset
 * email and no "forgot password" link. Without this page a new admin would be
 * stuck with a random string until a superadmin reset it for them.
 */
export async function changeOwnPassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new UserAdminError(error.message);
}
