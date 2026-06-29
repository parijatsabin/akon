/**
 * Supabase database provider for the Cloudflare Worker.
 * Uses Supabase REST API directly (no Node.js SDK — Worker environment).
 * All requests use the service_role key for full DB access.
 */

import type { DbClient } from "./index.ts";
import type { SiteData } from "../types/api.types.ts";
import type { Product, Testimonial, Order, NewOrder } from "../types/api.types.ts";

export interface WorkerEnv {
    SUPABASE_URL: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
    SUPABASE_ANON_KEY: string;
    WHATSAPP_PHONE: string;   // e.g. "+9779868765432"
}

export class SupabaseClient implements DbClient {
    private url: string;
    private key: string;

    constructor(env: WorkerEnv) {
        this.url = env.SUPABASE_URL.replace(/\/$/, "");
        this.key = env.SUPABASE_SERVICE_ROLE_KEY;
    }

    // ── Base fetch helper ───────────────────────────────────────
    private async query<T>(
        path: string,
        options: RequestInit = {}
    ): Promise<T> {
        const res = await fetch(`${this.url}/rest/v1/${path}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.key}`,
                "apikey": this.key,
                "Prefer": "return=representation",
                ...(options.headers ?? {}),
            },
        });

        if (!res.ok) {
            const body = await res.text().catch(() => res.statusText);
            throw new Error(`Supabase error [${res.status}]: ${body}`);
        }

        const text = await res.text();
        return (text ? JSON.parse(text) : undefined) as T;
    }

    // ── CMS ─────────────────────────────────────────────────────
    async getSiteContent(): Promise<SiteData> {
        const rows = await this.query<Array<{ section: string; content: unknown }>>(
            "site_content?select=section,content"
        );
        // Assemble the SiteData object from individual section rows
        const map = Object.fromEntries(rows.map((r) => [r.section, r.content]));
        return map as unknown as SiteData;
    }

    async getSiteSection(section: string): Promise<unknown> {
        const rows = await this.query<Array<{ content: unknown }>>(
            `site_content?section=eq.${encodeURIComponent(section)}&select=content`
        );
        return rows[0]?.content ?? null;
    }

    async upsertSiteSection(
        section: string,
        content: unknown,
        updatedBy?: string
    ): Promise<void> {
        await this.query("site_content", {
            method: "POST",
            headers: { "Prefer": "resolution=merge-duplicates,return=minimal" },
            body: JSON.stringify({ section, content, updated_by: updatedBy ?? null }),
        });
    }

    // ── Products ────────────────────────────────────────────────
    async getProducts(activeOnly = true): Promise<Product[]> {
        const filter = activeOnly ? "?is_active=eq.true&order=sort_order.asc" : "?order=sort_order.asc";
        return this.query<Product[]>(`products${filter}`);
    }

    async getProductBySlug(slug: string): Promise<Product | null> {
        const rows = await this.query<Product[]>(
            `products?slug=eq.${encodeURIComponent(slug)}`
        );
        return rows[0] ?? null;
    }

    async searchProducts(query: string): Promise<Product[]> {
        // Uses the GIN full-text search index on search_vector
        return this.query<Product[]>(
            `products?is_active=eq.true&search_vector=fts.${encodeURIComponent(query)}&order=sort_order.asc`
        );
    }

    async upsertProduct(product: Partial<Product>): Promise<Product> {
        const rows = await this.query<Product[]>("products", {
            method: "POST",
            headers: { "Prefer": "resolution=merge-duplicates,return=representation" },
            body: JSON.stringify(product),
        });
        return rows[0];
    }

    async deleteProduct(id: string): Promise<void> {
        await this.query(`products?id=eq.${id}`, {
            method: "DELETE",
            headers: { "Prefer": "return=minimal" },
        });
    }

    // ── Testimonials ────────────────────────────────────────────
    async getTestimonials(visibleOnly = true): Promise<Testimonial[]> {
        const filter = visibleOnly
            ? "?is_visible=eq.true&order=sort_order.asc"
            : "?order=sort_order.asc";
        return this.query<Testimonial[]>(`testimonials${filter}`);
    }

    async upsertTestimonial(t: Partial<Testimonial>): Promise<Testimonial> {
        const rows = await this.query<Testimonial[]>("testimonials", {
            method: "POST",
            headers: { "Prefer": "resolution=merge-duplicates,return=representation" },
            body: JSON.stringify(t),
        });
        return rows[0];
    }

    async deleteTestimonial(id: number): Promise<void> {
        await this.query(`testimonials?id=eq.${id}`, {
            method: "DELETE",
            headers: { "Prefer": "return=minimal" },
        });
    }

    // ── Newsletter ──────────────────────────────────────────────
    async subscribeNewsletter(email: string, ip?: string): Promise<void> {
        await this.query("newsletter_subscribers", {
            method: "POST",
            headers: { "Prefer": "resolution=ignore-duplicates,return=minimal" },
            body: JSON.stringify({
                email,
                ip_address: ip ?? null,
                is_active: true,
            }),
        });
    }

    async unsubscribeNewsletter(email: string): Promise<void> {
        await this.query(
            `newsletter_subscribers?email=eq.${encodeURIComponent(email)}`,
            {
                method: "PATCH",
                headers: { "Prefer": "return=minimal" },
                body: JSON.stringify({
                    is_active: false,
                    unsubscribed_at: new Date().toISOString(),
                }),
            }
        );
    }

    // ── Orders ──────────────────────────────────────────────────
    async createOrder(newOrder: NewOrder): Promise<Order> {
        // 1. Fetch product details for each item to get current prices + names
        const productIds = newOrder.items.map((i) => i.product_id);
        const products = await this.query<Product[]>(
            `products?id=in.(${productIds.join(",")})&select=id,name,slug,collection,image_url,price_npr`
        );
        const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

        // 2. Calculate totals
        const items = newOrder.items.map((item) => {
            const product = productMap[item.product_id];
            if (!product) throw new Error(`Product not found: ${item.product_id}`);
            return {
                id: crypto.randomUUID(),
                product_id: item.product_id,
                product_name: product.name,
                product_slug: product.slug,
                collection: product.collection,
                image_url: product.image_url,
                unit_price_npr: product.price_npr,
                quantity: item.quantity,
                line_total_npr: product.price_npr * item.quantity,
            };
        });

        const subtotal_npr = items.reduce((sum, i) => sum + i.line_total_npr, 0);
        const shipping_npr = newOrder.shipping_npr ?? 0;
        const discount_npr = newOrder.discount_npr ?? 0;
        const total_npr = subtotal_npr + shipping_npr - discount_npr;

        // 3. Generate order number
        const orderNumberRows = await this.query<Array<{ generate_order_number: string }>>(
            "rpc/generate_order_number",
            { method: "POST", body: "{}" }
        );
        const order_number = orderNumberRows[0]?.generate_order_number;

        // 4. Insert order
        const orders = await this.query<Order[]>("orders", {
            method: "POST",
            body: JSON.stringify({
                order_number,
                customer_id: newOrder.customer_id ?? null,
                subtotal_npr,
                shipping_npr,
                discount_npr,
                total_npr,
                shipping_address: newOrder.shipping_address,
                notes: newOrder.notes ?? null,
                status: "pending",
            }),
        });
        const order = orders[0];

        // 5. Insert order items
        await this.query("order_items", {
            method: "POST",
            headers: { "Prefer": "return=minimal" },
            body: JSON.stringify(items.map((i) => ({ ...i, order_id: order.id }))),
        });

        return { ...order, items };
    }

    async getOrder(orderNumber: string): Promise<Order | null> {
        const rows = await this.query<Order[]>(
            `orders?order_number=eq.${encodeURIComponent(orderNumber)}&select=*,items:order_items(*)`
        );
        return rows[0] ?? null;
    }

    async getCustomerOrders(customerId: string): Promise<Order[]> {
        return this.query<Order[]>(
            `orders?customer_id=eq.${customerId}&order=created_at.desc&select=*,items:order_items(*)`
        );
    }

    async updateOrderStatus(orderId: string, status: string): Promise<void> {
        const extra: Record<string, string> = {};
        if (status === "confirmed") extra["confirmed_at"] = new Date().toISOString();
        if (status === "shipped") extra["shipped_at"] = new Date().toISOString();
        if (status === "delivered") extra["delivered_at"] = new Date().toISOString();

        await this.query(`orders?id=eq.${orderId}`, {
            method: "PATCH",
            headers: { "Prefer": "return=minimal" },
            body: JSON.stringify({ status, ...extra }),
        });
    }

    async getAllOrders(filters: { status?: string; page?: number; limit?: number } = {}): Promise<Order[]> {
        const { status, page = 1, limit = 20 } = filters;
        const offset = (page - 1) * limit;
        let path = `orders?order=created_at.desc&limit=${limit}&offset=${offset}&select=*,items:order_items(*)`;
        if (status) path += `&status=eq.${status}`;
        return this.query<Order[]>(path);
    }
}
