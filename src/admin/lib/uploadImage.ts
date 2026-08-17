/**
 * Browser-side image ingest.
 *
 * The same pipeline as scripts/ingest-media.ts, reimplemented for the CMS:
 * optimise, hash, pick a storage tier, write the media_assets row, and hand
 * back a `src` string the section can store.
 *
 * The constants below MUST match scripts/lib/env.ts and the CHECK constraints
 * in migration 0001. If they drift, the database rejects the insert — which is
 * the correct failure, but a confusing one, so keep them in step.
 *
 * Why re-encode in the browser at all: an editor picking a photo off their
 * phone is handing over 3–5 MB of JPEG. Uploading that raw would blow the
 * bucket's 2 MB per-file limit, and storing it would make the site slow for
 * every visitor. One canvas pass fixes both.
 */

import { supabase } from "../../lib/supabase";

/** Mirrors INLINE_MAX_BYTES in scripts/lib/env.ts. */
const INLINE_MAX_BYTES = 8_192;
const MAX_EDGE_PX = 1920;
const WEBP_QUALITY = 0.8;
const LQIP_WIDTH = 16;
const LQIP_QUALITY = 0.2;

const BUCKET = "media";

/** Where an asset lands in the bucket, by the field that will hold it. */
export type MediaPrefix = "hero" | "product" | "sections" | "brand" | "library";

export class UploadError extends Error {}

// ── Canvas helpers ────────────────────────────────────────────
async function drawToBlob(
    bitmap: ImageBitmap, width: number, height: number, quality: number
): Promise<Blob> {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new UploadError("This browser cannot process images.");
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/webp", quality)
    );
    if (!blob) throw new UploadError("Could not convert the image to WebP.");
    return blob;
}

/** Longest edge capped at MAX_EDGE_PX, aspect ratio preserved, never upscaled. */
function fitInside(w: number, h: number, max: number): [number, number] {
    if (w <= max && h <= max) return [w, h];
    const scale = Math.min(max / w, max / h);
    return [Math.round(w * scale), Math.round(h * scale)];
}

async function sha256Hex(buffer: ArrayBuffer): Promise<string> {
    const digest = await crypto.subtle.digest("SHA-256", buffer);
    return Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

function blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new UploadError("Could not read the image."));
        reader.readAsDataURL(blob);
    });
}

export interface UploadResult {
    /** The string to store in the content field. */
    src: string;
    /** True when the identical image was already stored. */
    reused: boolean;
    originalBytes: number;
    storedBytes: number;
    kind: "inline" | "object";
}

/**
 * Optimises and stores one image, returning the src to save on the section.
 * Throws UploadError with a message suitable for showing to an editor.
 */
export async function uploadImage(file: File, prefix: MediaPrefix = "sections"): Promise<UploadResult> {
    if (!file.type.startsWith("image/")) {
        throw new UploadError("That file is not an image.");
    }
    // Generous: a 25 MB source still optimises fine, but a video dropped by
    // mistake should fail here rather than after a long decode.
    if (file.size > 25 * 1024 * 1024) {
        throw new UploadError("That image is too large. Use one under 25 MB.");
    }

    let bitmap: ImageBitmap;
    try {
        bitmap = await createImageBitmap(file);
    } catch {
        throw new UploadError("That image could not be read. Try a JPEG, PNG or WebP.");
    }

    const [w, h] = fitInside(bitmap.width, bitmap.height, MAX_EDGE_PX);
    const optimised = await drawToBlob(bitmap, w, h, WEBP_QUALITY);
    const bytes = await optimised.arrayBuffer();
    const checksum = await sha256Hex(bytes);

    // ── Already stored? ───────────────────────────────────────
    // Same dedupe rule as the CLI: identical bytes reuse the row rather than
    // storing a second copy.
    const { data: existing } = await supabase
        .from("media_assets")
        .select("data_url, public_url")
        .eq("checksum", checksum)
        .maybeSingle();

    if (existing) {
        bitmap.close();
        return {
            src: (existing.public_url ?? existing.data_url) as string,
            reused: true,
            originalBytes: file.size,
            storedBytes: optimised.size,
            kind: existing.public_url ? "object" : "inline",
        };
    }

    const stem = file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 48) || "image";
    const row: Record<string, unknown> = {
        filename: `${stem}.webp`,
        mime_type: "image/webp",
        bytes: optimised.size,
        width: w,
        height: h,
        alt: "",
        checksum,
    };

    let src: string;

    if (optimised.size <= INLINE_MAX_BYTES) {
        // Small enough that a round trip costs more than the bytes.
        src = await blobToDataUrl(optimised);
        row.kind = "inline";
        row.data_url = src;
    } else {
        const storagePath = `${prefix}/${stem}-${checksum.slice(0, 8)}.webp`;
        const { error: upErr } = await supabase.storage
            .from(BUCKET)
            .upload(storagePath, optimised, {
                contentType: "image/webp",
                // The filename carries a content hash, so a changed image is a
                // new path and the cache never needs purging.
                cacheControl: "31536000, immutable",
                upsert: true,
            });
        if (upErr) throw new UploadError(`Upload failed: ${upErr.message}`);

        src = supabase.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl;

        const blur = await drawToBlob(
            bitmap,
            LQIP_WIDTH,
            Math.max(1, Math.round((h / w) * LQIP_WIDTH)),
            LQIP_QUALITY
        );

        row.kind = "object";
        row.storage_path = storagePath;
        row.public_url = src;
        row.lqip = await blobToDataUrl(blur);
    }

    bitmap.close();

    const { error } = await supabase.from("media_assets").insert(row);
    if (error) {
        // The inline-ceiling trigger fires here when the base64 tier is full.
        // That is the safeguard working, so say what to do about it.
        if (/ceiling/i.test(error.message)) {
            throw new UploadError(
                "The inline image budget is full. Delete an unused small image, or use a larger one so it is stored as a file."
            );
        }
        throw new UploadError(`Could not save the image: ${error.message}`);
    }

    return { src, reused: false, originalBytes: file.size, storedBytes: optimised.size, kind: row.kind as "inline" | "object" };
}

/** "2.4 MB → 180 KB" — shown after an upload so the optimisation is visible. */
export function describeSaving(r: UploadResult): string {
    const fmt = (n: number) => (n < 1024 ? `${n} B` : n < 1024 * 1024 ? `${Math.round(n / 1024)} KB` : `${(n / 1048576).toFixed(1)} MB`);
    if (r.reused) return "Already in your library — reused, nothing uploaded.";
    return `${fmt(r.originalBytes)} → ${fmt(r.storedBytes)}, stored ${r.kind === "inline" ? "inline" : "as a file"}.`;
}
