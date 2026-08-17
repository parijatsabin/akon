/**
 * InboxPage — contact enquiries and newsletter signups.
 *
 * Both live in the `contacts` table, separated by `kind` — two filtered reads
 * rather than two tables.
 *
 * Nothing here is filtered in the client for security: the "staff read
 * contacts" policy means an unauthenticated or non-admin caller gets an empty
 * result from the database itself. The UI decides layout, not access.
 */

import React, { useCallback, useEffect, useState } from "react";
import { Mail, Inbox as InboxIcon, Trash2, RefreshCw, Check, Archive } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useToast } from "../components/ui/Toast";

type Status = "new" | "read" | "archived";

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

type Tab = "messages" | "subscribers";

const formatDate = (iso: string): string =>
    new Date(iso).toLocaleString(undefined, {
        day: "numeric", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });

const InboxPage: React.FC = () => {
    const { toast } = useToast();
    const [tab, setTab] = useState<Tab>("messages");
    const [messages, setMessages] = useState<Submission[]>([]);
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openId, setOpenId] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);

        const [msgRes, subRes] = await Promise.all([
            supabase
                .from("contacts")
                .select("id, name, email, subject, message, status, created_at")
                .eq("kind", "enquiry")
                .order("created_at", { ascending: false }),
            supabase
                .from("contacts")
                .select("id, email, created_at")
                .eq("kind", "newsletter")
                .order("created_at", { ascending: false }),
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
            const { error } = await supabase
                .from("contacts").update({ status: "read" }).eq("id", m.id);
            if (!error) {
                setMessages((prev) =>
                    prev.map((x) => (x.id === m.id ? { ...x, status: "read" } : x)));
            }
        }
    };

    const setStatus = async (id: string, status: Status) => {
        const { error } = await supabase
            .from("contacts").update({ status }).eq("id", id);
        if (error) { toast(error.message, "error"); return; }
        setMessages((prev) => prev.map((x) => (x.id === id ? { ...x, status } : x)));
        toast(status === "archived" ? "Message archived." : "Marked unread.");
    };

    const remove = async (id: string, kind: "enquiry" | "newsletter") => {
        const what = kind === "enquiry" ? "message" : "subscriber";
        if (!window.confirm(`Delete this ${what}? This cannot be undone.`)) return;

        const { error } = await supabase.from("contacts").delete().eq("id", id);
        if (error) { toast(error.message, "error"); return; }

        if (kind === "enquiry") {
            setMessages((prev) => prev.filter((x) => x.id !== id));
        } else {
            setSubscribers((prev) => prev.filter((x) => x.id !== id));
        }
        toast(`Deleted the ${what}.`);
    };

    const unread = messages.filter((m) => m.status === "new").length;

    // ── States ────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="site-status" role="status" aria-live="polite">
                <div className="site-status-spinner" aria-hidden="true" />
                <span className="site-status-text">Loading inbox…</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="adm-page">
                <h1 className="adm-title">Inbox</h1>
                <div className="adm-card" role="alert">
                    <p>The inbox could not be loaded.</p>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{error}</p>
                    <button className="btn btn-solid" onClick={() => void load()}>Try again</button>
                </div>
            </div>
        );
    }

    return (
        <div className="adm-page">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <h1 className="adm-title">
                    Inbox{unread > 0 && <span className="adm-badge" style={{ marginLeft: 10 }}>{unread} new</span>}
                </h1>
                <button className="btn btn-ghost" onClick={() => void load()} title="Refresh">
                    <RefreshCw size={16} aria-hidden="true" /> Refresh
                </button>
            </div>

            {/* Tabs */}
            <div role="tablist" aria-label="Inbox sections" style={{ display: "flex", gap: 8, margin: "18px 0 24px", borderBottom: "1px solid var(--border, #e5e5e5)" }}>
                {([
                    ["messages", `Messages (${messages.length})`, <Mail size={15} key="m" aria-hidden="true" />],
                    ["subscribers", `Subscribers (${subscribers.length})`, <InboxIcon size={15} key="s" aria-hidden="true" />],
                ] as const).map(([key, label, icon]) => (
                    <button
                        key={key}
                        role="tab"
                        aria-selected={tab === key}
                        onClick={() => setTab(key as Tab)}
                        style={{
                            display: "flex", alignItems: "center", gap: 7,
                            padding: "10px 16px", border: "none", cursor: "pointer",
                            background: "none", fontSize: "0.88rem",
                            borderBottom: tab === key ? "2px solid var(--accent, #111)" : "2px solid transparent",
                            fontWeight: tab === key ? 600 : 400,
                            color: tab === key ? "inherit" : "var(--text-muted, #777)",
                        }}
                    >
                        {icon}{label}
                    </button>
                ))}
            </div>

            {/* ── Messages ── */}
            {tab === "messages" && (
                messages.length === 0 ? (
                    <div className="adm-card">
                        <p style={{ color: "var(--text-muted)" }}>
                            No messages yet. Enquiries from the contact page will appear here.
                        </p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {messages.map((m) => (
                            <article
                                key={m.id}
                                className="adm-card"
                                style={{
                                    padding: 0, overflow: "hidden",
                                    borderLeft: m.status === "new" ? "3px solid var(--accent, #111)" : "3px solid transparent",
                                    opacity: m.status === "archived" ? 0.6 : 1,
                                }}
                            >
                                <button
                                    onClick={() => void open(m)}
                                    aria-expanded={openId === m.id}
                                    style={{
                                        width: "100%", textAlign: "left", background: "none",
                                        border: "none", padding: "16px 18px", cursor: "pointer",
                                        display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap",
                                    }}
                                >
                                    <span style={{ minWidth: 0 }}>
                                        <strong style={{ fontWeight: m.status === "new" ? 700 : 500 }}>{m.name}</strong>
                                        <span style={{ color: "var(--text-muted)", marginLeft: 8, fontSize: "0.86rem" }}>
                                            {m.email}
                                        </span>
                                        <span style={{ display: "block", fontSize: "0.86rem", color: "var(--text-muted)", marginTop: 3 }}>
                                            {m.subject || "(no subject)"}
                                        </span>
                                    </span>
                                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                                        {formatDate(m.created_at)}
                                    </span>
                                </button>

                                {openId === m.id && (
                                    <div style={{ padding: "0 18px 18px", borderTop: "1px solid var(--border, #eee)" }}>
                                        <p style={{ whiteSpace: "pre-wrap", margin: "14px 0 18px", lineHeight: 1.6 }}>
                                            {m.message}
                                        </p>
                                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                            <a className="btn btn-solid" style={{ fontSize: "0.8rem" }}
                                               href={`mailto:${m.email}?subject=${encodeURIComponent("Re: " + (m.subject || "Your enquiry"))}`}>
                                                <Mail size={14} aria-hidden="true" /> Reply
                                            </a>
                                            {m.status !== "archived" ? (
                                                <button className="btn btn-ghost" style={{ fontSize: "0.8rem" }}
                                                        onClick={() => void setStatus(m.id, "archived")}>
                                                    <Archive size={14} aria-hidden="true" /> Archive
                                                </button>
                                            ) : (
                                                <button className="btn btn-ghost" style={{ fontSize: "0.8rem" }}
                                                        onClick={() => void setStatus(m.id, "new")}>
                                                    <Check size={14} aria-hidden="true" /> Mark unread
                                                </button>
                                            )}
                                            <button className="btn btn-ghost" style={{ fontSize: "0.8rem", color: "#b00" }}
                                                    onClick={() => void remove(m.id, "enquiry")}>
                                                <Trash2 size={14} aria-hidden="true" /> Delete
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </article>
                        ))}
                    </div>
                )
            )}

            {/* ── Subscribers ── */}
            {tab === "subscribers" && (
                subscribers.length === 0 ? (
                    <div className="adm-card">
                        <p style={{ color: "var(--text-muted)" }}>
                            No subscribers yet. Newsletter signups from the homepage will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="adm-card" style={{ padding: 0, overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
                            <thead>
                                <tr style={{ textAlign: "left", borderBottom: "1px solid var(--border, #eee)" }}>
                                    <th style={{ padding: "12px 18px" }}>Email</th>
                                    <th style={{ padding: "12px 18px" }}>Subscribed</th>
                                    <th style={{ padding: "12px 18px", width: 60 }} aria-label="Actions" />
                                </tr>
                            </thead>
                            <tbody>
                                {subscribers.map((s) => (
                                    <tr key={s.id} style={{ borderBottom: "1px solid var(--border, #f2f2f2)" }}>
                                        <td style={{ padding: "12px 18px" }}>{s.email}</td>
                                        <td style={{ padding: "12px 18px", color: "var(--text-muted)" }}>
                                            {formatDate(s.created_at)}
                                        </td>
                                        <td style={{ padding: "12px 18px" }}>
                                            <button
                                                onClick={() => void remove(s.id, "newsletter")}
                                                aria-label={`Delete ${s.email}`}
                                                style={{ background: "none", border: "none", cursor: "pointer", color: "#b00" }}
                                            >
                                                <Trash2 size={15} aria-hidden="true" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}
        </div>
    );
};

export default InboxPage;
