import React, { useState } from "react";
import { readStore, updateSection } from "../cms/cmsStore";
import { Card } from "../components/ui/Card";
import { Field, Input, Textarea, SaveBtn } from "../components/ui/Field";
import { useToast } from "../components/ui/Toast";
import type { HeroData } from "../types/cms.types";

const HeroPage: React.FC = () => {
    const { toast } = useToast();
    const [form, setForm] = useState<HeroData>(() => readStore().hero);
    const [saving, setSaving] = useState(false);

    const set = (key: keyof HeroData, value: unknown) =>
        setForm((f) => ({ ...f, [key]: value }));

    const setCta = (cta: "ctaPrimary" | "ctaSecondary", field: "label" | "href", value: string) =>
        setForm((f) => ({ ...f, [cta]: { ...f[cta], [field]: value } }));

    const handleSave = async () => {
        setSaving(true);
        await new Promise((r) => setTimeout(r, 350));
        updateSection("hero", form);
        setSaving(false);
        toast("Hero section saved!");
    };

    return (
        <div>
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.9rem", fontWeight: 700, color: "var(--text-main)", marginBottom: 6 }}>Hero Section</h1>
                <p style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>The full-screen landing section with headline and CTAs.</p>
            </div>

            <Card title="Labels & Heading">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                    <Field label="Small Label" hint="E.g. LUXURY &">
                        <Input value={form.smallLabel} onChange={(e) => set("smallLabel", e.target.value)} />
                    </Field>
                    <Field label="Highlight Pill" hint="E.g. PREMIUM">
                        <Input value={form.smallLabelHighlight} onChange={(e) => set("smallLabelHighlight", e.target.value)} />
                    </Field>
                </div>
                <Field label="Main Heading" hint="Use \n for line break">
                    <Textarea
                        value={form.mainHeading}
                        onChange={(e) => set("mainHeading", e.target.value)}
                        style={{ minHeight: 80, fontFamily: "var(--font-display)", fontSize: "1.05rem" }}
                    />
                </Field>
                <Field label="Description">
                    <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} />
                </Field>
            </Card>

            <Card title="Call-to-Action Buttons">
                <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 14 }}>Primary CTA</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                        <Field label="Button Label">
                            <Input value={form.ctaPrimary.label} onChange={(e) => setCta("ctaPrimary", "label", e.target.value)} />
                        </Field>
                        <Field label="Button Link">
                            <Input value={form.ctaPrimary.href} onChange={(e) => setCta("ctaPrimary", "href", e.target.value)} />
                        </Field>
                    </div>
                </div>
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: 24 }}>
                    <div style={{ fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 14 }}>Secondary CTA</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                        <Field label="Button Label">
                            <Input value={form.ctaSecondary.label} onChange={(e) => setCta("ctaSecondary", "label", e.target.value)} />
                        </Field>
                        <Field label="Button Link">
                            <Input value={form.ctaSecondary.href} onChange={(e) => setCta("ctaSecondary", "href", e.target.value)} />
                        </Field>
                    </div>
                </div>
            </Card>

            {/* Live preview */}
            <Card title="Heading Preview">
                <div style={{ background: "var(--charcoal)", borderRadius: "var(--radius-sm)", padding: "32px 28px", display: "flex", gap: 12, alignItems: "center" }}>
                    <span style={{ fontSize: "0.75rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)" }}>{form.smallLabel}</span>
                    <span style={{ background: "var(--gold)", color: "#fff", fontSize: "0.72rem", fontWeight: 700, padding: "4px 12px", borderRadius: 3, letterSpacing: "0.12em" }}>{form.smallLabelHighlight}</span>
                </div>
                <div style={{ padding: "16px 0 0" }}>
                    <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.6rem, 3vw, 2.6rem)", fontWeight: 700, color: "var(--text-main)", whiteSpace: "pre-line", lineHeight: 1.1, marginBottom: 14 }}>
                        {form.mainHeading}
                    </h2>
                    <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: 1.75, maxWidth: 480 }}>{form.description}</p>
                </div>
            </Card>

            <SaveBtn loading={saving} onClick={handleSave} />
        </div>
    );
};

export default HeroPage;
