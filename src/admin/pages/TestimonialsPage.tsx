import React, { useState } from "react";
import { readStore } from "../../data/siteRepository";
import { saveSection } from "../lib/saveSection";
import { Section } from "../components/ui/Section";
import { Field, Input, Textarea, SaveBtn } from "../components/ui/Field";
import { useToast } from "../components/ui/Toast";
import type { TestimonialItem } from "../../data/types";
import { Plus, Trash2 } from "lucide-react";

const emptyReview = (id: number): TestimonialItem => ({
    id,
    quote: "",
    author: "",
    title: "",
    rating: 5,
    visible: true,
    order: 0,
});

const StarPicker: React.FC<{ value: number; onChange: (v: number) => void }> = ({ value, onChange }) => (
    <div style={{ display: "flex", gap: 4 }}>
        {[1, 2, 3, 4, 5].map((n) => (
            <button
                key={n}
                type="button"
                onClick={() => onChange(n)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: n <= value ? "var(--accent)" : "var(--border)", fontSize: "1.3rem", lineHeight: 1 }}
                title={`${n} star${n > 1 ? "s" : ""}`}
            >
                ★
            </button>
        ))}
    </div>
);

const TestimonialsPage: React.FC = () => {
    const { toast } = useToast();
    const store = readStore();
    const [headline, setHeadline] = useState(store.testimonials.headline);
    const [items, setItems] = useState<TestimonialItem[]>(store.testimonials.items);
    const [saving, setSaving] = useState(false);

    const setItem = (id: number, key: keyof TestimonialItem, value: unknown) =>
        setItems((prev) => prev.map((t) => (t.id === id ? { ...t, [key]: value } : t)));

    const addReview = () =>
        setItems((prev) => [...prev, emptyReview(Date.now())]);

    const removeReview = (id: number) => {
        if (!window.confirm("Remove this testimonial?")) return;
        setItems((prev) => prev.filter((t) => t.id !== id));
    };

    const handleSave = async () => {
        if (items.some((t) => !t.quote.trim() || !t.author.trim())) {
            toast("Quote and author are required.", "error");
            return;
        }
        setSaving(true);
        // Preserve sectionTag — this page does not edit it, and dropping it
        // would strip the field from the saved document.
        await saveSection("testimonials", { ...readStore().testimonials, headline, items }, toast, "Testimonials saved!");
        setSaving(false);
    };

    return (
        <div>
            <div style={{ marginBottom: 28, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                <div>
                    <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.9rem", fontWeight: 700, color: "var(--text-main)", marginBottom: 6 }}>Testimonials</h1>
                    <p style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>{items.length} review{items.length !== 1 ? "s" : ""} displayed on the website.</p>
                </div>
                <button
                    onClick={addReview}
                    style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 22px", background: "var(--noir)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.82rem", letterSpacing: "0.06em", cursor: "pointer" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--noir-raised)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "var(--noir)"; }}
                >
                    <Plus size={15} /> Add Review
                </button>
            </div>

            <Section title="Section Headline">
                <Field label="Headline">
                    <Input value={headline} onChange={(e) => setHeadline(e.target.value)} />
                </Field>
            </Section>

            {items.map((item, i) => (
                <Section
                    key={item.id}
                    title={`Review ${i + 1} — ${item.author || "New"}`}
                    action={
                        <button
                            onClick={() => removeReview(item.id)}
                            style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: "0.78rem", color: "#e05555", background: "#fff0f0", border: "1px solid #f5c0c0", borderRadius: "var(--radius-sm)", padding: "5px 12px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600 }}
                        >
                            <Trash2 size={12} /> Remove
                        </button>
                    }
                >
                    <Field label="Quote" required>
                        <Textarea value={item.quote} onChange={(e) => setItem(item.id, "quote", e.target.value)} style={{ minHeight: 80 }} />
                    </Field>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                        <Field label="Author Name" required>
                            <Input value={item.author} onChange={(e) => setItem(item.id, "author", e.target.value)} />
                        </Field>
                        <Field label="Author Title" hint="Role or company">
                            <Input value={item.title} onChange={(e) => setItem(item.id, "title", e.target.value)} />
                        </Field>
                    </div>
                    <Field label="Rating">
                        <StarPicker value={item.rating} onChange={(v) => setItem(item.id, "rating", v)} />
                    </Field>
                    {/* Visible toggle */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "var(--sunken-deep)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                        <span
                            role="checkbox"
                            aria-checked={item.visible}
                            onClick={() => setItem(item.id, "visible", !item.visible)}
                            style={{
                                display: "inline-flex", alignItems: "center",
                                width: 38, height: 20, borderRadius: 10,
                                background: item.visible ? "var(--accent)" : "var(--border)",
                                padding: "2px", transition: "background 0.22s", cursor: "pointer", flexShrink: 0,
                            }}
                        >
                            <span style={{
                                width: 16, height: 16, borderRadius: "50%", background: "#fff",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.20)",
                                transform: item.visible ? "translateX(18px)" : "translateX(0)",
                                transition: "transform 0.22s", display: "block",
                            }} />
                        </span>
                        <span style={{ fontSize: "0.80rem", color: "var(--text-muted)", fontWeight: 600 }}>
                            {item.visible ? "Visible on site" : "Hidden from site"}
                        </span>
                    </div>
                </Section>
            ))}

            <SaveBtn loading={saving} onClick={handleSave} />
        </div>
    );
};

export default TestimonialsPage;
