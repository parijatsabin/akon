/**
 * ImageField — the one control for every image in the CMS.
 *
 * Before this, image fields were bare text inputs expecting a pasted URL, and
 * the only way to get a URL was to run `npm run ingest-media` from a terminal.
 * That is not something an editor can do.
 *
 * Upload optimises in the browser (see lib/uploadImage), writes the
 * media_assets row, and returns the src. Remove clears the field only — it
 * does not delete the asset, because the same image may be used elsewhere and
 * because deletion belongs to a media library that does not exist yet. The
 * database blocks deleting an in-use asset regardless.
 */

import React, { useRef, useState } from "react";
import { ImagePlus, Trash2, Upload } from "lucide-react";
import { Field, Button } from "./Field";
import { uploadImage, describeSaving, UploadError, type MediaPrefix } from "../../lib/uploadImage";

interface ImageFieldProps {
    label: string;
    value: string;
    onChange: (src: string) => void;
    hint?: string;
    /** Bucket folder, by where the image is used. */
    prefix?: MediaPrefix;
}

export const ImageField: React.FC<ImageFieldProps> = ({
    label, value, onChange, hint, prefix = "sections",
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [note, setNote] = useState<string | null>(null);

    const pick = async (file: File | undefined) => {
        if (!file) return;
        setBusy(true);
        setError(null);
        setNote(null);
        try {
            const result = await uploadImage(file, prefix);
            onChange(result.src);
            setNote(describeSaving(result));
        } catch (err) {
            setError(err instanceof UploadError ? err.message : "The image could not be uploaded.");
        } finally {
            setBusy(false);
            // Allows re-picking the same file after a failure.
            if (inputRef.current) inputRef.current.value = "";
        }
    };

    /**
     * Clearing the field is easy to do by accident and there is no undo until
     * the section is saved, so it asks first. The wording names the field, so
     * a mis-click on a page with several images is obvious from the prompt.
     *
     * This only clears the reference. The asset itself stays in the library —
     * it may be used elsewhere, and the database refuses to delete one that is.
     */
    const remove = () => {
        const ok = window.confirm(
            `Remove the ${label.toLowerCase()}?\n\n` +
            "The section will show no image once you save. The image stays in your " +
            "library, so you can put it back."
        );
        if (!ok) return;
        onChange("");
        setNote(null);
        setError(null);
    };

    return (
        <Field label={label} hint={error ? undefined : note ?? hint} error={error ?? undefined}>
            <div className="adm-imagefield">
                <div className="adm-imagefield-preview" aria-hidden={!value}>
                    {value ? (
                        <img src={value} alt="" loading="lazy" />
                    ) : (
                        <ImagePlus size={20} aria-hidden="true" />
                    )}
                </div>

                <div className="adm-imagefield-actions">
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        hidden
                        onChange={(e) => void pick(e.target.files?.[0])}
                    />
                    <Button
                        small
                        disabled={busy}
                        onClick={() => inputRef.current?.click()}
                    >
                        <Upload size={14} aria-hidden="true" />
                        {busy ? "Optimising…" : value ? "Replace" : "Upload"}
                    </Button>

                    {value && !busy && (
                        <Button variant="danger" small onClick={remove}>
                            <Trash2 size={14} aria-hidden="true" /> Remove
                        </Button>
                    )}

                    <p className="adm-imagefield-meta">
                        {busy
                            ? "Resizing and converting to WebP…"
                            : value
                                ? "Saved when you save this section."
                                : "PNG, JPEG or WebP. Resized and converted automatically."}
                    </p>
                </div>
            </div>
        </Field>
    );
};

/**
 * Gallery variant: an ordered list of images, each replaceable, with add and
 * remove. Used for the product's images array.
 */
interface ImageListProps {
    label: string;
    values: string[];
    onChange: (next: string[]) => void;
    hint?: string;
    prefix?: MediaPrefix;
    max?: number;
}

export const ImageList: React.FC<ImageListProps> = ({
    label, values, onChange, hint, prefix = "product", max = 8,
}) => {
    const replaceAt = (i: number, src: string) => {
        const next = [...values];
        if (src === "") next.splice(i, 1);
        else next[i] = src;
        onChange(next);
    };

    return (
        <>
            {values.map((src, i) => (
                <ImageField
                    key={i}
                    label={i === 0 ? `${label} — main image` : `${label} — image ${i + 1}`}
                    value={src}
                    prefix={prefix}
                    onChange={(next) => replaceAt(i, next)}
                    hint={i === 0 ? hint : undefined}
                />
            ))}

            {values.length < max && (
                <ImageField
                    label={values.length === 0 ? label : "Add another image"}
                    value=""
                    prefix={prefix}
                    hint={values.length === 0 ? hint : undefined}
                    onChange={(src) => src && onChange([...values, src])}
                />
            )}
        </>
    );
};
