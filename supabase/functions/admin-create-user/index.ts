/**
 * admin-create-user — the only place the service-role key is used at runtime.
 *
 * WHY THIS EXISTS. Creating a Supabase Auth user requires
 * `auth.admin.createUser`, which requires the service-role key, and that key
 * can never reach the browser. So no arrangement of RLS policies can let the
 * CMS create an admin on its own: the policies would let it insert a
 * `profiles` row, but there would be no login behind it. This function is the
 * server the CMS otherwise does not have. See MIGRATION.md §4.
 *
 * Three actions live here rather than three functions, because the thing worth
 * isolating is the key, and one function means one place holding it:
 *
 *   create          auth.admin.createUser
 *   reset-password  auth.admin.updateUserById
 *   delete          auth.admin.deleteUser  (cascades to profiles)
 *
 * Deactivate, rename and role changes are deliberately absent: they are
 * ordinary `profiles` writes that the superadmin RLS policies already allow
 * from the browser. Routing them through here would add a privileged path for
 * something that does not need one.
 *
 * AUTHORISATION. Every request is checked twice over, by two mechanisms that
 * fail independently:
 *
 *   1. Here — a client bound to the CALLER's JWT reads their own profile under
 *      RLS. Not a superadmin, or not active → 403. Reading it *as them* rather
 *      than with the service key is the point: a forged user id gets the
 *      forger's own row, not the one they named.
 *   2. In the database — guard_profile_write() refuses `superadmin` from any
 *      API caller, and guard_last_superadmin_delete() refuses to remove the
 *      last one. Those triggers hold even if everything in this file is wrong.
 *
 * `verify_jwt = false` in config.toml is deliberate, not an oversight: the JWT
 * is verified below, so a non-superadmin gets a clean 403 with a readable
 * message instead of an opaque gateway rejection.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.10";

/** Matches AUTH_EMAIL_DOMAIN in AuthContext.tsx and bootstrap-superadmin.ts. */
const AUTH_EMAIL_DOMAIN = "auth.anok.local";

/** `profiles.username` is citext with a length >= 3 CHECK; this is stricter. */
const USERNAME_RE = /^[a-z0-9_]{3,32}$/;

/**
 * Ambiguous glyphs are omitted (0/O, 1/l/I) because these passwords are read
 * off a screen and typed by hand or dictated — there is no email to click.
 */
const PASSWORD_ALPHABET = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const PASSWORD_GROUPS = 5;
const GROUP_SIZE = 4;

const CORS_HEADERS: Record<string, string> = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Body {
    action?: "create" | "reset-password" | "delete";
    username?: string;
    fullName?: string;
    userId?: string;
}

function json(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
}

const fail = (message: string, status: number) => json({ error: message }, status);

/**
 * Rejection sampling rather than `% alphabet.length`: the modulo would make
 * the first few characters of the alphabet fractionally likelier, and there is
 * no reason to accept a biased password when discarding a byte is free.
 */
function generatePassword(): string {
    const out: string[] = [];
    const bytes = new Uint8Array(1);

    for (let g = 0; g < PASSWORD_GROUPS; g++) {
        let group = "";
        while (group.length < GROUP_SIZE) {
            crypto.getRandomValues(bytes);
            const limit = 256 - (256 % PASSWORD_ALPHABET.length);
            if (bytes[0] >= limit) continue;
            group += PASSWORD_ALPHABET[bytes[0] % PASSWORD_ALPHABET.length];
        }
        out.push(group);
    }
    return out.join("-");
}

Deno.serve(async (req: Request): Promise<Response> => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
    if (req.method !== "POST") return fail("Method not allowed.", 405);

    const url = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    // All three are injected by the platform. Missing means a broken deploy,
    // not a bad request — say so rather than returning a confusing 401.
    if (!url || !anonKey || !serviceKey) {
        console.error("[admin-create-user] Missing platform environment variables.");
        return fail("The server is misconfigured.", 500);
    }

    // ── 1. Who is calling? ────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return fail("Not signed in.", 401);

    const asCaller = createClient(url, anonKey, {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: userData, error: userErr } = await asCaller.auth.getUser();
    if (userErr || !userData?.user) return fail("Not signed in.", 401);
    const callerId = userData.user.id;

    // Read under RLS, as them. The "staff read profiles" policy lets any active
    // admin see this row; an inactive or absent profile reads as nothing.
    const { data: caller, error: callerErr } = await asCaller
        .from("profiles")
        .select("id, role, is_active")
        .eq("id", callerId)
        .maybeSingle();

    if (callerErr) {
        console.error("[admin-create-user] Could not read the caller's profile.", callerErr);
        return fail("Could not verify your account.", 500);
    }
    if (!caller || !caller.is_active || caller.role !== "superadmin") {
        return fail("Only a superadmin can manage users.", 403);
    }

    // ── 2. What are they asking for? ──────────────────────────
    let body: Body;
    try {
        body = await req.json();
    } catch {
        return fail("Malformed request body.", 400);
    }

    const admin = createClient(url, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
    });

    switch (body.action) {
        case "create":
            return await createAdmin(admin, body, callerId);
        case "reset-password":
            return await resetPassword(admin, body, callerId);
        case "delete":
            return await deleteAdmin(admin, body, callerId);
        default:
            return fail("Unknown action.", 400);
    }
});

// ══════════════════════════════════════════════════════════════
// Actions
// ══════════════════════════════════════════════════════════════

type Admin = ReturnType<typeof createClient>;

/**
 * Loads the account an action names, and refuses if it is a superadmin.
 *
 * Superadmins are bootstrap-only in both directions: `guard_profile_write()`
 * stops the CMS minting one, and this stops the CMS resetting or deleting one.
 * Changing that account stays a deliberate act at the command line
 * (`npm run bootstrap`), which is the right amount of friction for the only
 * credential that can hand out further access.
 */
async function loadTarget(
    admin: Admin, userId: string | undefined, callerId: string
): Promise<{ target: { id: string; username: string }; error?: undefined } | { target?: undefined; error: Response }> {
    if (!userId || typeof userId !== "string") {
        return { error: fail("No account was named.", 400) };
    }
    if (userId === callerId) {
        return { error: fail("You cannot do this to your own account.", 400) };
    }

    const { data, error } = await admin
        .from("profiles")
        .select("id, username, role")
        .eq("id", userId)
        .maybeSingle();

    if (error) {
        console.error("[admin-create-user] Could not read the target profile.", error);
        return { error: fail("Could not read that account.", 500) };
    }
    if (!data) return { error: fail("That account no longer exists.", 404) };
    if (data.role === "superadmin") {
        return { error: fail("A superadmin account can only be changed from the command line.", 403) };
    }

    return { target: { id: data.id as string, username: data.username as string } };
}

async function createAdmin(admin: Admin, body: Body, callerId: string): Promise<Response> {
    const username = (body.username ?? "").trim().toLowerCase();
    const fullName = (body.fullName ?? "").trim();

    if (!USERNAME_RE.test(username)) {
        return fail(
            "A username must be 3–32 characters, using lowercase letters, numbers or underscores.",
            400
        );
    }

    // Checked here for a readable message; `profiles.username` is unique, so
    // the database is what actually guarantees it.
    const { data: taken, error: takenErr } = await admin
        .from("profiles").select("id").eq("username", username).maybeSingle();

    if (takenErr) {
        console.error("[admin-create-user] Username lookup failed.", takenErr);
        return fail("Could not check that username.", 500);
    }
    if (taken) return fail(`The username "${username}" is already taken.`, 409);

    const password = generatePassword();

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email: `${username}@${AUTH_EMAIL_DOMAIN}`,
        password,
        // Nothing can be confirmed: the address is synthetic and receives no
        // mail. Without this the account exists but cannot sign in.
        email_confirm: true,
        user_metadata: { username, full_name: fullName },
    });

    if (createErr || !created?.user) {
        console.error("[admin-create-user] createUser failed.", createErr);
        return fail(createErr?.message ?? "Could not create the account.", 500);
    }

    // handle_new_user() already inserted the profile, with role defaulting to
    // 'admin' — the role is never sent from here, so there is no path by which
    // a bad request could raise it. This only records who did the creating.
    const { error: stampErr } = await admin
        .from("profiles")
        .update({ created_by: callerId, full_name: fullName })
        .eq("id", created.user.id);

    // A half-made account — an auth identity with no usable profile — is worse
    // than none, and it would hold the username hostage. Roll it back.
    if (stampErr) {
        console.error("[admin-create-user] Profile stamp failed; rolling back.", stampErr);
        await admin.auth.admin.deleteUser(created.user.id);
        return fail("Could not finish creating the account. Nothing was saved.", 500);
    }

    return json({ username, password });
}

async function resetPassword(admin: Admin, body: Body, callerId: string): Promise<Response> {
    const { target, error } = await loadTarget(admin, body.userId, callerId);
    if (error) return error;

    const password = generatePassword();

    const { error: pwErr } = await admin.auth.admin.updateUserById(target.id, { password });
    if (pwErr) {
        console.error("[admin-create-user] Password reset failed.", pwErr);
        return fail(pwErr.message, 500);
    }

    return json({ username: target.username, password });
}

async function deleteAdmin(admin: Admin, body: Body, callerId: string): Promise<Response> {
    const { target, error } = await loadTarget(admin, body.userId, callerId);
    if (error) return error;

    // Deleting the auth user cascades to `profiles` (0001: the id column is
    // `references auth.users(id) on delete cascade`). Deleting the profile row
    // instead would strand the auth identity and keep the username reserved
    // forever, since the synthetic email would still exist.
    const { error: delErr } = await admin.auth.admin.deleteUser(target.id);
    if (delErr) {
        console.error("[admin-create-user] Delete failed.", delErr);
        return fail(delErr.message, 500);
    }

    return json({ username: target.username });
}
