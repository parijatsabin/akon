/**
 * Inbox — contact enquiries and newsletter signups.
 *
 * Both live in the `contacts` table, separated by `kind` — two filtered reads
 * rather than two tables.
 *
 * Nothing here is filtered in the client for security: the "staff read
 * contacts" policy means an unauthenticated or non-admin caller gets an empty
 * result from the database itself. The UI decides layout, not access.
 */

import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Mail, Trash2, RefreshCw, Check, Archive } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useToast } from "../components/ui/Toast";
import {
    PageHeader, Tabs, TabPanel, EmptyState, Loading, ErrorState, type TabDef,
} from "../components/ui/Page";
import { Button, IconButton } from "../components/ui/Field";
import { useContactAlerts } from "../lib/ContactAlerts";

type Status = "new" | "read" | "archived";
type Tab = "messages" | "subscribers";

interface Submission {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: Status;
    created_at: string;
}

interface Subscriber {
    id: string;
    email: string;
    created_at: string;
}

const formatDate = (iso: string): string =>
    new Date(iso).toLocaleString(undefined, {
        day: "numeric", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });

const InboxPage: React.FC = () => {
    const { toast } = useToast();
    const { refresh: refreshUnread } = useContactAlerts();
    // ?tab=subscribers lets the "New subscriber" alert deep-link to the right
    // tab rather than dropping you on Messages to hunt for it.
    const [params, setParams] = useSearchParams();
    const tab: Tab = params.get("tab") === "subscribers" ? "subscribers" : "messages";
    const setTab = (next: Tab) =>
        setParams(next === "subscribers" ? { tab: "subscribers" } : {}, { replace: true });
    const [messages, setMessages] = useState<Submission[]>([]);
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openId, setOpenId] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);

        const [msgRes, subRes] = await Promise.all([
            supabase.from("contacts")
                .select("id, name, email, subject, message, status, created_at")
                .eq("kind", "enquiry").order("created_at", { ascending: false }),
            supabase.from("contacts")
                .select("id, email, created_at")
                .eq("kind", "newsletter").order("created_at", { ascending: false }),
        ]);

        if (msgRes.error || subRes.error) {
            setError(msgRes.error?.message ?? subRes.error?.message ?? "Could not load the inbox.");
        } else {
            setMessages((msgRes.data ?? []) as Submission[]);
            setSubscribers((subRes.data ?? []) as Subscriber[]);
        }
        setLoading(false);
    }, []);

    useEffect(() => { void load(); }, [load]);

    // Opening a message marks it read, so the unread count means something.
    const open = async (m: Submission) => {
        setOpenId(openId === m.id ? null : m.id);
        if (m.status === "new") {
            const { error: e } = await supabase.from("contacts")
                .update({ status: "read" }).eq("id", m.id);
            if (!e) {
                setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, status: "read" } : x)));
                refreshUnread();
            }
        }
    };

    const setStatus = async (id: string, status: Status) => {
        const { error: e } = await supabase.from("contacts").update({ status }).eq("id", id);
        if (e) { toast(e.message, "error"); return; }
        setMessages((prev) => prev.map((x) => (x.id === id ? { ...x, status } : x)));
        refreshUnread();
        toast(status === "archived" ? "Message archived." : "Marked unread.");
    };

    const remove = async (id: string, kind: "enquiry" | "newsletter") => {
        const what = kind === "enquiry" ? "message" : "subscriber";
        if (!window.confirm(`Delete this ${what}? This cannot be undone.`)) return;

        const { error: e } = await supabase.from("contacts").delete().eq("id", id);
        if (e) { toast(e.message, "error"); return; }

        if (kind === "enquiry") {
            setMessages((prev) => prev.filter((x) => x.id !== id));
            refreshUnread();
        } else {
            setSubscribers((prev) => prev.filter((x) => x.id !== id));
        }
        toast(`Deleted the ${what}.`);
    };

    if (loading) return <Loading label="Loading inbox…" />;

    if (error) {
        return (
            <>
                <PageHeader title="Inbox" />
                <ErrorState message={error} onRetry={() => void load()} />
            </>
        );
    }

    const unread = messages.filter((m) => m.status === "new").length;

    const TABS = [
        { id: "messages", label: `Messages (${messages.length})` },
        { id: "subscribers", label: `Subscribers (${subscribers.length})` },
    ] as const satisfies readonly TabDef[];

    return (
        <>
            <PageHeader
                title="Inbox"
                description={
                    unread > 0
                        ? `${unread} enquir${unread === 1 ? "y" : "ies"} waiting for a reply.`
                        : "Enquiries from the contact page and newsletter signups."
                }
                action={
                    <Button onClick={() => void load()}>
                        <RefreshCw size={15} aria-hidden="true" /> Refresh
                    </Button>
                }
            />

            <Tabs tabs={TABS} active={tab} onChange={(id) => setTab(id as Tab)} label="Inbox sections" />

            <TabPanel id={tab}>
                {tab === "messages" && (
                    messages.length === 0 ? (
                        <EmptyState title="No messages yet">
                            Enquiries from the contact page will appear here.
                        </EmptyState>
                    ) : (
                        <div className="adm-stack-s">
                            {messages.map((m) => (
                                <article
                                    key={m.id}
                                    className="adm-item"
                                    style={{
                                        padding: 0,
                                        marginBottom: 0,
                                        borderLeftWidth: 3,
                                        borderLeftColor: m.status === "new" ? "var(--accent)" : "transparent",
                                        opacity: m.status === "archived" ? 0.6 : 1,
                                    }}
                                >
                                    <button
                                        type="button"
                                        onClick={() => void open(m)}
                                        aria-expanded={openId === m.id}
                                        className="adm-row-between"
                                        style={{
                                            width: "100%", textAlign: "left", background: "none",
                                            border: "none", padding: "16px 18px", cursor: "pointer",
                                        }}
                                    >
                                        <span style={{ minWidth: 0 }}>
                                            <strong style={{ fontWeight: m.status === "new" ? 700 : 500 }}>
                                                {m.name}
                                            </strong>
                                            <span className="adm-hint" style={{ marginLeft: 8 }}>{m.email}</span>
                                            <span className="adm-hint" style={{ display: "block", marginTop: 3 }}>
                                                {m.subject || "(no subject)"}
                                            </span>
                                        </span>
                                        <span className="adm-hint" style={{ whiteSpace: "nowrap" }}>
                                            {formatDate(m.created_at)}
                                        </span>
                                    </button>

                                    {openId === m.id && (
                                        <div style={{ padding: "0 18px 18px", borderTop: "1px solid var(--border)" }}>
                                            <p style={{ whiteSpace: "pre-wrap", margin: "14px 0 18px", lineHeight: 1.6 }}>
                                                {m.message}
                                            </p>
                                            <div className="adm-row" style={{ flexWrap: "wrap" }}>
                                                <a
                                                    className="adm-btn adm-btn-primary adm-btn-sm"
                                                    href={`mailto:${m.email}?subject=${encodeURIComponent("Re: " + (m.subject || "Your enquiry"))}`}
                                                >
                                                    <Mail size={14} aria-hidden="true" /> Reply
                                                </a>
                                                {m.status !== "archived" ? (
                                                    <Button small onClick={() => void setStatus(m.id, "archived")}>
                                                        <Archive size={14} aria-hidden="true" /> Archive
                                                    </Button>
                                                ) : (
                                                    <Button small onClick={() => void setStatus(m.id, "new")}>
                                                        <Check size={14} aria-hidden="true" /> Mark unread
                                                    </Button>
                                                )}
                                                <Button variant="danger" small onClick={() => void remove(m.id, "enquiry")}>
                                                    <Trash2 size={14} aria-hidden="true" /> Delete
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </article>
                            ))}
                        </div>
                    )
                )}

                {tab === "subscribers" && (
                    subscribers.length === 0 ? (
                        <EmptyState title="No subscribers yet">
                            Newsletter signups from the homepage will appear here.
                        </EmptyState>
                    ) : (
                        <div className="adm-table-wrap">
                            <table className="adm-table">
                                <thead>
                                    <tr>
                                        <th scope="col">Email</th>
                                        <th scope="col">Subscribed</th>
                                        <th scope="col" style={{ width: 60 }} aria-label="Actions" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {subscribers.map((s) => (
                                        <tr key={s.id}>
                                            <td>{s.email}</td>
                                            <td className="adm-hint">{formatDate(s.created_at)}</td>
                                            <td>
                                                <IconButton
                                                    label={`Delete ${s.email}`}
                                                    onClick={() => void remove(s.id, "newsletter")}
                                                >
                                                    <Trash2 size={15} aria-hidden="true" />
                                                </IconButton>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                )}
            </TabPanel>
        </>
    );
};

export default InboxPage;
