/**
 * Newsletter API routes — /api/newsletter/*
 * POST   /api/newsletter/subscribe    → subscribe email
 * POST   /api/newsletter/unsubscribe  → unsubscribe email
 * GET    /api/newsletter/subscribers  → list subscribers (admin)
 */

import type { DbClient } from "../db/index.ts";
import type { WorkerEnv } from "../db/supabase.ts";
import { jsonOk, jsonError, requireAdmin } from "./helpers.ts";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function handleNewsletter(
    req: Request,
    url: URL,
    db: DbClient,
    env: WorkerEnv
): Promise<Response> {
    const action = url.pathname.split("/").pop();

    // POST /api/newsletter/subscribe
    if (req.method === "POST" && action === "subscribe") {
        const body = await req.json().catch(() => null) as { email?: string } | null;
        if (!body?.email || !EMAIL_RE.test(body.email)) {
            return jsonError("Valid email address required", 400);
        }

        const ip = req.headers.get("CF-Connecting-IP") ?? undefined;
        await db.subscribeNewsletter(body.email.toLowerCase().trim(), ip);
        return jsonOk({ subscribed: true });
    }

    // POST /api/newsletter/unsubscribe
    if (req.method === "POST" && action === "unsubscribe") {
        const body = await req.json().catch(() => null) as { email?: string } | null;
        if (!body?.email) return jsonError("Email required", 400);

        await db.unsubscribeNewsletter(body.email.toLowerCase().trim());
        return jsonOk({ unsubscribed: true });
    }

    // GET /api/newsletter/subscribers — admin only
    if (req.method === "GET" && action === "subscribers") {
        const auth = await requireAdmin(req, env);
        if (!auth.ok) return jsonError(auth.error, 401);
        // Returns via raw Supabase query — not in DbClient interface for simplicity
        // Extend DbClient with getSubscribers() if needed
        return jsonOk({ message: "Extend DbClient.getSubscribers() to implement this." });
    }

    return jsonError("Not found", 404);
}
