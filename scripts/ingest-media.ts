/**
 * ingest-media — add images to the site.
 *
 * Optimises a file, picks its storage tier, uploads it if large, and inserts
 * the media_assets row. This is currently the ONLY way to add an image: the
 * CMS media-library page is not built yet, so its image fields accept a URL
 * but cannot upload one. Run this, then paste the printed URL into the field.
 *
 *   npm run ingest-media -- ./photo.jpg
 *   npm run ingest-media -- ./photo.jpg --prefix product --alt "Bottle, front"
 *
 * TIERING (MIGRATION.md §2C): <= 8 KB after optimisation is stored as base64
 * text in the row and resolves inline, saving an HTTP round trip. Anything
 * larger goes to Storage with an immutable cache header, plus a ~600-byte
 * base64 LQIP blur for instant paint. Base64 is 33% larger than the bytes it
 * encodes and cannot be cached separately from the content document, so it is
 * used only where a round trip costs more than the bytes.
 */

import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { basename, resolve } from "node:path";
import sharp from "sharp";
import {
    serviceClient, formatBytes,
    INLINE_MAX_BYTES, MAX_EDGE_PX, WEBP_QUALITY,
} from "./lib/env.js";

const BUCKET = "media";
const PREFIXES = ["hero", "product", "sections", "brand", "library"] as const;

function parseArgs() {
    const argv = process.argv.slice(2);
    const files: string[] = [];
    let prefix = "library";
    let alt = "";

    for (let i = 0; i < argv.length; i++) {
        if (argv[i] === "--prefix") prefix = argv[++i] ?? "library";
        else if (argv[i] === "--alt") alt = argv[++i] ?? "";
        else files.push(argv[i]!);
    }

    if (files.length === 0) {
        console.error(
            "\n  Usage: npm run ingest-media -- <file...> [--prefix <name>] [--alt <text>]\n" +
            `  Prefixes: ${PREFIXES.join(", ")}\n`
        );
        process.exit(1);
    }
    if (!PREFIXES.includes(prefix as typeof PREFIXES[number])) {
        console.error(`\n  Unknown prefix "${prefix}". Use one of: ${PREFIXES.join(", ")}\n`);
        process.exit(1);
    }
    return { files, prefix, alt };
}

async function main() {
    const { files, prefix, alt } = parseArgs();
    const supabase = serviceClient();

    for (const file of files) {
        const path = resolve(process.cwd(), file);
        let original: Buffer;
        try {
            original = await readFile(path);
        } catch {
            console.error(`  ${file}: not found, skipped`);
            process.exitCode = 1;
            continue;
        }

        // Re-encode rather than store what was handed to us. This is where the
        // real size saving comes from — an order of magnitude more than any
        // encoding choice, and in the right direction.
        const optimised = await sharp(original)
            .rotate()                                  // apply then strip EXIF orientation
            .resize({ width: MAX_EDGE_PX, height: MAX_EDGE_PX, fit: "inside", withoutEnlargement: true })
            .webp({ quality: WEBP_QUALITY })
            .toBuffer();

        const meta = await sharp(optimised).metadata();
        const checksum = createHash("sha256").update(optimised).digest("hex");

        // Content-hash dedupe: re-uploading the same picture reuses the row.
        const { data: existing } = await supabase
            .from("media_assets").select("id, public_url, data_url")
            .eq("checksum", checksum).maybeSingle();
        if (existing) {
            console.log(`  ${basename(file)}: already stored`);
            console.log(`    ${existing.public_url ?? "(inline data URL)"}\n`);
            continue;
        }

        const stem = basename(file).replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "-");
        const row: Record<string, unknown> = {
            filename: `${stem}.webp`,
            mime_type: "image/webp",
            bytes: optimised.length,
            width: meta.width ?? 0,
            height: meta.height ?? 0,
            alt,
            checksum,
        };

        if (optimised.length <= INLINE_MAX_BYTES) {
            row.kind = "inline";
            row.data_url = `data:image/webp;base64,${optimised.toString("base64")}`;
        } else {
            const storagePath = `${prefix}/${stem}-${checksum.slice(0, 8)}.webp`;
            const { error: upErr } = await supabase.storage
                .from(BUCKET)
                .upload(storagePath, optimised, {
                    contentType: "image/webp",
                    // The filename carries a content hash, so a changed image is
                    // a new path. Immutable caching never needs a purge.
                    cacheControl: "31536000, immutable",
                    upsert: true,
                });
            if (upErr) {
                console.error(`  ${file}: upload failed — ${upErr.message}`);
                process.exitCode = 1;
                continue;
            }

            row.kind = "object";
            row.storage_path = storagePath;
            row.public_url = supabase.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl;
            row.lqip = `data:image/webp;base64,${(
                await sharp(optimised).resize({ width: 16 }).webp({ quality: 20 }).toBuffer()
            ).toString("base64")}`;
        }

        // The inline-ceiling trigger (migration 0002) rejects this if the total
        // base64 footprint would exceed 200 KB. That error is the safeguard
        // working, not a bug — store the asset in the object tier instead.
        const { data: saved, error } = await supabase
            .from("media_assets").insert(row).select("id, kind, public_url, data_url").single();
        if (error) {
            console.error(`  ${file}: ${error.message}`);
            process.exitCode = 1;
            continue;
        }

        console.log(`  ${basename(file)}  ${formatBytes(original.length)} → ${formatBytes(optimised.length)}  [${saved.kind}]  ${meta.width}×${meta.height}`);
        console.log(`    ${saved.public_url ?? `${(saved.data_url as string).slice(0, 48)}…  (inline)`}\n`);
    }

    console.log("  Paste the URL above into the matching field in the CMS.\n");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
