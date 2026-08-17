/**
 * PagesPage — manages the three standalone content pages:
 * Privacy Policy, Terms of Use and the FAQ.
 *
 * Privacy and Terms share the same shape (PolicyPageData) so they share one
 * editor; the FAQ has its own because its items are question/answer pairs.
 */
import React, { useState } from "react";
import { readStore } from "../../data/siteRepository";
import { saveSection } from "../lib/saveSection";
import { Section } from "../components/ui/Section";
import { Field, Input, Textarea, SaveBtn } from "../components/ui/Field";
import { useToast } from "../components/ui/Toast";
import type { PolicyPageData, PolicySection, FaqData, FaqItem } from "../../data/types";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader } from "../components/ui/Page";

const TABS = [
    { id: "privacy", label: "Privacy Policy" },
    { id: "terms", label: "Terms of Use" },
    { id: "faq", label: "FAQ" },
] as const;
type TabId = (typeof TABS)[number]["id"];

const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "10px 20px",
    fontSize: "0.82rem",
    fontWeight: 700,
    letterSpacing: "0.06em",
    border: "none",
    borderBottom: active ? "2px solid var(--accent)" : "2px solid transparent",
    background: "transparent",
    color: active ? "var(--accent)" : "var(--text-muted)",
    cursor: "pointer",
    transition: "all 0.18s",
    whiteSpace: "nowrap",
    fontFamily: "var(--font-body)",
});

const slug = (s: string) =>
    s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `section-${Date.now()}`;

/* ── Privacy / Terms editor ───────────────────────────────────── */
const PolicyEditor: React.FC<{ section: "privacy" | "terms"; onSave: () => void }> = ({ section, onSave }) => {
    const { toast } = useToast();
    const [form, setForm] = useState<PolicyPageData>(() => readStore()[section]);
    const [saving, setSaving] = useState(false);

    const set = (k: keyof PolicyPageData, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
    const setSection = (i: number, k: keyof PolicySection, v: string) => {
        const next = [...form.sections];
        next[i] = { ...next[i], [k]: v, ...(k === "heading" ? { id: slug(v) } : {}) };
        set("sections", next);
    };
    const move = (i: number, delta: number) => {
        const j = i + delta;
        if (j < 0 || j >= form.sections.length) return;
        const next = [...form.sections];
        [next[i], next[j]] = [next[j], next[i]];
        set("sections", next);
    };

    const save = async () => {
        if (!form.title.trim()) { toast("Title is required.", "error"); return; }
        if (form.sections.some((s) => !s.heading.trim() || !s.body.trim())) {
            toast("Every section needs a heading and body.", "error");
            return;
        }
        setSaving(true);
        const ok = await saveSection(section, form, toast, "Page saved!");
        setSaving(false);
        if (ok) onSave();
    };

    return (
        <>
            <Section title="Page Header">
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "0 24px" }}>
                    <Field label="Title"><Input value={form.title} onChange={(e) => set("title", e.target.value)} /></Field>
                    <Field label="Last Updated" hint="Free text, e.g. 15 August 2026">
                        <Input value={form.lastUpdated} onChange={(e) => set("lastUpdated", e.target.value)} />
                    </Field>
                </div>
                <Field label="Intro" hint="The opening paragraph below the title.">
                    <Textarea value={form.intro} onChange={(e) => set("intro", e.target.value)} style={{ minHeight: 90 }} />
                </Field>
            </Section>

            <Section title={`Sections (${form.sections.length})`} action={
                <button
                    onClick={() => set("sections", [...form.sections, { id: `section-${form.sections.length + 1}`, heading: "", body: "" }])}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 16px", background: "var(--noir)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer" }}>
                    <Plus size={13} /> Add Section
                </button>
            }>
                {form.sections.map((s, i) => (
                    <div key={i} style={{ padding: "16px 0", borderBottom: i < form.sections.length - 1 ? "1px solid var(--border)" : "none" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--accent-text)", minWidth: 22 }}>
                                {String(i + 1).padStart(2, "0")}
                            </span>
                            <div style={{ flex: 1 }}>
                                <Input value={s.heading} onChange={(e) => setSection(i, "heading", e.target.value)} placeholder="Section heading" />
                            </div>
                            <button onClick={() => move(i, -1)} disabled={i === 0} title="Move up"
                                style={{ padding: "4px 8px", background: "none", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", cursor: i === 0 ? "not-allowed" : "pointer", opacity: i === 0 ? 0.35 : 1 }}>↑</button>
                            <button onClick={() => move(i, 1)} disabled={i === form.sections.length - 1} title="Move down"
                                style={{ padding: "4px 8px", background: "none", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", cursor: i === form.sections.length - 1 ? "not-allowed" : "pointer", opacity: i === form.sections.length - 1 ? 0.35 : 1 }}>↓</button>
                            <button onClick={() => set("sections", form.sections.filter((_, x) => x !== i))} title="Delete section"
                                style={{ padding: 7, background: "none", border: "none", cursor: "pointer", color: "#e05555" }}><Trash2 size={14} /></button>
                        </div>
                        <Field label="" hint="Leave a blank line between paragraphs.">
                            <Textarea value={s.body} onChange={(e) => setSection(i, "body", e.target.value)} style={{ minHeight: 110 }} />
                        </Field>
                    </div>
                ))}
            </Section>

            <SaveBtn loading={saving} onClick={save} />
        </>
    );
};

/* ── FAQ editor ───────────────────────────────────────────────── */
const FaqEditor: React.FC<{ onSave: () => void }> = ({ onSave }) => {
    const { toast } = useToast();
    const [form, setForm] = useState<FaqData>(() => readStore().faq);
    const [saving, setSaving] = useState(false);

    const set = (k: keyof FaqData, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
    const setItem = (i: number, k: keyof FaqItem, v: string) => {
        const next = [...form.items]; next[i] = { ...next[i], [k]: v }; set("items", next);
    };
    const move = (i: number, delta: number) => {
        const j = i + delta;
        if (j < 0 || j >= form.items.length) return;
        const next = [...form.items];
        [next[i], next[j]] = [next[j], next[i]];
        set("items", next);
    };

    const save = async () => {
        if (form.items.some((q) => !q.question.trim() || !q.answer.trim())) {
            toast("Every question needs an answer.", "error");
            return;
        }
        setSaving(true);
        const ok = await saveSection("faq", form, toast, "FAQ saved!");
        setSaving(false);
        if (ok) onSave();
    };

    return (
        <>
            <Section title="Page Header">
                <Field label="Title"><Input value={form.title} onChange={(e) => set("title", e.target.value)} /></Field>
                <Field label="Intro"><Textarea value={form.intro} onChange={(e) => set("intro", e.target.value)} style={{ minHeight: 70 }} /></Field>
            </Section>

            <Section title={`Questions (${form.items.length})`} action={
                <button
                    onClick={() => set("items", [...form.items, { id: `f${Date.now()}`, question: "", answer: "" }])}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 16px", background: "var(--noir)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer" }}>
                    <Plus size={13} /> Add Question
                </button>
            }>
                {form.items.map((q, i) => (
                    <div key={q.id} style={{ padding: "16px 0", borderBottom: i < form.items.length - 1 ? "1px solid var(--border)" : "none" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--accent-text)", minWidth: 22 }}>
                                {String(i + 1).padStart(2, "0")}
                            </span>
                            <div style={{ flex: 1 }}>
                                <Input value={q.question} onChange={(e) => setItem(i, "question", e.target.value)} placeholder="Question" />
                            </div>
                            <button onClick={() => move(i, -1)} disabled={i === 0} title="Move up"
                                style={{ padding: "4px 8px", background: "none", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", cursor: i === 0 ? "not-allowed" : "pointer", opacity: i === 0 ? 0.35 : 1 }}>↑</button>
                            <button onClick={() => move(i, 1)} disabled={i === form.items.length - 1} title="Move down"
                                style={{ padding: "4px 8px", background: "none", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", cursor: i === form.items.length - 1 ? "not-allowed" : "pointer", opacity: i === form.items.length - 1 ? 0.35 : 1 }}>↓</button>
                            <button onClick={() => set("items", form.items.filter((_, x) => x !== i))} title="Delete question"
                                style={{ padding: 7, background: "none", border: "none", cursor: "pointer", color: "#e05555" }}><Trash2 size={14} /></button>
                        </div>
                        <Field label="">
                            <Textarea value={q.answer} onChange={(e) => setItem(i, "answer", e.target.value)} style={{ minHeight: 80 }} />
                        </Field>
                    </div>
                ))}
            </Section>

            <SaveBtn loading={saving} onClick={save} />
        </>
    );
};

/* ── Page shell ───────────────────────────────────────────────── */
const PagesPage: React.FC = () => {
    const [tab, setTab] = useState<TabId>("privacy");
    const [lastSaved, setLastSaved] = useState<string | null>(null);
    const onSave = () => setLastSaved(new Date().toLocaleTimeString());

    return (
        <div>
            {/* Page header */}
            <PageHeader
                title="Pages"
                description="Contact, FAQ, Privacy Policy and Terms of Use."
            />
            <div className="adm-row-between" style={{ marginBottom: 24 }}>
                {lastSaved && (
                    <span style={{ fontSize: "0.78rem", color: "var(--accent-text)", fontWeight: 600 }}>
                        Last saved at {lastSaved}
                    </span>
                )}
            </div>

            {/* Tab bar */}
            <div style={{
                display: "flex",
                background: "#fff",
                borderRadius: "var(--radius)",
                border: "1px solid var(--border)",
                marginBottom: 28,
                overflowX: "auto",
                boxShadow: "var(--shadow)",
            }}>
                {TABS.map((t) => (
                    <button key={t.id} onClick={() => setTab(t.id)} style={tabStyle(tab === t.id)}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* key forces a fresh form when switching between privacy and terms */}
            {tab === "faq"
                ? <FaqEditor onSave={onSave} />
                : <PolicyEditor key={tab} section={tab} onSave={onSave} />}
        </div>
    );
};

export default PagesPage;
