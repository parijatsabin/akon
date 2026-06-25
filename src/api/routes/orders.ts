/**
 * Orders API routes — /api/orders/*
 * POST  /api/orders                    → create order (auth required)
 * GET   /api/orders/mine               → customer's own orders
 * GET   /api/orders/:orderNumber       → single order (own or admin)
 * GET   /api/orders                    → all orders (admin)
 * PATCH /api/orders/:orderNumber/status → update status (admin)
 *
 * WhatsApp redirect for non-logged-in users is handled client-side.
 * See: src/utils/whatsapp.ts
 */

import type { DbClient } from "../db/index.ts";
import type { WorkerEnv } from "../db/supabase.ts";
import type { NewOrder } from "../types/api.types.ts";
import { jsonOk, jsonError, verifyToken, requireAdmin } from "./helpers.ts";

export async function handleOrders(
    req: Request,
    url: URL,
    db: DbClient,
    env: WorkerEnv
): Promise<Response> {
    const parts = url.pathname.replace("/api/orders", "").split("/").filter(Boolean);
    const param1 = parts[0]; // orderNumber or "mine"
    const param2 = parts[1]; // "status"

    // GET /api/orders/mine — customer's own orders
    if (req.method === "GET" && param1 === "mine") {
        const auth = await verifyToken(req, env);
        if (!auth.ok) return jsonError(auth.error, 401);
        const orders = await db.getCustomerOrders(auth.userId);
        return jsonOk(orders);
    }

    // GET /api/orders — admin: list all orders with optional filters
    if (req.method === "GET" && !param1) {
        const auth = await requireAdmin(req, env);
        if (!auth.ok) return jsonError(auth.error, 401);

        const status = url.searchParams.get("status") ?? undefined;
        const page = parseInt(url.searchParams.get("page") ?? "1", 10);
        const limit = parseInt(url.searchParams.get("limit") ?? "20", 10);
        const orders = await db.getAllOrders({ status, page, limit });
        return jsonOk(orders);
    }

    // GET /api/orders/:orderNumber — single order
    if (req.method === "GET" && param1) {
        const auth = await verifyToken(req, env);
        if (!auth.ok) return jsonError(auth.error, 401);

        const order = await db.getOrder(param1);
        if (!order) return jsonError("Order not found", 404);

        // Customers can only view their own orders; admins can view all
        if (
            auth.userType !== "admin" &&
            order.customer_id !== auth.userId
        ) {
            return jsonError("Access denied", 403);
        }
        return jsonOk(order);
    }

    // POST /api/orders — create order (must be logged in)
    if (req.method === "POST") {
        const auth = await verifyToken(req, env);
        if (!auth.ok) return jsonError(auth.error, 401);

        const body = await req.json().catch(() => null) as NewOrder | null;
        if (!body) return jsonError("Invalid JSON body", 400);

        if (!body.items?.length) {
            return jsonError("Order must contain at least one item", 400);
        }
        if (!body.shipping_address?.full_name || !body.shipping_address?.city) {
            return jsonError("Shipping address is required", 400);
        }

        // Attach verified customer ID
        body.customer_id = auth.userId;

        const order = await db.createOrder(body);
        return jsonOk(order, 201);
    }

    // PATCH /api/orders/:orderNumber/status — admin update
    if (req.method === "PATCH" && param1 && param2 === "status") {
        const auth = await requireAdmin(req, env);
        if (!auth.ok) return jsonError(auth.error, 401);

        const { status } = await req.json().catch(() => ({})) as { status?: string };
        const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"];
        if (!status || !validStatuses.includes(status)) {
            return jsonError(`status must be one of: ${validStatuses.join(", ")}`, 400);
        }

        const order = await db.getOrder(param1);
        if (!order) return jsonError("Order not found", 404);

        await db.updateOrderStatus(order.id, status);
        return jsonOk({ order_number: param1, status });
    }

    return jsonError("Method not allowed", 405);
}
