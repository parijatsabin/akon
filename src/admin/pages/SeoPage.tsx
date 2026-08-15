import React, { useState } from "react";
import { readStore } from "../../data/siteRepository";
import { saveSection } from "../lib/saveSection";
import { Section } from "../components/ui/Section";
import { Field, Input, Textarea, SaveBtn } from "../components/ui/Field";
import { useToast } from "../components/ui/Toast";
import type { SeoData } from "../../data/types";
import { Search } from "lucide-react";

const SeoPage: React.FC = () => {
    const { toast } = useToast();
    const [form, setForm] = useState<SeoData>(() => readStore().seo);
    const [saving, setSaving] = useState(false);

    const set = (k: keyof SeoData, v: string) => setForm((f) => ({ ...f, [k]: v }));

    const handleSave = async () => {
        if (!form.metaTitle.trim()) { toast("Meta title is required.", "error"); return; }
        setSaving(true);
        await saveSection("seo", form, toast, "SEO settings saved!");
        setSaving(false);
    };

    return (
        <div>
            <div style={{ marginBottom: 32 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "var(--radius-sm)", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--on-accent)" }}>
                        <Search size={20} />
                    </div>
                    <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.9rem", fontWeight: 700, color: "var(--text-main)" }}>
                        SEO Settings
                    </h1>
                </div>
                <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginLeft: 52 }}>
                    Control how your site appears in search engines and when shared on social media.
                </p>
            </div>

            {/* Search Engine */}
            <Section title="Search Engine">
                <Field label="Meta Title" required hint="Shown in browser tabs and search results. Ideal: 50–60 characters.">
                    <Input value={form.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} />
                    <div style={{ marginTop: 5, fontSize: "0.72rem", color: form.metaTitle.length > 60 ? "#e05555" : "var(--text-faint)" }}>
                        {form.metaTitle.length} / 60 characters
                    </div>
                </Field>
                <Field label="Meta Description" hint="Shown under the title in search results. Ideal: 150–160 characters.">
                    <Textarea value={form.metaDescription} onChange={(e) => set("metaDescription", e.target.value)} style={{ minHeight: 80 }} />
                    <div style={{ marginTop: 5, fontSize: "0.72rem", color: form.metaDescription.length > 160 ? "#e05555" : "var(--text-faint)" }}>
                        {form.metaDescription.length} / 160 characters
                    </div>
                </Field>
                <Field label="Keywords" hint="Comma-separated. Less important for modern SEO but still useful.">
                    <Input value={form.keywords} onChange={(e) => set("keywords", e.target.value)} placeholder="luxury perfume, fragrance, Kathmandu" />
                </Field>

                {/* Live SERP preview */}
                <div style={{ marginTop: 8, padding: "16px 18px", background: "var(--sunken-deep)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                    <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 10 }}>
                        Search Result Preview
                    </div>
                    <div style={{ fontFamily: "Arial, sans-serif" }}>
                        <div style={{ fontSize: "0.90rem", color: "#1a0dab", fontWeight: 400, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {form.metaTitle || "Your page title"}
                        </div>
                        <div style={{ fontSize: "0.76rem", color: "#006621", marginBottom: 2 }}>anok.fragrance</div>
                        <div style={{ fontSize: "0.80rem", color: "#545454", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            {form.metaDescription || "Your meta description will appear here."}
                        </div>
                    </div>
                </div>
            </Section>

            {/* Open Graph / Social */}
            <Section title="Social Sharing (Open Graph)">
                <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: 20, lineHeight: 1.6 }}>
                    Controls how the page looks when shared on Facebook, LinkedIn, WhatsApp and other platforms. Leave blank to fall back to the meta title/description above.
                </p>
                <Field label="OG Title" hint="Headline shown in link previews.">
                    <Input value={form.ogTitle} onChange={(e) => set("ogTitle", e.target.value)} />
                </Field>
                <Field label="OG Description" hint="Description shown in link previews.">
                    <Textarea value={form.ogDescription} onChange={(e) => set("ogDescription", e.target.value)} style={{ minHeight: 72 }} />
                </Field>
                <Field label="OG Image URL" hint="Recommended: 1200×630px. Direct image URL or path from /public.">
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <div style={{ flex: 1 }}>
                            <Input value={form.ogImage} onChange={(e) => set("ogImage", e.target.value)} placeholder="https://... or /logo.png" />
                        </div>
                        {form.ogImage && (
                            <img
                                src={form.ogImage} alt="OG preview"
                                style={{ width: 80, height: 42, objectFit: "cover", borderRadius: 4, border: "1px solid var(--border)", flexShrink: 0, marginTop: 2 }}
                                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                            />
                        )}
                    </div>
                </Field>

                {/* Social card preview */}
                {(form.ogTitle || form.ogDescription || form.ogImage) && (
                    <div style={{ marginTop: 8, border: "1px solid #e0e0e0", borderRadius: 8, overflow: "hidden", maxWidth: 480, fontFamily: "Arial, sans-serif" }}>
                        {form.ogImage && (
                            <img src={form.ogImage} alt="" style={{ width: "100%", height: 130, objectFit: "cover", display: "block" }}
                                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                        )}
                        <div style={{ padding: "10px 14px", background: "#f2f3f5" }}>
                            <div style={{ fontSize: "0.64rem", textTransform: "uppercase", color: "#606770", marginBottom: 3 }}>anok.fragrance</div>
                            <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "#1c1e21", marginBottom: 2, lineHeight: 1.3 }}>{form.ogTitle || form.metaTitle}</div>
                            <div style={{ fontSize: "0.78rem", color: "#606770", lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                                {form.ogDescription || form.metaDescription}
                            </div>
                        </div>
                    </div>
                )}
            </Section>

            <SaveBtn loading={saving} onClick={handleSave} />
        </div>
    );
};

export default SeoPage;
