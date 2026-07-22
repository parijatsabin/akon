import React, { useState } from "react";
import { readStore, updateSection } from "../cms/cmsStore";
import { Card } from "../components/ui/Card";
import { Field, Input, SaveBtn } from "../components/ui/Field";
import { useToast } from "../components/ui/Toast";
import type { CollectionTileItem } from "../types/cms.types";
import { Pencil, X, LayoutGrid } from "lucide-react";

// ── Backdrop ──────────────────────────────────────────────────
const Backdrop: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <div
        onClick={onClick}
        style={{ position: "fixed", inset: 0, background: "rgba(13,12,11,0.55)", zIndex: 200, backdropFilter: "blur(3px)" }}
    />
);

// ── Tile Dialog ───────────────────────────────────────────────
interface TileDialogProps {
    tile: CollectionTileItem;
    onSave: (t: CollectionTileItem) => void;
    onClose: () => void;
}
const TileDialog: React.FC<TileDialogProps> = ({ tile, onSave, onClose }) => {
    const [form, setForm] = useState<CollectionTileItem>(tile);
    const set = (k: keyof CollectionTileItem, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

    return (
        <>
            <Backdrop onClick={onClose} />
            <div style={{
                position: "fixed", top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 201, background: "#fff",
                borderRadius: "var(--radius)", width: 560, maxWidth: "95vw",
                maxHeight: "90vh", overflowY: "auto",
                boxShadow: "0 32px 80px rgba(0,0,0,0.24)",
            }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid var(--border)", background: "var(--parchment)" }}>
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem", fontWeight: 700, color: "var(--text-main)", margin: 0 }}>
                        Edit Tile — {tile.heading}
                    </h3>
                    <button onClick={onClose} style={{ padding: 6, background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: "22px 24px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
                        <Field label="Short Label" hint="Shown small above heading">
                            <Input value={form.label} onChange={(e) => set("label", e.target.value)} />
                        </Field>
                        <Field label="Heading">
                            <Input value={form.heading} onChange={(e) => set("heading", e.target.value)} />
                        </Field>
                    </div>
                    <Field label="Subtext">
                        <Input value={form.subtext} onChange={(e) => set("subtext", e.target.value)} />
                    </Field>
                    <Field label="Link (href)">
                        <Input value={form.href} onChange={(e) => set("href", e.target.value)} />
                    </Field>
                    <Field label="Image URL">
                        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                            <div style={{ flex: 1 }}>
                                <Input value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} placeholder="https://..." />
                            </div>
                            {form.imageUrl && (
                                <img src={form.imageUrl} alt="" style={{ width: 52, height: 36, objectFit: "cover", borderRadius: 4, border: "1px solid var(--border)", flexShrink: 0, marginTop: 2 }}
                                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                            )}
                        </div>
                    </Field>

                    {/* Visible toggle */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "var(--parchment)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                        <span
                            role="checkbox"
                            aria-checked={form.visible}
                            onClick={() => set("visible", !form.visible)}
                            style={{
                                display: "inline-flex", alignItems: "center",
                                width: 40, height: 22, borderRadius: 11,
                                background: form.visible ? "var(--gold)" : "var(--border)",
                                padding: "2px", transition: "background 0.22s", cursor: "pointer", flexShrink: 0,
                            }}
                        >
                            <span style={{
                                width: 18, height: 18, borderRadius: "50%", background: "#fff",
                                boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
                                transform: form.visible ? "translateX(18px)" : "translateX(0)",
                                transition: "transform 0.22s", display: "block",
                            }} />
                        </span>
                        <div>
                            <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-main)" }}>
                                {form.visible ? "Visible on homepage" : "Hidden from homepage"}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: "14px 24px", borderTop: "1px solid var(--border)", background: "var(--parchment)" }}>
                    <button onClick={onClose}
                        style={{ padding: "9px 20px", border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)", background: "#fff", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.84rem", cursor: "pointer", color: "var(--text-main)" }}>
                        Cancel
                    </button>
                    <button onClick={() => onSave(form)}
                        style={{ padding: "9px 22px", border: "none", borderRadius: "var(--radius-sm)", background: "var(--gold)", color: "#fff", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.84rem", cursor: "pointer" }}>
                        Save Tile
                    </button>
                </div>
            </div>
        </>
    );
};

// ── Page ──────────────────────────────────────────────────────
const CollectionTilesPage: React.FC = () => {
    const { toast } = useToast();
    const [tiles, setTiles] = useState<CollectionTileItem[]>(() => readStore().collectionTiles);
    const [editing, setEditing] = useState<CollectionTileItem | null>(null);
    const [saving, setSaving] = useState(false);

    const handleSaveTile = (updated: CollectionTileItem) => {
        setTiles((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        setEditing(null);
        toast("Tile updated — remember to save.");
    };

    const handleSave = async () => {
        // Re-stamp order based on current array position
        const ordered = tiles.map((t, i) => ({ ...t, order: i }));
        setSaving(true);
        await new Promise((r) => setTimeout(r, 300));
        await updateSection("collectionTiles", ordered);
        setTiles(ordered);
        setSaving(false);
        toast("Collection tiles saved!");
    };

    return (
        <div>
            {editing && (
                <TileDialog
                    tile={editing}
                    onSave={handleSaveTile}
                    onClose={() => setEditing(null)}
                />
            )}

            <div style={{ marginBottom: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "var(--radius-sm)", background: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                        <LayoutGrid size={20} />
                    </div>
                    <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.9rem", fontWeight: 700, color: "var(--text-main)" }}>
                        Collection Tiles
                    </h1>
                </div>
                <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginLeft: 52 }}>
                    Manage the homepage category showcase tiles. Edit content, images, and visibility.
                </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
                {tiles.map((tile) => (
                    <Card key={tile.id} title={tile.heading} action={
                        <button
                            onClick={() => setEditing(tile)}
                            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 16px", border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)", background: "#fff", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.80rem", cursor: "pointer", color: "var(--text-main)", transition: "all 0.18s" }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.color = "var(--gold)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-main)"; }}
                        >
                            <Pencil size={13} /> Edit
                        </button>
                    }>
                        <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                            {tile.imageUrl && (
                                <img src={tile.imageUrl} alt={tile.heading}
                                    style={{ width: 120, height: 72, objectFit: "cover", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", flexShrink: 0 }}
                                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                    <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--gold)" }}>{tile.label}</span>
                                    <span style={{
                                        fontSize: "0.62rem", fontWeight: 700, padding: "2px 8px", borderRadius: 30,
                                        background: tile.visible ? "rgba(39,174,96,0.10)" : "rgba(224,85,85,0.10)",
                                        color: tile.visible ? "#27ae60" : "#e05555",
                                        border: `1px solid ${tile.visible ? "rgba(39,174,96,0.25)" : "rgba(224,85,85,0.25)"}`,
                                    }}>
                                        {tile.visible ? "Visible" : "Hidden"}
                                    </span>
                                </div>
                                <div style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginBottom: 2 }}>{tile.subtext}</div>
                                <div style={{ fontSize: "0.76rem", color: "var(--text-faint)" }}>→ {tile.href}</div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <SaveBtn loading={saving} onClick={handleSave} />
        </div>
    );
};

export default CollectionTilesPage;
