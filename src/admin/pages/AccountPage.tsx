/**
 * Account — the signed-in user's own password.
 *
 * This is the only way out of a generated password. Accounts are created by a
 * superadmin with a random string shown once, and the sign-in address
 * (<username>@auth.anok.local) receives no mail, so there is no reset email and
 * no "forgot password" link anywhere in this CMS. Without this page a new admin
 * would be stuck with whatever they were handed until a superadmin reset it.
 *
 * Nothing privileged happens here. `supabase.auth.updateUser` acts on the
 * caller's own session — no service-role key, no edge function — which is
 * exactly why changing your own password is self-service while changing
 * someone else's is not.
 */

import React, { useState } from "react";
import { KeyRound } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { useToast } from "../components/ui/Toast";
import { PageHeader } from "../components/ui/Page";
import { Field, Input, Button } from "../components/ui/Field";
import { Section } from "../components/ui/Section";
import { changeOwnPassword, UserAdminError } from "../lib/users";

/** Matches MIN_PASSWORD_LENGTH in scripts/bootstrap-superadmin.ts. */
const MIN_LENGTH = 8;

const AccountPage: React.FC = () => {
    const { profile } = useAuth();
    const { toast } = useToast();
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submit = async () => {
        setError(null);

        if (password.length < MIN_LENGTH) {
            setError(`Use at least ${MIN_LENGTH} characters.`);
            return;
        }
        if (password !== confirm) {
            setError("The two passwords do not match.");
            return;
        }

        setBusy(true);
        try {
            await changeOwnPassword(password);
            setPassword("");
            setConfirm("");
            toast("Password changed. It applies the next time you sign in.");
        } catch (err) {
            const text = err instanceof UserAdminError || err instanceof Error
                ? err.message
                : "Could not change the password.";
            setError(text);
            toast(text, "error");
        } finally {
            setBusy(false);
        }
    };

    return (
        <>
            <PageHeader
                title="Account"
                description={
                    profile
                        ? `Signed in as ${profile.username} — ${profile.role}.`
                        : "Your sign-in details."
                }
            />

            <Section title="Change password">
                <div className="adm-grid-2">
                    <Field
                        label="New password"
                        htmlFor="new-password"
                        required
                        hint={`At least ${MIN_LENGTH} characters.`}
                        error={error ?? undefined}
                    >
                        <Input
                            id="new-password"
                            type="password"
                            value={password}
                            autoComplete="new-password"
                            invalid={Boolean(error)}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </Field>

                    <Field label="Confirm new password" htmlFor="confirm-password" required>
                        <Input
                            id="confirm-password"
                            type="password"
                            value={confirm}
                            autoComplete="new-password"
                            onChange={(e) => setConfirm(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") void submit(); }}
                        />
                    </Field>
                </div>

                <div className="adm-row">
                    <Button variant="primary" disabled={busy} onClick={() => void submit()}>
                        <KeyRound size={15} aria-hidden="true" />
                        {busy ? "Saving…" : "Change password"}
                    </Button>
                </div>

                <p className="adm-hint" style={{ marginTop: "var(--adm-5)", maxWidth: "60ch" }}>
                    There is no password reset email — sign-in addresses here are internal and
                    receive no mail. If you forget this password, a superadmin has to reset it and
                    hand you a new one.
                </p>
            </Section>
        </>
    );
};

export default AccountPage;
