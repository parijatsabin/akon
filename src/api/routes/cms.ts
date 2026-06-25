/**
 * CMS API routes — /api/cms/*
 * GET  /api/cms              → full SiteData object
 * GET  /api/cms/:section     → single section content
 * PUT  /api/cms/:section     → update section (admin only)
 */

import type { DbClient } from "../db/index.ts";
import type { WorkerEnv } from "../db/supabase.ts";
import { jsonOk, jsonError, requireAdmin } from "./helpers.ts";

export async function handleCms(
    req: Request,
    url: URL,
    db: DbClient,
    env: WorkerEnv
): Promise<Response> {
    const parts = url.pathname.replace("/api/cms", "").split("/").filter(Boolean);
    const section = parts[0];

    // GET /api/cms — full site data (public)
    if (req.method === "GET" && !section) {
        const data = await db.getSiteContent();
        return jsonOk(data);
    }

    // GET /api/cms/:section — single section (public)
    if (req.method === "GET" && section) {
        const data = await db.getSiteSection(section);
        if (!data) return jsonError("Section not found", 404);
        return jsonOk(data);
    }

    // PUT /api/cms/:section — update section (admin only)
    if (req.method === "PUT" && section) {
        const authResult = await requireAdmin(req, env);
        if (!authResult.ok) return jsonError(authResult.error, 401);

        const body = await req.json().catch(() => null);
        if (!body) return jsonError("Invalid JSON body", 400);

        await db.upsertSiteSection(section, body, authResult.userId);
        return jsonOk({ section, updated: true });
    }

    return jsonError("Method not allowed", 405);
}
