/**
 * MapField — the location map, with a preview.
 *
 * Accepts either the full <iframe> snippet Google hands you or a bare embed
 * URL, keeps only the URL, and shows the actual map so a wrong paste is
 * obvious here rather than after publishing.
 */

import React, { useState } from "react";
import { Field, Textarea, Button } from "./Field";
import { parseMapEmbed } from "../../lib/mapEmbed";

interface MapFieldProps {
    value: string;
    onChange: (url: string) => void;
}

export const MapField: React.FC<MapFieldProps> = ({ value, onChange }) => {
    const [draft, setDraft] = useState(value);
    const [error, setError] = useState<string | null>(null);
    const [note, setNote] = useState<string | null>(null);

    const apply = (raw: string) => {
        setDraft(raw);
        const { url, error: err, extracted } = parseMapEmbed(raw);
        setError(err);
        setNote(extracted && !err ? "Embed code recognised — kept the map link from it." : null);
        // Only a usable value reaches the form, so a half-typed paste never
        // overwrites a working map.
        if (!err) onChange(url);
    };

    return (
        <Field
            label="Location Map"
            error={error ?? undefined}
            hint={
                error
                    ? undefined
                    : note ??
                      "In Google Maps: Share → Embed a map → Copy HTML, then paste it here. The whole <iframe> snippet is fine."
            }
        >
            <Textarea
                value={draft}
                onChange={(e) => apply(e.target.value)}
                placeholder='<iframe src="https://www.google.com/maps/embed?pb=..." ...></iframe>'
                style={{ minHeight: 84, fontFamily: "ui-monospace, monospace", fontSize: "0.78rem" }}
            />

            {value && !error && (
                <div style={{ marginTop: 10 }}>
                    <div
                        style={{
                            height: 200, overflow: "hidden",
                            border: "1px solid var(--border)", borderRadius: "var(--radius-sm)",
                        }}
                    >
                        <iframe
                            src={value}
                            width="100%"
                            height="200"
                            style={{ border: "none", display: "block" }}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Location preview"
                        />
                    </div>
                    <div className="adm-row" style={{ marginTop: 8 }}>
                        <span className="adm-hint adm-fill">
                            This is exactly what the contact page will show.
                        </span>
                        <Button
                            variant="danger"
                            small
                            onClick={() => {
                                if (!window.confirm("Remove the map?\n\nThe location section disappears from the contact page once you save.")) return;
                                setDraft(""); setError(null); setNote(null); onChange("");
                            }}
                        >
                            Remove map
                        </Button>
                    </div>
                </div>
            )}
        </Field>
    );
};
