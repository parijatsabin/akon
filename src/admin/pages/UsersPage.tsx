/**
 * Users — superadmin-only account management.
 *
 * Three things shape this page, all of them consequences of decisions made in
 * the schema rather than here:
 *
 * 1. THERE IS NO EMAIL. A username resolves to a synthetic
 *    <username>@auth.anok.local that receives no mail, so there is no invite
 *    link, no confirmation, and no password reset message. A password is
 *    generated on the server, shown to the superadmin exactly once, and handed
 *    over in person. Losing it means resetting it, never recovering it.
 *
 * 2. SUPERADMIN IS NOT AN OPTION. There is no control here that mints one,
 *    resets one, or deletes one — deliberately, so the affordance does not
 *    exist to be found. The database backs this up regardless of what the UI
 *    renders: guard_profile_write() refuses `superadmin` from any API caller.
 *
 * 3. DEACTIVATE IS THE DEFAULT, DELETE IS THE EXCEPTION. Deactivating is
 *    reversible and keeps `created_by` intact on the rows that reference the
 *    account. Deleting is neither, so it asks for the username to be typed.
 *
 * Access is guarded three times over: the nav item is hidden, the route
 * requires a superadmin, and RLS rejects the writes. The first two are
 * cosmetic; only the third is a security boundary.
 */

import React, { useCallback, useEffect, useState } from "react";
import { UserPlus, KeyRound, Trash2, Check, Ban, Copy, X, RefreshCw, Pencil } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { useToast } from "../components/ui/Toast";
import { PageHeader, EmptyState, Loading, ErrorState } from "../components/ui/Page";
import { Field, Input, Button, IconButton } from "../components/ui/Field";
import { Section } from "../components/ui/Section";
import {
    listUsers, createAdmin, resetPassword, remove, rename, setActive,
    UserAdminError, type AdminUser, type Credentials,
} from "../lib/users";

const formatDate = (iso: string): string =>
    new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

const message = (err: unknown): string =>
    err instanceof UserAdminError || err instanceof Error ? err.message : "Something went wrong.";

// ══════════════════════════════════════════════════════════════
// Credential hand-off
// ══════════════════════════════════════════════════════════════

/**
 * The password, shown once.
 *
 * It stays on screen until dismissed rather than fading like a toast: this is
 * the only moment the value exists anywhere outside a bcrypt hash, and a
 * three-second toast would be a genuine way to lose an account.
 */
const CredentialPanel: React.FC<{ creds: Credentials; onDismiss: () => void }> = ({
    creds, onDismiss,
}) => {
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(creds.password);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Clipboard access needs a secure context and can be refused. The
            // password is selectable on screen, so this is not a dead end.
            toast("Could not copy — select the password and copy it by hand.", "error");
        }
    };

    return (
        <div
            className="adm-item adm-item-raised"
            style={{ borderLeft: "3px solid var(--accent)", marginBottom: "var(--adm-6)" }}
            role="status"
            aria-live="polite"
        >
            <div className="adm-row-between" style={{ alignItems: "flex-start" }}>
                <div style={{ minWidth: 0 }}>
                    <p className="adm-item-title" style={{ marginBottom: 4 }}>
                        Password for <strong>{creds.username}</strong>
                    </p>
                    <p className="adm-hint" style={{ marginBottom: 14 }}>
                        Shown once. Copy it now and hand it over directly — it cannot be shown
                        again, only reset.
                    </p>
                </div>
                <IconButton label="Dismiss" onClick={onDismiss}>
                    <X size={15} aria-hidden="true" />
                </IconButton>
            </div>

            <div className="adm-row" style={{ flexWrap: "wrap" }}>
                <code
                    style={{
                        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                        fontSize: "1.05rem",
                        letterSpacing: "0.06em",
                        background: "var(--sunken-deep)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius-sm)",
                        padding: "10px 16px",
                        userSelect: "all",
                    }}
                >
                    {creds.password}
                </code>
                <Button small onClick={() => void copy()}>
                    {copied
                        ? <><Check size={14} aria-hidden="true" /> Copied</>
                        : <><Copy size={14} aria-hidden="true" /> Copy</>}
                </Button>
            </div>
        </div>
    );
};

// ══════════════════════════════════════════════════════════════
// Create form
// ══════════════════════════════════════════════════════════════

const CreateForm: React.FC<{
    onCreated: (creds: Credentials) => void;
    onCancel: () => void;
}> = ({ onCreated, onCancel }) => {
    const { toast } = useToast();
    const [username, setUsername] = useState("");
    const [fullName, setFullName] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Mirrors USERNAME_RE in the edge function. Checked there too — this is
    // only so the message arrives before the round trip.
    const valid = /^[a-z0-9_]{3,32}$/.test(username.trim().toLowerCase());

    const submit = async () => {
        setError(null);
        if (!valid) {
            setError("3–32 characters: lowercase letters, numbers or underscores.");
            return;
        }

        setBusy(true);
        try {
            const creds = await createAdmin(username.trim().toLowerCase(), fullName);
            onCreated(creds);
            setUsername("");
            setFullName("");
        } catch (err) {
            const text = message(err);
            setError(text);
            toast(text, "error");
        } finally {
            setBusy(false);
        }
    };

    return (
        <Section title="New admin">
            <div className="adm-grid-2">
                <Field
                    label="Username"
                    htmlFor="new-username"
                    required
                    hint="What they type to sign in. Cannot be changed later."
                    error={error ?? undefined}
                >
                    <Input
                        id="new-username"
                        value={username}
                        autoComplete="off"
                        placeholder="ramesh"
                        invalid={Boolean(error)}
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") void submit(); }}
                    />
                </Field>

                <Field label="Full name" htmlFor="new-fullname" hint="Shown in the user list only.">
                    <Input
                        id="new-fullname"
                        value={fullName}
                        autoComplete="off"
                        placeholder="Ramesh Karki"
                        onChange={(e) => setFullName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") void submit(); }}
                    />
                </Field>
            </div>

            <div className="adm-row">
                <Button variant="primary" disabled={busy} onClick={() => void submit()}>
                    {busy ? "Creating…" : "Create admin"}
                </Button>
                <Button variant="quiet" disabled={busy} onClick={onCancel}>
                    Cancel
                </Button>
                <span className="adm-hint">
                    A password is generated for you and shown once.
                </span>
            </div>
        </Section>
    );
};

// ══════════════════════════════════════════════════════════════
// Page
// ══════════════════════════════════════════════════════════════

const UsersPage: React.FC = () => {
    const { toast } = useToast();
    const { profile } = useAuth();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);
    const [creds, setCreds] = useState<Credentials | null>(null);
    /** Id of the row with an action in flight, so only its controls disable. */
    const [busyId, setBusyId] = useState<string | null>(null);

    /**
     * `silent` refetches without the full-page spinner. Every reload after an
     * action uses it: swapping the page for a spinner would unmount the
     * credential panel mid-read, and that password is not shown twice.
     */
    const load = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        setError(null);
        try {
            setUsers(await listUsers());
        } catch (err) {
            setError(message(err));
        } finally {
            if (!silent) setLoading(false);
        }
    }, []);

    useEffect(() => { void load(); }, [load]);

    /** Every row action shares this shape: run, report, reload. */
    const run = async (id: string, action: () => Promise<void>) => {
        setBusyId(id);
        try {
            await action();
            await load(true);
        } catch (err) {
            toast(message(err), "error");
        } finally {
            setBusyId(null);
        }
    };

    const handleRename = (user: AdminUser) => {
        const next = window.prompt(`Full name for "${user.username}"`, user.full_name);
        if (next === null || next.trim() === user.full_name) return;
        void run(user.id, async () => {
            await rename(user.id, next);
            toast("Name updated.");
        });
    };

    const handleToggleActive = (user: AdminUser) => {
        const turningOff = user.is_active;
        if (turningOff && !window.confirm(
            `Deactivate "${user.username}"? They will be signed out and unable to sign in again until reactivated.`
        )) return;

        void run(user.id, async () => {
            await setActive(user.id, !turningOff);
            toast(turningOff ? `"${user.username}" deactivated.` : `"${user.username}" reactivated.`);
        });
    };

    const handleReset = (user: AdminUser) => {
        if (!window.confirm(
            `Reset the password for "${user.username}"? Their current password stops working immediately.`
        )) return;

        void run(user.id, async () => {
            setCreds(await resetPassword(user.id));
            toast("Password reset.");
        });
    };

    /**
     * Typing the username is the confirmation, not an OK button. Delete is
     * irreversible and cascades to the auth identity, so a mis-aimed click on
     * the wrong row should not be able to do it.
     */
    const handleDelete = (user: AdminUser) => {
        const typed = window.prompt(
            `Deleting "${user.username}" cannot be undone.\n\n` +
            `Consider deactivating instead — that is reversible.\n\n` +
            `To delete, type the username:`
        );
        if (typed === null) return;
        if (typed.trim().toLowerCase() !== user.username.toLowerCase()) {
            toast("That did not match the username. Nothing was deleted.", "error");
            return;
        }

        void run(user.id, async () => {
            await remove(user.id);
            toast(`"${user.username}" deleted.`);
        });
    };

    if (loading) return <Loading label="Loading users…" />;

    if (error) {
        return (
            <>
                <PageHeader title="Users" />
                <ErrorState message={error} onRetry={() => void load()} />
            </>
        );
    }

    const activeCount = users.filter((u) => u.is_active).length;

    return (
        <>
            <PageHeader
                title="Users"
                description={`${activeCount} active account${activeCount === 1 ? "" : "s"} with access to this CMS.`}
                action={
                    <div className="adm-row">
                        <Button onClick={() => void load()}>
                            <RefreshCw size={15} aria-hidden="true" /> Refresh
                        </Button>
                        {!creating && (
                            <Button variant="primary" onClick={() => setCreating(true)}>
                                <UserPlus size={15} aria-hidden="true" /> New admin
                            </Button>
                        )}
                    </div>
                }
            />

            {creds && <CredentialPanel creds={creds} onDismiss={() => setCreds(null)} />}

            {creating && (
                <CreateForm
                    onCreated={(c) => { setCreds(c); setCreating(false); void load(true); }}
                    onCancel={() => setCreating(false)}
                />
            )}

            {users.length === 0 ? (
                <EmptyState title="No accounts">
                    Nobody can sign in to this CMS, including you — which should be impossible.
                </EmptyState>
            ) : (
                <div className="adm-table-wrap">
                    <table className="adm-table">
                        <thead>
                            <tr>
                                <th scope="col">Username</th>
                                <th scope="col">Name</th>
                                <th scope="col">Role</th>
                                <th scope="col">Status</th>
                                <th scope="col">Created</th>
                                <th scope="col" style={{ width: 150 }} aria-label="Actions" />
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => {
                                const isSelf = u.id === profile?.id;
                                // A superadmin is bootstrap-only in both
                                // directions: the edge function refuses to touch
                                // one, so offering the controls would only
                                // produce an error.
                                const locked = u.role === "superadmin";
                                const busy = busyId === u.id;

                                return (
                                    <tr key={u.id} style={{ opacity: u.is_active ? 1 : 0.55 }}>
                                        <td>
                                            <strong>{u.username}</strong>
                                            {isSelf && <span className="adm-hint" style={{ marginLeft: 8 }}>you</span>}
                                        </td>
                                        <td>{u.full_name || <span className="adm-hint">—</span>}</td>
                                        <td>
                                            <span className={`adm-badge${locked ? "" : " adm-badge-quiet"}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="adm-hint">{u.is_active ? "Active" : "Deactivated"}</td>
                                        <td className="adm-hint">{formatDate(u.created_at)}</td>
                                        <td>
                                            <div className="adm-row" style={{ gap: 4, justifyContent: "flex-end" }}>
                                                <IconButton
                                                    label={`Rename ${u.username}`}
                                                    disabled={busy}
                                                    onClick={() => handleRename(u)}
                                                >
                                                    <Pencil size={15} aria-hidden="true" />
                                                </IconButton>

                                                {!locked && !isSelf && (
                                                    <>
                                                        <IconButton
                                                            label={`Reset password for ${u.username}`}
                                                            disabled={busy}
                                                            onClick={() => handleReset(u)}
                                                        >
                                                            <KeyRound size={15} aria-hidden="true" />
                                                        </IconButton>
                                                        <IconButton
                                                            label={u.is_active
                                                                ? `Deactivate ${u.username}`
                                                                : `Reactivate ${u.username}`}
                                                            disabled={busy}
                                                            onClick={() => handleToggleActive(u)}
                                                        >
                                                            {u.is_active
                                                                ? <Ban size={15} aria-hidden="true" />
                                                                : <Check size={15} aria-hidden="true" />}
                                                        </IconButton>
                                                        <IconButton
                                                            label={`Delete ${u.username}`}
                                                            disabled={busy}
                                                            onClick={() => handleDelete(u)}
                                                        >
                                                            <Trash2 size={15} aria-hidden="true" />
                                                        </IconButton>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <p className="adm-hint" style={{ marginTop: "var(--adm-6)", maxWidth: "60ch" }}>
                New admins can edit every part of the site, but cannot manage users. There is no
                password reset email — the synthetic sign-in address receives no mail — so a
                forgotten password is reset here and handed over directly.
            </p>
        </>
    );
};

export default UsersPage;
