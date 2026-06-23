import React, { useState } from "react";
import { readStore, updateSection } from "../cms/cmsStore";
import { Card } from "../components/ui/Card";
import { Field, Input, Textarea, SaveBtn } from "../components/ui/Field";
import { useToast } from "../components/ui/Toast";
import type {
    BrandData, HeroData, StatItem, AboutData,
    CommitmentData, NewsletterData, NavLink, FooterData, FooterNavColumn,
} from "../types/cms.types";
import { Plus, Trash2, GripVertical } from "lucide-react";

/* ── Tab bar ──────────────────────────────────────────────────── */
const TABS = [
    { id: "brand", label: "Brand" },
    { id: "hero", label: "Hero" },
    { id: "stats", label: "Stats" },
    { id: "about", label: "About" },
    { id: "commitment", label: "Commitment" },
    { id: "newsletter", label: "Newsletter" },
    { id: "navigation", label: "Navigation" },
    { id: "footer", label: "Footer" },
] as const;
type TabId = (typeof TABS)[number]["id"];

/* ── Tab styles helper ────────────────────────────────────────── */
const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "10px 20px",
    fontSize: "0.82rem",
    fontWeight: 700,
    letterSpacing: "0.06em",
    border: "none",
    borderBottom: active ? "2px solid var(--gold)" : "2px solid transparent",
    background: "transparent",
    color: active ? "var(--gold)" : "var(--text-muted)",
    cursor: "pointer",
    transition: "all 0.18s",
    whiteSpace: "nowrap",
    fontFamily: "var(--font-body)",
});

/* ═══════════════════ TAB PANELS ══════════════════════════════ */

/* ── Brand ────────────────────────────────────────────────────── */
const BrandTab: React.FC<{ onSave: () => void }> = ({ onSave }) => {
  const { toast } = useToast();
  const [form, setForm] = useState<BrandData>(() => readStore().brand);
  const [saving, setSaving] = useState(false);
  
  const set = (k: keyof BrandData, v: unknown) => {
    setForm((f) => {
      let updated = { ...f, [k]: v };
      // If we're toggling useDefaultTime, update all open days' times
      if (k === "useDefaultTime" && v === true) {
        updated.hours = updated.hours.map(h => 
          h.isClosed ? h : { ...h, openTime: "09:00", closeTime: "17:00" }
        );
      }
      return updated;
    });
  };
  
  const setHour = (i: number, f2: keyof BrandData["hours"][0], v: unknown) => {
    const h = [...form.hours]; 
    h[i] = { ...h[i], [f2]: v }; 
    set("hours", h);
  };
  
  const setSocial = (k: keyof typeof form.socialLinks, v: string) =>
    set("socialLinks", { ...form.socialLinks, [k]: v });
    
  const save = async () => {
    setSaving(true); 
    await new Promise((r) => setTimeout(r, 300));
    
    // Ensure that if useDefaultTime is true, all open days have the correct times before saving
    const dataToSave = { 
      ...form, 
      hours: form.useDefaultTime 
        ? form.hours.map(h => h.isClosed ? h : { ...h, openTime: "09:00", closeTime: "17:00" }) 
        : form.hours 
    };
    
    updateSection("brand", dataToSave); 
    setSaving(false);
    toast("Brand settings saved!"); 
    onSave();
  };
    return (
        <>
            <Card title="Brand Identity">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                    <Field label="Brand Name" required><Input value={form.name} onChange={(e) => set("name", e.target.value)} /></Field>
                    <Field label="Tagline"><Input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} /></Field>
                </div>
                <Field label="Short Description">
                    <Textarea value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} style={{ minHeight: 90 }} />
                </Field>
            </Card>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr", gap: 24, width: "100%" }}>
                <Card title="Contact">
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                        <Field label="Email"><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>
                        <Field label="Phone"><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
                        <Field label="Phone Display"><Input value={form.phoneDisplay} onChange={(e) => set("phoneDisplay", e.target.value)} /></Field>
                        <Field label="Location"><Input value={form.location} onChange={(e) => set("location", e.target.value)} /></Field>
                    </div>
                    <Field label="Maps Embed URL"><Input value={form.mapEmbed} onChange={(e) => set("mapEmbed", e.target.value)} /></Field>
                </Card>
                {/* Business Hours*/}
            <Card title="Business Hours">
                <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid var(--border)" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "0.9rem", fontWeight: 600, color: "var(--text-main)" }}>
                        <input 
                            type="checkbox" 
                            checked={form.useDefaultTime} 
                            onChange={(e) => set("useDefaultTime", e.target.checked)} 
                        />
                        Default Time (09:00 AM – 05:00 PM)
                    </label>
                </div>
                
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: "left", padding: "8px 12px", borderBottom: "1px solid var(--border)", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>Day</th>
                            <th style={{ textAlign: "left", padding: "8px 12px", borderBottom: "1px solid var(--border)", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>From</th>
                            <th style={{ textAlign: "left", padding: "8px 12px", borderBottom: "1px solid var(--border)", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>To</th>
                            <th style={{ textAlign: "center", padding: "8px 12px", borderBottom: "1px solid var(--border)", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>Is Closed</th>
                        </tr>
                    </thead>
                    <tbody>
                        {form.hours.map((h, i) => (
                            <tr key={i}>
                                <td style={{ padding: "12px", borderBottom: "1px solid var(--border)" }}>
                                    <span style={{ fontWeight: 600, color: "var(--text-main)" }}>{h.day}</span>
                                </td>
                                <td style={{ padding: "12px", borderBottom: "1px solid var(--border)" }}>
                                    <Field label="">
                                        <Input 
                                            type="time" 
                                            value={form.useDefaultTime && !h.isClosed ? "09:00" : h.openTime} 
                                            onChange={(e) => setHour(i, "openTime", e.target.value)} 
                                            disabled={form.useDefaultTime || h.isClosed}
                                        />
                                    </Field>
                                </td>
                                <td style={{ padding: "12px", borderBottom: "1px solid var(--border)" }}>
                                    <Field label="">
                                        <Input 
                                            type="time" 
                                            value={form.useDefaultTime && !h.isClosed ? "17:00" : h.closeTime} 
                                            onChange={(e) => setHour(i, "closeTime", e.target.value)} 
                                            disabled={form.useDefaultTime || h.isClosed}
                                        />
                                    </Field>
                                </td>
                                <td style={{ padding: "12px", borderBottom: "1px solid var(--border)", textAlign: "center" }}>
                                    <input 
                                        type="checkbox" 
                                        checked={h.isClosed} 
                                        onChange={(e) => setHour(i, "isClosed", e.target.checked)} 
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
                {/* Social Links */}
                <Card title="Social Links">
                    <div>
                        <Field label="Instagram"><Input value={form.socialLinks.instagram} onChange={(e) => setSocial("instagram", e.target.value)} /></Field>
                        <Field label="Facebook"><Input value={form.socialLinks.facebook} onChange={(e) => setSocial("facebook", e.target.value)} /></Field>
                        <Field label="Pinterest"><Input value={form.socialLinks.pinterest} onChange={(e) => setSocial("pinterest", e.target.value)} /></Field>
                    </div>
                </Card>
            </div >
            <SaveBtn loading={saving} onClick={save} />
        </>
    );
};

/* ── Hero ─────────────────────────────────────────────────────── */
const HeroTab: React.FC<{ onSave: () => void }> = ({ onSave }) => {
    const { toast } = useToast();
    const [form, setForm] = useState<HeroData>(() => readStore().hero);
    const [saving, setSaving] = useState(false);
    const set = (k: keyof HeroData, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
    const setCta = (cta: "ctaPrimary" | "ctaSecondary", field: "label" | "href", v: string) =>
        setForm((f) => ({ ...f, [cta]: { ...f[cta], [field]: v } }));
    const save = async () => {
        setSaving(true); await new Promise((r) => setTimeout(r, 300));
        updateSection("hero", form); setSaving(false);
        toast("Hero saved!"); onSave();
    };
    return (
        <>
            <Card title="Labels & Heading">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                    <Field label="Small Label"><Input value={form.smallLabel} onChange={(e) => set("smallLabel", e.target.value)} /></Field>
                    <Field label="Highlight Pill"><Input value={form.smallLabelHighlight} onChange={(e) => set("smallLabelHighlight", e.target.value)} /></Field>
                </div>
                <Field label="Main Heading" hint="Use \n for line break">
                    <Textarea value={form.mainHeading} onChange={(e) => set("mainHeading", e.target.value)} style={{ minHeight: 72, fontFamily: "var(--font-display)", fontSize: "1.05rem" }} />
                </Field>
                <Field label="Description">
                    <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} />
                </Field>
            </Card>
            <Card title="CTA Buttons">
                <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 12 }}>Primary</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                        <Field label="Label"><Input value={form.ctaPrimary.label} onChange={(e) => setCta("ctaPrimary", "label", e.target.value)} /></Field>
                        <Field label="Link"><Input value={form.ctaPrimary.href} onChange={(e) => setCta("ctaPrimary", "href", e.target.value)} /></Field>
                    </div>
                </div>
                <div style={{ paddingTop: 20, borderTop: "1px solid var(--border)" }}>
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 12 }}>Secondary</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                        <Field label="Label"><Input value={form.ctaSecondary.label} onChange={(e) => setCta("ctaSecondary", "label", e.target.value)} /></Field>
                        <Field label="Link"><Input value={form.ctaSecondary.href} onChange={(e) => setCta("ctaSecondary", "href", e.target.value)} /></Field>
                    </div>
                </div>
            </Card>
            <Card title="Live Preview">
                <div style={{ background: "var(--charcoal)", borderRadius: "var(--radius-sm)", padding: "28px 24px" }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
                        <span style={{ fontSize: "0.72rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)" }}>{form.smallLabel}</span>
                        <span style={{ background: "var(--gold)", color: "#fff", fontSize: "0.70rem", fontWeight: 700, padding: "3px 12px", borderRadius: 3 }}>{form.smallLabelHighlight}</span>
                    </div>
                    <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.4rem, 2.5vw, 2.2rem)", fontWeight: 700, color: "#fff", whiteSpace: "pre-line", lineHeight: 1.1, marginBottom: 12 }}>
                        {form.mainHeading}
                    </h2>
                    <p style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.55)", maxWidth: 480 }}>{form.description}</p>
                </div>
            </Card>
            <SaveBtn loading={saving} onClick={save} />
        </>
    );
};

/* ── Stats ────────────────────────────────────────────────────── */
const StatsTab: React.FC<{ onSave: () => void }> = ({ onSave }) => {
    const { toast } = useToast();
    const [stats, setStats] = useState<StatItem[]>(() => readStore().stats);
    const [saving, setSaving] = useState(false);
    const setItem = (i: number, k: keyof StatItem, v: string) => {
        const n = [...stats]; n[i] = { ...n[i], [k]: v }; setStats(n);
    };
    const save = async () => {
        if (stats.some((s) => !s.value.trim() || !s.label.trim())) { toast("All fields required.", "error"); return; }
        setSaving(true); await new Promise((r) => setTimeout(r, 300));
        updateSection("stats", stats); setSaving(false);
        toast("Stats saved!"); onSave();
    };
    return (
        <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16, marginBottom: 24 }}>
                {stats.map((s, i) => (
                    <Card key={i} title={`Stat ${i + 1}`} action={
                        stats.length > 1 ? (
                            <button onClick={() => setStats((p) => p.filter((_, x) => x !== i))}
                                style={{ fontSize: "0.75rem", color: "#e05555", background: "#fff0f0", border: "1px solid #f5c0c0", borderRadius: "var(--radius-sm)", padding: "4px 10px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600 }}>
                                Remove
                            </button>
                        ) : undefined
                    }>
                        <Field label="Value" hint="E.g. 140+"><Input value={s.value} onChange={(e) => setItem(i, "value", e.target.value)} /></Field>
                        <Field label="Label"><Input value={s.label} onChange={(e) => setItem(i, "label", e.target.value)} /></Field>
                    </Card>
                ))}
            </div>
            {/* Preview */}
            <div style={{ background: "var(--charcoal)", borderRadius: "var(--radius)", padding: "20px 24px", marginBottom: 20, display: "flex" }}>
                {stats.map((s, i) => (
                    <div key={i} style={{ flex: 1, textAlign: "center", padding: "6px 10px", borderRight: i < stats.length - 1 ? "1px solid rgba(255,255,255,0.12)" : "none" }}>
                        <div style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700, color: "var(--gold-light)" }}>{s.value || "—"}</div>
                        <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.50)", marginTop: 4 }}>{s.label || "Label"}</div>
                    </div>
                ))}
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <button onClick={() => setStats((p) => [...p, { value: "", label: "" }])}
                    style={{ padding: "9px 20px", background: "transparent", border: "1.5px solid var(--gold)", color: "var(--gold)", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.80rem", cursor: "pointer" }}>
                    + Add Stat
                </button>
                <SaveBtn loading={saving} onClick={save} />
            </div>
        </>
    );
};

/* ── About ────────────────────────────────────────────────────── */
const AboutTab: React.FC<{ onSave: () => void }> = ({ onSave }) => {
    const { toast } = useToast();
    const [form, setForm] = useState<AboutData>(() => readStore().about);
    const [saving, setSaving] = useState(false);
    const set = (k: keyof AboutData, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
    const setCta = (f2: "label" | "href", v: string) => setForm((f) => ({ ...f, cta: { ...f.cta, [f2]: v } }));
    const setReason = (i: number, f2: "title" | "body", v: string) => {
        const r = [...form.reasons]; r[i] = { ...r[i], [f2]: v }; set("reasons", r);
    };
    const save = async () => {
        setSaving(true); await new Promise((r) => setTimeout(r, 300));
        updateSection("about", form); setSaving(false);
        toast("About saved!"); onSave();
    };
    return (
        <>
            <Card title="About Block">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                    <Field label="Section Label"><Input value={form.sectionLabel} onChange={(e) => set("sectionLabel", e.target.value)} /></Field>
                    <Field label="Headline"><Input value={form.headline} onChange={(e) => set("headline", e.target.value)} /></Field>
                </div>
                <Field label="Body"><Textarea value={form.body} onChange={(e) => set("body", e.target.value)} style={{ minHeight: 90 }} /></Field>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                    <Field label="CTA Label"><Input value={form.cta.label} onChange={(e) => setCta("label", e.target.value)} /></Field>
                    <Field label="CTA Link"><Input value={form.cta.href} onChange={(e) => setCta("href", e.target.value)} /></Field>
                </div>
            </Card>
            <Card title="Why Choose Us">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                    <Field label="Headline"><Input value={form.whyHeadline} onChange={(e) => set("whyHeadline", e.target.value)} /></Field>
                    <Field label="Tagline"><Input value={form.whyTagline} onChange={(e) => set("whyTagline", e.target.value)} /></Field>
                </div>
                <div style={{ marginTop: 8 }}>
                    {form.reasons.map((r, i) => (
                        <div key={r.id} style={{ display: "grid", gridTemplateColumns: "40px 1fr 1fr auto", gap: "0 16px", alignItems: "end", marginBottom: 12 }}>
                            <Field label={i === 0 ? "ID" : ""}><Input value={r.id} readOnly style={{ background: "var(--parchment)", cursor: "default" }} /></Field>
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
                        style={{ fontSize: "0.78rem", color: "var(--gold)", background: "transparent", border: "1px solid var(--gold)", borderRadius: "var(--radius-sm)", padding: "5px 14px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 5 }}>
                        <Plus size={12} /> Add Reason
                    </button>
                </div>
            </Card>
            <SaveBtn loading={saving} onClick={save} />
        </>
    );
};

/* ── Commitment ───────────────────────────────────────────────── */
const CommitmentTab: React.FC<{ onSave: () => void }> = ({ onSave }) => {
    const { toast } = useToast();
    const [form, setForm] = useState<CommitmentData>(() => readStore().commitment);
    const [saving, setSaving] = useState(false);
    const set = (k: keyof CommitmentData, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
    const setCta = (f2: "label" | "href", v: string) => setForm((f) => ({ ...f, cta: { ...f.cta, [f2]: v } }));
    const save = async () => {
        setSaving(true); await new Promise((r) => setTimeout(r, 300));
        updateSection("commitment", form); setSaving(false);
        toast("Commitment saved!"); onSave();
    };
    return (
        <>
            <Card title="Content & CTA">
                <Field label="Headline"><Input value={form.headline} onChange={(e) => set("headline", e.target.value)} /></Field>
                <Field label="Body"><Textarea value={form.body} onChange={(e) => set("body", e.target.value)} style={{ minHeight: 110 }} /></Field>
                <div style={{ paddingTop: 16, borderTop: "1px solid var(--border)", marginTop: 4 }}>
                    <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 14 }}>CTA Button</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                        <Field label="Label"><Input value={form.cta.label} onChange={(e) => setCta("label", e.target.value)} /></Field>
                        <Field label="Link"><Input value={form.cta.href} onChange={(e) => setCta("href", e.target.value)} /></Field>
                    </div>
                </div>
            </Card>
            <SaveBtn loading={saving} onClick={save} />
        </>
    );
};

/* ── Newsletter ───────────────────────────────────────────────── */
const NewsletterTab: React.FC<{ onSave: () => void }> = ({ onSave }) => {
    const { toast } = useToast();
    const [form, setForm] = useState<NewsletterData>(() => readStore().newsletter);
    const [saving, setSaving] = useState(false);
    const set = (k: keyof NewsletterData, v: string) => setForm((f) => ({ ...f, [k]: v }));
    const save = async () => {
        setSaving(true); await new Promise((r) => setTimeout(r, 300));
        updateSection("newsletter", form); setSaving(false);
        toast("Newsletter saved!"); onSave();
    };
    return (
        <>
            <Card title="Copy & Form">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                    <Field label="Headline"><Input value={form.headline} onChange={(e) => set("headline", e.target.value)} /></Field>
                    <Field label="Brand Highlight"><Input value={form.brandHighlight} onChange={(e) => set("brandHighlight", e.target.value)} /></Field>
                </div>
                <Field label="Subtext"><Input value={form.subtext} onChange={(e) => set("subtext", e.target.value)} /></Field>
                <div style={{ paddingTop: 16, borderTop: "1px solid var(--border)", marginTop: 4 }}>
                    <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 14 }}>Form</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                        <Field label="Placeholder"><Input value={form.placeholder} onChange={(e) => set("placeholder", e.target.value)} /></Field>
                        <Field label="Button Label"><Input value={form.cta} onChange={(e) => set("cta", e.target.value)} /></Field>
                    </div>
                </div>
            </Card>
            <Card title="Preview">
                <div style={{ background: "var(--charcoal)", borderRadius: "var(--radius-sm)", padding: "24px", textAlign: "center" }}>
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 700, color: "#fff", marginBottom: 8 }}>
                        {form.headline} <span style={{ color: "var(--gold-light)" }}>{form.brandHighlight}</span>
                    </h3>
                    <p style={{ color: "rgba(255,255,255,0.50)", marginBottom: 18, fontSize: "0.85rem" }}>{form.subtext}</p>
                    <div style={{ display: "flex", maxWidth: 380, margin: "0 auto", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
                        <div style={{ flex: 1, background: "rgba(255,255,255,0.07)", padding: "11px 14px", color: "rgba(255,255,255,0.35)", fontSize: "0.84rem", fontStyle: "italic" }}>{form.placeholder}</div>
                        <div style={{ padding: "11px 18px", background: "var(--gold)", color: "#fff", fontSize: "0.78rem", fontWeight: 700 }}>{form.cta}</div>
                    </div>
                </div>
            </Card>
            <SaveBtn loading={saving} onClick={save} />
        </>
    );
};

/* ── Navigation ───────────────────────────────────────────────── */
const NavigationTab: React.FC<{ onSave: () => void }> = ({ onSave }) => {
    const { toast } = useToast();
    const [links, setLinks] = useState<NavLink[]>(() => readStore().navLinks);
    const [saving, setSaving] = useState(false);
    const setLink = (i: number, k: keyof NavLink, v: string) => {
        const n = [...links]; n[i] = { ...n[i], [k]: v }; setLinks(n);
    };
    const moveUp = (i: number) => { if (!i) return; const n = [...links];[n[i - 1], n[i]] = [n[i], n[i - 1]]; setLinks(n); };
    const moveDown = (i: number) => { if (i === links.length - 1) return; const n = [...links];[n[i], n[i + 1]] = [n[i + 1], n[i]]; setLinks(n); };
    const save = async () => {
        if (links.some((l) => !l.label.trim())) { toast("All labels required.", "error"); return; }
        setSaving(true); await new Promise((r) => setTimeout(r, 300));
        updateSection("navLinks", links); setSaving(false);
        toast("Navigation saved!"); onSave();
    };
    return (
        <>
            <Card title="Menu Links" subtitle="Use ↑↓ to reorder" action={
                <button onClick={() => setLinks((p) => [...p, { label: "", href: "#" }])}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 16px", background: "var(--charcoal)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer" }}>
                    <Plus size={13} /> Add
                </button>
            }>
                {links.map((link, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 0", borderBottom: i < links.length - 1 ? "1px solid var(--border)" : "none" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 1, flexShrink: 0 }}>
                            <button onClick={() => moveUp(i)} disabled={!i} style={{ padding: "1px 4px", background: "none", border: "none", cursor: !i ? "not-allowed" : "pointer", opacity: !i ? 0.3 : 1, color: "var(--text-muted)", fontSize: 11 }}>▲</button>
                            <GripVertical size={13} style={{ color: "var(--text-faint)", margin: "0 auto" }} />
                            <button onClick={() => moveDown(i)} disabled={i === links.length - 1} style={{ padding: "1px 4px", background: "none", border: "none", cursor: i === links.length - 1 ? "not-allowed" : "pointer", opacity: i === links.length - 1 ? 0.3 : 1, color: "var(--text-muted)", fontSize: 11 }}>▼</button>
                        </div>
                        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
                            <Field label={i === 0 ? "Label" : ""}><Input value={link.label} onChange={(e) => setLink(i, "label", e.target.value)} placeholder="Home" /></Field>
                            <Field label={i === 0 ? "Href" : ""}><Input value={link.href} onChange={(e) => setLink(i, "href", e.target.value)} placeholder="#home" /></Field>
                        </div>
                        <button onClick={() => setLinks((p) => p.filter((_, x) => x !== i))} disabled={links.length <= 1}
                            style={{ padding: 7, background: "none", border: "none", cursor: links.length <= 1 ? "not-allowed" : "pointer", color: links.length <= 1 ? "var(--text-faint)" : "#e05555", flexShrink: 0 }}>
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
            </Card>
            <Card title="Preview">
                <nav style={{ display: "flex", gap: 6, background: "var(--charcoal)", padding: "12px 18px", borderRadius: "var(--radius-sm)", flexWrap: "wrap" }}>
                    {links.map((l, i) => <span key={i} style={{ fontSize: "0.80rem", fontWeight: 600, color: "rgba(255,255,255,0.65)", padding: "5px 14px", borderRadius: 4 }}>{l.label || "…"}</span>)}
                    <span style={{ marginLeft: "auto", fontSize: "0.76rem", background: "var(--gold)", color: "#fff", fontWeight: 700, padding: "5px 14px", borderRadius: 4 }}>Shop Now</span>
                </nav>
            </Card>
            <SaveBtn loading={saving} onClick={save} />
        </>
    );
};

/* ── Footer ───────────────────────────────────────────────────── */
const FooterTab: React.FC<{ onSave: () => void }> = ({ onSave }) => {
    const { toast } = useToast();
    const [form, setForm] = useState<FooterData>(() => readStore().footer);
    const [saving, setSaving] = useState(false);
    const set = (k: keyof FooterData, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
    const setColumn = (ci: number, k: keyof FooterNavColumn, v: unknown) => {
        const cols = [...form.navColumns]; cols[ci] = { ...cols[ci], [k]: v }; set("navColumns", cols);
    };
    const setColLink = (ci: number, li: number, f2: "label" | "href", v: string) => {
        const cols = [...form.navColumns]; const lnks = [...cols[ci].links];
        lnks[li] = { ...lnks[li], [f2]: v }; cols[ci] = { ...cols[ci], links: lnks }; set("navColumns", cols);
    };
    const addColLink = (ci: number) => {
        const cols = [...form.navColumns]; cols[ci] = { ...cols[ci], links: [...cols[ci].links, { label: "", href: "#" }] }; set("navColumns", cols);
    };
    const removeColLink = (ci: number, li: number) => {
        const cols = [...form.navColumns]; cols[ci] = { ...cols[ci], links: cols[ci].links.filter((_, i) => i !== li) }; set("navColumns", cols);
    };
    const save = async () => {
        setSaving(true); await new Promise((r) => setTimeout(r, 300));
        updateSection("footer", form); setSaving(false);
        toast("Footer saved!"); onSave();
    };
    return (
        <>
            <Card title="Footer Info">
                <Field label="Tagline"><Textarea value={form.tagline} onChange={(e) => set("tagline", e.target.value)} style={{ minHeight: 72 }} /></Field>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                    <Field label="Credit Label"><Input value={form.credit.label} onChange={(e) => set("credit", { ...form.credit, label: e.target.value })} /></Field>
                    <Field label="Credit URL"><Input value={form.credit.href} onChange={(e) => set("credit", { ...form.credit, href: e.target.value })} /></Field>
                </div>
            </Card>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))", gap: 24, marginBottom: 0 }}>
                {form.navColumns.map((col, ci) => (
                    <Card key={ci} title={`Column ${ci + 1}: ${col.heading || "Untitled"}`} action={
                        form.navColumns.length > 1 ? (
                            <button onClick={() => set("navColumns", form.navColumns.filter((_, i) => i !== ci))}
                                style={{ fontSize: "0.75rem", color: "#e05555", background: "#fff0f0", border: "1px solid #f5c0c0", borderRadius: "var(--radius-sm)", padding: "4px 10px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600 }}>
                                Remove
                            </button>
                        ) : undefined
                    }>
                        <Field label="Heading"><Input value={col.heading} onChange={(e) => setColumn(ci, "heading", e.target.value)} /></Field>
                        <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--text-muted)", margin: "4px 0 10px" }}>Links</div>
                        {col.links.map((lnk, li) => (
                            <div key={li} style={{ display: "flex", gap: 10, alignItems: "flex-end", marginBottom: 8 }}>
                                <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 10px" }}>
                                    <Field label={li === 0 ? "Label" : ""}><Input value={lnk.label} onChange={(e) => setColLink(ci, li, "label", e.target.value)} /></Field>
                                    <Field label={li === 0 ? "URL" : ""}><Input value={lnk.href} onChange={(e) => setColLink(ci, li, "href", e.target.value)} /></Field>
                                </div>
                                <button onClick={() => removeColLink(ci, li)} disabled={col.links.length <= 1}
                                    style={{ marginBottom: 20, padding: 7, background: "none", border: "none", cursor: col.links.length <= 1 ? "not-allowed" : "pointer", color: col.links.length <= 1 ? "var(--text-faint)" : "#e05555" }}>
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        ))}
                        <button onClick={() => addColLink(ci)}
                            style={{ fontSize: "0.76rem", color: "var(--gold)", background: "transparent", border: "1px solid var(--gold)", borderRadius: "var(--radius-sm)", padding: "4px 12px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                            <Plus size={11} /> Add Link
                        </button>
                    </Card>
                ))}
            </div>
            <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
                <button onClick={() => set("navColumns", [...form.navColumns, { heading: "", links: [{ label: "", href: "#" }] }])}
                    style={{ padding: "9px 20px", background: "transparent", border: "1.5px solid var(--gold)", color: "var(--gold)", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.80rem", cursor: "pointer" }}>
                    + Add Column
                </button>
                <SaveBtn loading={saving} onClick={save} />
            </div>
        </>
    );
};

/* ═══════════════════ MAIN PAGE ═══════════════════════════════ */
const GlobalSettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabId>("brand");
    const [lastSaved, setLastSaved] = useState<string | null>(null);
    const onSave = () => setLastSaved(new Date().toLocaleTimeString());

    const tabContent: Record<TabId, React.ReactNode> = {
        brand: <BrandTab onSave={onSave} />,
        hero: <HeroTab onSave={onSave} />,
        stats: <StatsTab onSave={onSave} />,
        about: <AboutTab onSave={onSave} />,
        commitment: <CommitmentTab onSave={onSave} />,
        newsletter: <NewsletterTab onSave={onSave} />,
        navigation: <NavigationTab onSave={onSave} />,
        footer: <FooterTab onSave={onSave} />,
    };

    return (
        <div>
            {/* Page header */}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24, gap: 16, flexWrap: "wrap" }}>
                <div>
                    <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.9rem", fontWeight: 700, color: "var(--text-main)", marginBottom: 4 }}>
                        Global Settings
                    </h1>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        All website sections in one place.
                    </p>
                </div>
                {lastSaved && (
                    <span style={{ fontSize: "0.78rem", color: "var(--gold)", fontWeight: 600 }}>
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
                    <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        style={tabStyle(activeTab === t.id)}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Active tab panel */}
            <div key={activeTab}>
                {tabContent[activeTab]}
            </div>
        </div>
    );
};

export default GlobalSettingsPage;
