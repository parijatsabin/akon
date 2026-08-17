/**
 * Section editors.
 *
 * These were the six tab panels inside a single 726-line "Global Settings"
 * page — brand identity sitting alongside homepage copy under one label that
 * described neither. The editors themselves were fine; the grouping was not.
 *
 * They now live here as exports so CompanyPage and HomepagePage can each use
 * the ones they need without either file duplicating a form.
 */

import React, { useState } from "react";
import { readStore } from "../../data/siteRepository";
import { saveSection } from "../lib/saveSection";
import { Section } from "../components/ui/Section";
import { Field, Input, Textarea, SaveBtn } from "../components/ui/Field";
import { SaveBar } from "../components/ui/Page";
import { ImageField } from "../components/ui/ImageField";
import { useToast } from "../components/ui/Toast";
import type {
    BrandData, HeroData, AboutData,
    CommitmentData, CommitmentPillar, NewsletterData, FooterData,
} from "../../data/types";
import { Plus, Trash2 } from "lucide-react";

export interface EditorProps { onSave: () => void }

/* ═══════════════════ TAB PANELS ══════════════════════════════ */

/* ── Brand ────────────────────────────────────────────────────── */
export const BrandTab: React.FC<EditorProps> = ({ onSave }) => {
    const { toast } = useToast();
    const [form, setForm] = useState<BrandData>(() => readStore().brand);
    const [saving, setSaving] = useState(false);

    const set = (k: keyof BrandData, v: unknown) => {
        setForm((f) => {
            const updated = { ...f, [k]: v };
            // When enabling default time, stamp 09:00–17:00 on all open days immediately
            if (k === "useDefaultTime" && v === true) {
                updated.hours = updated.hours.map((h) =>
                    h.isClosed ? h : { ...h, openTime: "09:00", closeTime: "17:00" }
                );
            }
            return updated;
        });
    };

    const setHour = (i: number, field: keyof BrandData["hours"][0], value: unknown) => {
        const next = [...form.hours];
        next[i] = { ...next[i], [field]: value };
        // When marking a day as closed, also apply defaults if useDefaultTime is on
        // so the stored value stays consistent
        setForm((f) => ({ ...f, hours: next }));
    };

    const setSocial = (k: keyof typeof form.socialLinks, v: string) =>
        set("socialLinks", { ...form.socialLinks, [k]: v });

    const save = async () => {
        setSaving(true);
        // Always stamp default times on open days when useDefaultTime is on before persisting
        const dataToSave: BrandData = {
            ...form,
            hours: form.useDefaultTime
                ? form.hours.map((h) => (h.isClosed ? h : { ...h, openTime: "09:00", closeTime: "17:00" }))
                : form.hours,
        };
        const ok = await saveSection("brand", dataToSave, toast, "Brand settings saved!");
        setSaving(false);
        if (ok) onSave();
    };

    // Shared th style
    const TH_STYLE: React.CSSProperties = {
        textAlign: "left",
        padding: "10px 14px",
        borderBottom: "2px solid var(--border)",
        fontSize: "0.70rem",
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "var(--text-muted)",
        background: "var(--sunken-deep)",
        whiteSpace: "nowrap",
    };

    // Time input style — shared, disabled state applied via opacity on the row
    const timeInputStyle = (disabled: boolean): React.CSSProperties => ({
        padding: "7px 10px",
        border: "1.5px solid",
        borderColor: disabled ? "var(--border)" : "var(--border)",
        borderRadius: "var(--radius-sm)",
        fontFamily: "var(--font-body)",
        fontSize: "0.84rem",
        color: disabled ? "var(--text-faint)" : "var(--text-main)",
        background: disabled ? "var(--sunken-deep)" : "#fff",
        outline: "none",
        width: "100%",
        cursor: disabled ? "not-allowed" : "text",
        transition: "border-color 0.18s, background 0.18s",
    });

    return (
        <>
            {/* ── Brand Identity ── */}
            <Section title="Brand Identity">
                <div className="adm-grid-2">
                    <Field label="Brand Name" required>
                        <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
                    </Field>
                    <Field label="Tagline">
                        <Input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} />
                    </Field>
                </div>
                <Field label="Short Description">
                    <Textarea value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} style={{ minHeight: 90 }} />
                </Field>
            </Section>

            {/* ── Contact + Social (side by side) ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 24 }}>
                <Section title="Contact">
                    <div className="adm-grid-2">
                        <Field label="Email"><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>
                        <Field label="Phone"><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
                        <Field label="Phone Display"><Input value={form.phoneDisplay} onChange={(e) => set("phoneDisplay", e.target.value)} /></Field>
                        <Field label="Location"><Input value={form.location} onChange={(e) => set("location", e.target.value)} /></Field>
                    </div>
                    <Field label="Maps Embed URL"><Input value={form.mapEmbed} onChange={(e) => set("mapEmbed", e.target.value)} /></Field>
                </Section>

                <Section title="Social Links">
                    <div style={{ minWidth: 220 }}>
                        <Field label="Instagram"><Input value={form.socialLinks.instagram} onChange={(e) => setSocial("instagram", e.target.value)} /></Field>
                        <Field label="Facebook"><Input value={form.socialLinks.facebook} onChange={(e) => setSocial("facebook", e.target.value)} /></Field>
                        <Field label="Pinterest"><Input value={form.socialLinks.pinterest} onChange={(e) => setSocial("pinterest", e.target.value)} /></Field>
                    </div>
                </Section>
            </div>

            {/* ── Business Hours — full width ── */}
            <Section
                title="Business Hours"
                action={
                    /* Default Time toggle */
                    <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none" }}>
                        <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                            Default Time&nbsp;
                            <span style={{ color: "var(--text-faint)", fontWeight: 500 }}>09:00 AM – 05:00 PM</span>
                        </span>
                        {/* Toggle pill */}
                        <span
                            role="checkbox"
                            aria-checked={form.useDefaultTime}
                            onClick={() => set("useDefaultTime", !form.useDefaultTime)}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                width: 44,
                                height: 24,
                                borderRadius: 12,
                                background: form.useDefaultTime ? "var(--accent)" : "var(--border)",
                                padding: "2px",
                                transition: "background 0.22s",
                                flexShrink: 0,
                                cursor: "pointer",
                            }}
                        >
                            <span style={{
                                width: 20,
                                height: 20,
                                borderRadius: "50%",
                                background: "#fff",
                                boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
                                transform: form.useDefaultTime ? "translateX(20px)" : "translateX(0)",
                                transition: "transform 0.22s",
                                display: "block",
                            }} />
                        </span>
                    </label>
                }
            >
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
                        <thead>
                            <tr>
                                <th style={{ ...TH_STYLE, width: "28%" }}>Day</th>
                                <th style={{ ...TH_STYLE, width: "28%" }}>From</th>
                                <th style={{ ...TH_STYLE, width: "28%" }}>To</th>
                                <th style={{ ...TH_STYLE, width: "16%", textAlign: "center" }}>Is Closed</th>
                            </tr>
                        </thead>
                        <tbody>
                            {form.hours.map((h, i) => {
                                const isDisabled = form.useDefaultTime || h.isClosed;
                                const displayOpen = form.useDefaultTime && !h.isClosed ? "09:00" : h.openTime;
                                const displayClose = form.useDefaultTime && !h.isClosed ? "17:00" : h.closeTime;
                                const isLast = i === form.hours.length - 1;

                                return (
                                    <tr
                                        key={h.day}
                                        style={{
                                            background: h.isClosed ? "rgba(224,85,85,0.04)" : "transparent",
                                            transition: "background 0.18s",
                                        }}
                                    >
                                        {/* Day */}
                                        <td style={{ padding: "11px 14px", borderBottom: isLast ? "none" : "1px solid var(--border)" }}>
                                            <span style={{
                                                fontWeight: 600,
                                                fontSize: "0.88rem",
                                                color: h.isClosed ? "var(--text-faint)" : "var(--text-main)",
                                                transition: "color 0.18s",
                                            }}>
                                                {h.day}
                                            </span>
                                        </td>

                                        {/* From */}
                                        <td style={{ padding: "11px 14px", borderBottom: isLast ? "none" : "1px solid var(--border)" }}>
                                            {h.isClosed ? (
                                                <span style={{
                                                    display: "inline-block",
                                                    padding: "7px 12px",
                                                    fontSize: "0.80rem",
                                                    fontWeight: 600,
                                                    color: "#e05555",
                                                    background: "rgba(224,85,85,0.08)",
                                                    borderRadius: "var(--radius-sm)",
                                                    border: "1.5px solid rgba(224,85,85,0.18)",
                                                    letterSpacing: "0.04em",
                                                }}>
                                                    Closed
                                                </span>
                                            ) : (
                                                <input
                                                    type="time"
                                                    value={displayOpen}
                                                    onChange={(e) => setHour(i, "openTime", e.target.value)}
                                                    disabled={isDisabled}
                                                    style={timeInputStyle(isDisabled)}
                                                    onFocus={(e) => { if (!isDisabled) e.currentTarget.style.borderColor = "var(--accent)"; }}
                                                    onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
                                                />
                                            )}
                                        </td>

                                        {/* To */}
                                        <td style={{ padding: "11px 14px", borderBottom: isLast ? "none" : "1px solid var(--border)" }}>
                                            {h.isClosed ? (
                                                <span style={{
                                                    display: "inline-block",
                                                    padding: "7px 12px",
                                                    fontSize: "0.80rem",
                                                    fontWeight: 600,
                                                    color: "#e05555",
                                                    background: "rgba(224,85,85,0.08)",
                                                    borderRadius: "var(--radius-sm)",
                                                    border: "1.5px solid rgba(224,85,85,0.18)",
                                                    letterSpacing: "0.04em",
                                                }}>
                                                    Closed
                                                </span>
                                            ) : (
                                                <input
                                                    type="time"
                                                    value={displayClose}
                                                    onChange={(e) => setHour(i, "closeTime", e.target.value)}
                                                    disabled={isDisabled}
                                                    style={timeInputStyle(isDisabled)}
                                                    onFocus={(e) => { if (!isDisabled) e.currentTarget.style.borderColor = "var(--accent)"; }}
                                                    onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
                                                />
                                            )}
                                        </td>

                                        {/* Is Closed toggle */}
                                        <td style={{ padding: "11px 14px", borderBottom: isLast ? "none" : "1px solid var(--border)", textAlign: "center" }}>
                                            <label style={{ display: "inline-flex", alignItems: "center", cursor: "pointer" }}>
                                                <span
                                                    role="checkbox"
                                                    aria-checked={h.isClosed}
                                                    onClick={() => setHour(i, "isClosed", !h.isClosed)}
                                                    style={{
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        width: 38,
                                                        height: 20,
                                                        borderRadius: 10,
                                                        background: h.isClosed ? "#e05555" : "var(--border)",
                                                        padding: "2px",
                                                        transition: "background 0.22s",
                                                        cursor: "pointer",
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    <span style={{
                                                        width: 16,
                                                        height: 16,
                                                        borderRadius: "50%",
                                                        background: "#fff",
                                                        boxShadow: "0 1px 3px rgba(0,0,0,0.20)",
                                                        transform: h.isClosed ? "translateX(18px)" : "translateX(0)",
                                                        transition: "transform 0.22s",
                                                        display: "block",
                                                    }} />
                                                </span>
                                            </label>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Helper note */}
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--accent)", display: "inline-block", flexShrink: 0 }} />
                        <span style={{ fontSize: "0.75rem", color: "var(--text-faint)" }}>Default Time on — times locked to 09:00 AM – 05:00 PM</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#e05555", display: "inline-block", flexShrink: 0 }} />
                        <span style={{ fontSize: "0.75rem", color: "var(--text-faint)" }}>Is Closed on — day shown as "Closed" on the website</span>
                    </div>
                </div>
            </Section>

            <SaveBar><SaveBtn loading={saving} onClick={save} /></SaveBar>
        </>
    );
};

/* ── Hero ─────────────────────────────────────────────────────── */
export const HeroTab: React.FC<EditorProps> = ({ onSave }) => {
    const { toast } = useToast();
    const [form, setForm] = useState<HeroData>(() => readStore().hero);
    const [saving, setSaving] = useState(false);
    const set = (k: keyof HeroData, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
    const setCta = (cta: "ctaPrimary" | "ctaSecondary", field: "label" | "href", v: string) =>
        setForm((f) => ({ ...f, [cta]: { ...f[cta], [field]: v } }));
    const save = async () => {
        setSaving(true);
        const ok = await saveSection("hero", form, toast, "Hero saved!");
        setSaving(false);
        if (ok) onSave();
    };
    return (
        <>
            <Section title="Labels & Heading">
                <div className="adm-grid-2">
                    <Field label="Small Label"><Input value={form.smallLabel} onChange={(e) => set("smallLabel", e.target.value)} /></Field>
                    <Field label="Highlight Pill"><Input value={form.smallLabelHighlight} onChange={(e) => set("smallLabelHighlight", e.target.value)} /></Field>
                </div>
                <Field label="Main Heading" hint="Use \n for line break">
                    <Textarea value={form.mainHeading} onChange={(e) => set("mainHeading", e.target.value)} style={{ minHeight: 72, fontFamily: "var(--font-display)", fontSize: "1.05rem" }} />
                </Field>
                <Field label="Description">
                    <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} />
                </Field>
            </Section>
            <Section title="Background Media">
                <Field label="Video URL" hint="Direct MP4 link. Takes priority — clear this field to use the image below instead.">
                    <Input value={form.videoUrl} onChange={(e) => set("videoUrl", e.target.value)} placeholder="https://..." />
                </Field>
                <ImageField
                    label="Background Image"
                    hint="Shown only when the video URL is blank."
                    prefix="hero"
                    value={form.backgroundImage}
                    onChange={(src) => set("backgroundImage", src)}
                />
                {!form.videoUrl && form.backgroundImage && (
                    <img src={form.backgroundImage} alt="" style={{ width: "100%", maxHeight: 160, objectFit: "cover", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }} />
                )}
            </Section>
            <Section title="CTA Buttons">
                <div style={{ marginBottom: 20 }}>
                    <div className="adm-item-title" style={{ marginBottom: 10 }}>Primary</div>
                    <div className="adm-grid-2">
                        <Field label="Label"><Input value={form.ctaPrimary.label} onChange={(e) => setCta("ctaPrimary", "label", e.target.value)} /></Field>
                        <Field label="Link"><Input value={form.ctaPrimary.href} onChange={(e) => setCta("ctaPrimary", "href", e.target.value)} /></Field>
                    </div>
                </div>
                <div style={{ paddingTop: 20, borderTop: "1px solid var(--border)" }}>
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 12 }}>Secondary</div>
                    <div className="adm-grid-2">
                        <Field label="Label"><Input value={form.ctaSecondary.label} onChange={(e) => setCta("ctaSecondary", "label", e.target.value)} /></Field>
                        <Field label="Link"><Input value={form.ctaSecondary.href} onChange={(e) => setCta("ctaSecondary", "href", e.target.value)} /></Field>
                    </div>
                </div>
            </Section>
            <Section title="Live Preview">
                <div style={{ background: "var(--noir)", borderRadius: "var(--radius-sm)", padding: "28px 24px" }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
                        <span style={{ fontSize: "0.72rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)" }}>{form.smallLabel}</span>
                        <span style={{ background: "var(--accent)", color: "var(--on-accent)", fontSize: "0.70rem", fontWeight: 700, padding: "3px 12px", borderRadius: 3 }}>{form.smallLabelHighlight}</span>
                    </div>
                    <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.4rem, 2.5vw, 2.2rem)", fontWeight: 700, color: "#fff", whiteSpace: "pre-line", lineHeight: 1.1, marginBottom: 12 }}>
                        {form.mainHeading}
                    </h2>
                    <p style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.55)", maxWidth: 480 }}>{form.description}</p>
                </div>
            </Section>
            <SaveBar><SaveBtn loading={saving} onClick={save} /></SaveBar>
        </>
    );
};

/* ── About ────────────────────────────────────────────────────── */
export const AboutTab: React.FC<EditorProps> = ({ onSave }) => {
    const { toast } = useToast();
    const [form, setForm] = useState<AboutData>(() => readStore().about);
    const [saving, setSaving] = useState(false);
    const set = (k: keyof AboutData, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
    const setCta = (f2: "label" | "href", v: string) => setForm((f) => ({ ...f, cta: { ...f.cta, [f2]: v } }));
    const setReason = (i: number, f2: "title" | "body", v: string) => {
        const r = [...form.reasons]; r[i] = { ...r[i], [f2]: v }; set("reasons", r);
    };
    const save = async () => {
        setSaving(true);
        const ok = await saveSection("about", form, toast, "About saved!");
        setSaving(false);
        if (ok) onSave();
    };
    return (
        <>
            <Section title="About Block">
                <div className="adm-grid-2">
                    <Field label="Section Label"><Input value={form.sectionLabel} onChange={(e) => set("sectionLabel", e.target.value)} /></Field>
                    <Field label="Headline"><Input value={form.headline} onChange={(e) => set("headline", e.target.value)} /></Field>
                </div>
                <Field label="Body (main paragraph)">
                    <Textarea value={form.body} onChange={(e) => set("body", e.target.value)} style={{ minHeight: 90 }} />
                </Field>
                <Field label="Body Extended" hint="Optional second paragraph shown on the About page.">
                    <Textarea value={form.bodyExtended ?? ""} onChange={(e) => set("bodyExtended", e.target.value)} style={{ minHeight: 90 }} />
                </Field>
                <Field label="Brand Quote" hint="The italic pull-quote shown in the story card.">
                    <Textarea value={form.brandQuote ?? ""} onChange={(e) => set("brandQuote", e.target.value)} style={{ minHeight: 72 }} />
                </Field>
                <div className="adm-grid-2">
                    <Field label="CTA Label"><Input value={form.cta.label} onChange={(e) => setCta("label", e.target.value)} /></Field>
                    <Field label="CTA Link"><Input value={form.cta.href} onChange={(e) => setCta("href", e.target.value)} /></Field>
                </div>
            </Section>
            <Section title="Why Choose Us">
                <div className="adm-grid-2">
                    <Field label="Headline"><Input value={form.whyHeadline} onChange={(e) => set("whyHeadline", e.target.value)} /></Field>
                    <Field label="Tagline"><Input value={form.whyTagline} onChange={(e) => set("whyTagline", e.target.value)} /></Field>
                </div>
                <Field label="Section Tag" hint="Small uppercase label above the headline.">
                    <Input value={form.differenceSectionTag} onChange={(e) => set("differenceSectionTag", e.target.value)} />
                </Field>
                <div style={{ marginTop: 8 }}>
                    {form.reasons.map((r, i) => (
                        <div key={r.id} style={{ display: "grid", gridTemplateColumns: "40px 1fr 1fr auto", gap: "0 16px", alignItems: "end", marginBottom: 12 }}>
                            <Field label={i === 0 ? "ID" : ""}><Input value={r.id} readOnly style={{ background: "var(--sunken-deep)", cursor: "default" }} /></Field>
                            <Field label={i === 0 ? "Title" : ""}><Input value={r.title} onChange={(e) => setReason(i, "title", e.target.value)} /></Field>
                            <Field label={i === 0 ? "Body" : ""}><Input value={r.body} onChange={(e) => setReason(i, "body", e.target.value)} /></Field>
                            <div style={{ paddingBottom: 20 }}>
                                {form.reasons.length > 1 && (
                                    <button onClick={() => set("reasons", form.reasons.filter((_, x) => x !== i))}
                                        style={{ padding: 7, background: "none", border: "none", cursor: "pointer", color: "#e05555" }}><Trash2 size={14} /></button>
                                )}
                            </div>
                        </div>
                    ))}
                    <button onClick={() => set("reasons", [...form.reasons, { id: String(form.reasons.length + 1).padStart(2, "0"), title: "", body: "" }])}
                        style={{ fontSize: "0.78rem", color: "var(--accent-text)", background: "transparent", border: "1px solid var(--accent)", borderRadius: "var(--radius-sm)", padding: "5px 14px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 5 }}>
                        <Plus size={12} /> Add Reason
                    </button>
                </div>
            </Section>
            <Section title="Closing CTA Strip">
                <div className="adm-grid-2">
                    <Field label="Tag"><Input value={form.ctaStripTag} onChange={(e) => set("ctaStripTag", e.target.value)} /></Field>
                    <Field label="Heading"><Input value={form.ctaStripHeading} onChange={(e) => set("ctaStripHeading", e.target.value)} /></Field>
                </div>
                <ImageField
                    label="Background Image"
                    hint="Remove it for a plain background."
                    value={form.ctaStripImage}
                    onChange={(src) => set("ctaStripImage", src)}
                />
                {form.ctaStripImage !== "" && (
                    <img src={form.ctaStripImage} alt="" style={{ width: "100%", maxHeight: 150, objectFit: "cover", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }} />
                )}
            </Section>
            <SaveBar><SaveBtn loading={saving} onClick={save} /></SaveBar>
        </>
    );
};

/* ── Commitment ───────────────────────────────────────────────── */
export const CommitmentTab: React.FC<EditorProps> = ({ onSave }) => {
    const { toast } = useToast();
    const [form, setForm] = useState<CommitmentData>(() => readStore().commitment);
    const [saving, setSaving] = useState(false);
    const set = (k: keyof CommitmentData, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
    const setCta = (f2: "label" | "href", v: string) => setForm((f) => ({ ...f, cta: { ...f.cta, [f2]: v } }));

    const setPillar = (i: number, k: keyof CommitmentPillar, v: string) => {
        const next = [...form.pillars]; next[i] = { ...next[i], [k]: v }; set("pillars", next);
    };
    const addPillar = () => set("pillars", [...form.pillars, { id: `p${Date.now()}`, icon: "✦", title: "", body: "" }]);
    const removePillar = (i: number) => set("pillars", form.pillars.filter((_, x) => x !== i));

    const save = async () => {
        setSaving(true);
        const ok = await saveSection("commitment", form, toast, "Commitment saved!");
        setSaving(false);
        if (ok) onSave();
    };
    return (
        <>
            <Section title="Content & CTA">
                <Field label="Tag" hint="Small uppercase label above the headline."><Input value={form.tag} onChange={(e) => set("tag", e.target.value)} /></Field>
                <Field label="Headline"><Input value={form.headline} onChange={(e) => set("headline", e.target.value)} /></Field>
                <Field label="Body"><Textarea value={form.body} onChange={(e) => set("body", e.target.value)} style={{ minHeight: 110 }} /></Field>
                <ImageField
                    label="Section Image"
                    hint="Remove it for the centred, text-only layout."
                    value={form.imageUrl}
                    onChange={(src) => set("imageUrl", src)}
                />
                {form.imageUrl !== "" && (
                    <img src={form.imageUrl} alt="" style={{ width: 160, aspectRatio: "4/5", objectFit: "cover", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }} />
                )}
                <div style={{ paddingTop: 16, borderTop: "1px solid var(--border)", marginTop: 4 }}>
                    <div className="adm-item-title" style={{ marginBottom: 10 }}>CTA Button</div>
                    <div className="adm-grid-2">
                        <Field label="Label"><Input value={form.cta.label} onChange={(e) => setCta("label", e.target.value)} /></Field>
                        <Field label="Link"><Input value={form.cta.href} onChange={(e) => setCta("href", e.target.value)} /></Field>
                    </div>
                </div>
            </Section>

            <Section title="Commitment Pillars" action={
                <button onClick={addPillar}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 16px", background: "var(--noir)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer" }}>
                    <Plus size={13} /> Add Pillar
                </button>
            }>
                {form.pillars.map((p, i) => (
                    <div key={p.id} style={{ display: "grid", gridTemplateColumns: "52px 1fr 1fr auto", gap: "0 12px", alignItems: "end", marginBottom: 12, padding: "12px 0", borderBottom: i < form.pillars.length - 1 ? "1px solid var(--border)" : "none" }}>
                        <Field label={i === 0 ? "Icon" : ""} hint="Emoji">
                            <Input value={p.icon} onChange={(e) => setPillar(i, "icon", e.target.value)} style={{ textAlign: "center", fontSize: "1.2rem" }} />
                        </Field>
                        <Field label={i === 0 ? "Title" : ""}>
                            <Input value={p.title} onChange={(e) => setPillar(i, "title", e.target.value)} placeholder="Responsibly Sourced" />
                        </Field>
                        <Field label={i === 0 ? "Body" : ""}>
                            <Input value={p.body} onChange={(e) => setPillar(i, "body", e.target.value)} placeholder="Description…" />
                        </Field>
                        <div style={{ paddingBottom: 20 }}>
                            <button onClick={() => removePillar(i)} disabled={form.pillars.length <= 1}
                                style={{ padding: 7, background: "none", border: "none", cursor: form.pillars.length <= 1 ? "not-allowed" : "pointer", color: form.pillars.length <= 1 ? "var(--text-faint)" : "#e05555" }}>
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </Section>

            <SaveBar><SaveBtn loading={saving} onClick={save} /></SaveBar>
        </>
    );
};

/* ── Newsletter ───────────────────────────────────────────────── */
export const NewsletterTab: React.FC<EditorProps> = ({ onSave }) => {
    const { toast } = useToast();
    const [form, setForm] = useState<NewsletterData>(() => readStore().newsletter);
    const [saving, setSaving] = useState(false);
    const set = (k: keyof NewsletterData, v: string) => setForm((f) => ({ ...f, [k]: v }));
    const save = async () => {
        setSaving(true);
        const ok = await saveSection("newsletter", form, toast, "Newsletter saved!");
        setSaving(false);
        if (ok) onSave();
    };
    return (
        <>
            <Section title="Copy & Form">
                <div className="adm-grid-2">
                    <Field label="Headline"><Input value={form.headline} onChange={(e) => set("headline", e.target.value)} /></Field>
                    <Field label="Brand Highlight"><Input value={form.brandHighlight} onChange={(e) => set("brandHighlight", e.target.value)} /></Field>
                </div>
                <Field label="Subtext"><Input value={form.subtext} onChange={(e) => set("subtext", e.target.value)} /></Field>
                <div style={{ paddingTop: 16, borderTop: "1px solid var(--border)", marginTop: 4 }}>
                    <div className="adm-item-title" style={{ marginBottom: 10 }}>Form</div>
                    <div className="adm-grid-2">
                        <Field label="Placeholder"><Input value={form.placeholder} onChange={(e) => set("placeholder", e.target.value)} /></Field>
                        <Field label="Button Label"><Input value={form.cta} onChange={(e) => set("cta", e.target.value)} /></Field>
                    </div>
                </div>
                <ImageField
                    label="Background Image"
                    hint="A dark scrim is applied automatically. Remove it for a plain background."
                    value={form.backgroundImage}
                    onChange={(src) => set("backgroundImage", src)}
                />
            </Section>
            <Section title="Preview">
                <div style={{ background: "var(--noir)", borderRadius: "var(--radius-sm)", padding: "24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
                    {form.backgroundImage !== "" && (
                        <>
                            <img src={form.backgroundImage} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                            <div style={{ position: "absolute", inset: 0, background: "rgba(20,16,13,0.80)" }} />
                        </>
                    )}
                    <div style={{ position: "relative" }}>
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 700, color: "#fff", marginBottom: 8 }}>
                        {form.headline} <span style={{ color: "var(--accent-soft)" }}>{form.brandHighlight}</span>
                    </h3>
                    <p style={{ color: "rgba(255,255,255,0.50)", marginBottom: 18, fontSize: "0.85rem" }}>{form.subtext}</p>
                    <div style={{ display: "flex", maxWidth: 380, margin: "0 auto", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
                        <div style={{ flex: 1, background: "rgba(255,255,255,0.07)", padding: "11px 14px", color: "rgba(255,255,255,0.35)", fontSize: "0.84rem", fontStyle: "italic" }}>{form.placeholder}</div>
                        <div style={{ padding: "11px 18px", background: "var(--accent)", color: "var(--on-accent)", fontSize: "0.78rem", fontWeight: 700 }}>{form.cta}</div>
                    </div>
                    </div>
                </div>
            </Section>
            <SaveBar><SaveBtn loading={saving} onClick={save} /></SaveBar>
        </>
    );
};

/* ── Navigation ───────────────────────────────────────────────── */

/* ── Footer ───────────────────────────────────────────────────── */
export const FooterTab: React.FC<EditorProps> = ({ onSave }) => {
    const { toast } = useToast();
    const [form, setForm] = useState<FooterData>(() => readStore().footer);
    const [saving, setSaving] = useState(false);
    const set = (k: keyof FooterData, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
    const save = async () => {
        setSaving(true);
        const ok = await saveSection("footer", form, toast, "Footer saved!");
        setSaving(false);
        if (ok) onSave();
    };
    return (
        <>
            <Section title="Footer Info">
                <Field label="Tagline"><Textarea value={form.tagline} onChange={(e) => set("tagline", e.target.value)} style={{ minHeight: 72 }} /></Field>
                <div className="adm-grid-2">
                    <Field label="Credit Label"><Input value={form.credit.label} onChange={(e) => set("credit", { ...form.credit, label: e.target.value })} /></Field>
                    <Field label="Credit URL"><Input value={form.credit.href} onChange={(e) => set("credit", { ...form.credit, href: e.target.value })} /></Field>
                </div>
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 4 }}>
                    The footer’s link columns (Company / Support) and the top navigation
                    point at fixed routes and are set in the code, not here.
                </p>
            </Section>
            <SaveBar><SaveBtn loading={saving} onClick={save} /></SaveBar>
        </>
    );
};
