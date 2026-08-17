/**
 * bootstrap-superadmin — create the one and only superadmin.
 *
 * Why a script and not a migration: a migration is committed to git forever,
 * and the password must never be. It is read from SUPERADMIN_PASSWORD in
 * .env.local (git-ignored) and goes straight into Supabase Auth, which stores
 * only a bcrypt hash. Nothing here is written to disk.
 *
 * Idempotent: running it twice promotes/repairs the existing account rather
 * than failing or creating a second one.
 *
 *   npm run bootstrap
 */

import { serviceClient, required } from "./lib/env.js";

const AUTH_EMAIL_DOMAIN = "auth.anok.local";
const MIN_PASSWORD_LENGTH = 8;

async function main() {
    const username = required("SUPERADMIN_USERNAME").trim();
    const password = required("SUPERADMIN_PASSWORD");

    if (password.length < MIN_PASSWORD_LENGTH) {
        console.error(
            `\n  SUPERADMIN_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters.\n`
        );
        process.exit(1);
    }

    const supabase = serviceClient();
    const email = `${username.toLowerCase()}@${AUTH_EMAIL_DOMAIN}`;

    // ── Already bootstrapped? ─────────────────────────────────
    const { data: existing, error: lookupErr } = await supabase
        .from("profiles")
        .select("id, username, role, is_active")
        .eq("username", username)
        .maybeSingle();

    if (lookupErr) {
        console.error(`\n  Could not read profiles: ${lookupErr.message}\n`);
        process.exit(1);
    }

    if (existing) {
        console.log(`\n  "${username}" already exists — repairing rather than recreating.`);

        const { error: pwErr } = await supabase.auth.admin.updateUserById(existing.id, {
            password,
        });
        if (pwErr) {
            console.error(`  Could not reset the password: ${pwErr.message}\n`);
            process.exit(1);
        }

        const { error: roleErr } = await supabase
            .from("profiles")
            .update({ role: "superadmin", is_active: true })
            .eq("id", existing.id);
        if (roleErr) {
            console.error(`  Could not set the role: ${roleErr.message}\n`);
            process.exit(1);
        }

        console.log(`  Password reset, role confirmed as superadmin.\n`);
        return;
    }

    // ── Create ────────────────────────────────────────────────
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { username, full_name: "Super Admin" },
    });

    if (createErr || !created?.user) {
        console.error(`\n  Could not create the account: ${createErr?.message}\n`);
        process.exit(1);
    }

    // handle_new_user() (migration 0002) inserted the profile with role
    // 'admin'. The guard trigger refuses to let an API caller set
    // 'superadmin' — the service role is exempt, which is the whole reason
    // this promotion happens here rather than in the CMS.
    const { error: promoteErr } = await supabase
        .from("profiles")
        .update({ role: "superadmin" })
        .eq("id", created.user.id);

    if (promoteErr) {
        await supabase.auth.admin.deleteUser(created.user.id);
        console.error(`\n  Could not promote to superadmin: ${promoteErr.message}\n`);
        process.exit(1);
    }

    console.log(`\n  Superadmin created.`);
    console.log(`    username  ${username}`);
    console.log(`    internal  ${email}`);
    console.log(`\n  Sign in at /admin/login with the username, not the email.`);
    console.log(`  Now remove SUPERADMIN_PASSWORD from .env.local — it is no longer needed.\n`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
