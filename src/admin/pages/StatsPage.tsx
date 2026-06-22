import React, { useState } from "react";
import { readStore, updateSection } from "../cms/cmsStore";
import { Card } from "../components/ui/Card";
import { Field, Input, SaveBtn } from "../components/ui/Field";
import { useToast } from "../components/ui/Toast";
import type { StatItem } from "../types/cms.types";

const StatsPage: React.FC = () => {
    const { toast } = useToast();
    const [stats, setStats] = useState<StatItem[]>(() => readStore().stats);
    const [saving, setSaving] = useState(false);

    const setItem = (i: number, field: keyof StatItem, value: string) => {
        const next = [...stats];
        next[i] = { ...next[i], [field]: value };
        setStats(next);
    };

    const addStat = () => setStats((s) => [...s, { value: "", label: "" }]);
    const removeStat = (i: number) => setStats((s) => s.filter((_, idx) => idx !== i));

    const handleSave = async () => {
        if (stats.some((s) => !s.value.trim() || !s.label.trim())) {
            toast("All stat fields are required.", "error");
            return;
        }
        setSaving(true);
        await new Promise((r) => setTimeout(r, 350));
        updateSection("stats", stats);
        setSaving(false);
        toast("Stats bar saved!");
    };

    return (
        <div>
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.9rem", fontWeight: 700, color: "var(--text-main)", marginBottom: 6 }}>Stats Bar</h1>
                <p style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>Key metrics displayed below the hero section.</p>
            </div>

            {stats.map((stat, i) => (
                <Card
                    key={i}
                    title={`Stat ${i + 1}`}
                    action={
                        stats.length > 1 ? (
                            <button onClick={() => removeStat(i)} style={{ fontSize: "0.78rem", color: "#e05555", background: "#fff0f0", border: "1px solid #f5c0c0", borderRadius: "var(--radius-sm)", padding: "5px 12px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600 }}>
                                Remove
                            </button>
                        ) : undefined
                    }
                >
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                        <Field label="Value" hint="E.g. 140+, 1M+">
                            <Input value={stat.value} onChange={(e) => setItem(i, "value", e.target.value)} />
                        </Field>
                        <Field label="Label" hint="E.g. Products Available">
                            <Input value={stat.label} onChange={(e) => setItem(i, "label", e.target.value)} />
                        </Field>
                    </div>
                </Card>
            ))}

            {/* Preview */}
            <div style={{ background: "var(--charcoal)", borderRadius: "var(--radius)", padding: "24px", marginBottom: 24, display: "flex", gap: 0, overflow: "hidden" }}>
                {stats.map((s, i) => (
                    <div key={i} style={{ flex: 1, textAlign: "center", padding: "8px 12px", borderRight: i < stats.length - 1 ? "1px solid rgba(255,255,255,0.12)" : "none" }}>
                        <div style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 700, color: "var(--gold-light)" }}>{s.value || "—"}</div>
                        <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.55)", marginTop: 5 }}>{s.label || "Label"}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 24 }}>
                <button
                    onClick={addStat}
                    style={{ padding: "10px 22px", background: "transparent", border: "1.5px solid var(--gold)", color: "var(--gold)", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.82rem", letterSpacing: "0.06em", cursor: "pointer", transition: "all 0.2s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--gold-glow)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                    + Add Stat
                </button>
                <SaveBtn loading={saving} onClick={handleSave} />
            </div>
        </div>
    );
};

export default StatsPage;
