/**
 * Products API routes — /api/products/*
 * GET    /api/products           → list active products
 * GET    /api/products/search?q= → full-text search
 * GET    /api/products/:slug     → single product
 * POST   /api/products           → create (admin)
 * PUT    /api/products/:slug     → update (admin)
 * DELETE /api/products/:slug     → delete (admin)
 */

import type { DbClient } from "../db/index.ts";
import type { WorkerEnv } from "../db/supabase.ts";
import { jsonOk, jsonError, requireAdmin } from "./helpers.ts";

export async function handleProducts(
    req: Request,
    url: URL,
    db: DbClient,
    env: WorkerEnv
): Promise<Response> {
    const parts = url.pathname.replace("/api/products", "").split("/").filter(Boolean);
    const slugOrId = parts[0];
    const isSearch = slugOrId === "search";

    // GET /api/products — public product list
    if (req.method === "GET" && !slugOrId) {
        const products = await db.getProducts(true);
        return jsonOk(products);
    }

    // GET /api/products/search?q=oud
    if (req.method === "GET" && isSearch) {
        const q = url.searchParams.get("q")?.trim();
        if (!q || q.length < 2) return jsonError("Query must be at least 2 characters", 400);
        const results = await db.searchProducts(q);
        return jsonOk(results);
    }

    // GET /api/products/:slug — single product (public)
    if (req.method === "GET" && slugOrId) {
        const product = await db.getProductBySlug(slugOrId);
        if (!product) return jsonError("Product not found", 404);
        return jsonOk(product);
    }

    // POST /api/products — create (admin)
    if (req.method === "POST") {
        const auth = await requireAdmin(req, env);
        if (!auth.ok) return jsonError(auth.error, 401);

        const body = await req.json().catch(() => null);
        if (!body) return jsonError("Invalid JSON body", 400);
        if (!body.name || !body.slug || !body.price_npr) {
            return jsonError("name, slug, and price_npr are required", 400);
        }

        const product = await db.upsertProduct(body);
        return jsonOk(product, 201);
    }

    // PUT /api/products/:slug — update (admin)
    if (req.method === "PUT" && slugOrId) {
        const auth = await requireAdmin(req, env);
        if (!auth.ok) return jsonError(auth.error, 401);

        const existing = await db.getProductBySlug(slugOrId);
        if (!existing) return jsonError("Product not found", 404);

        const body = await req.json().catch(() => null);
        if (!body) return jsonError("Invalid JSON body", 400);

        const product = await db.upsertProduct({ ...body, id: existing.id });
        return jsonOk(product);
    }

    // DELETE /api/products/:id — delete (admin)
    if (req.method === "DELETE" && slugOrId) {
        const auth = await requireAdmin(req, env);
        if (!auth.ok) return jsonError(auth.error, 401);

        await db.deleteProduct(slugOrId);
        return jsonOk({ deleted: true });
    }

    return jsonError("Method not allowed", 405);
}
