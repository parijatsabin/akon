/**
 * Database abstraction interface.
 * Every provider (supabase, postgres, mysql) implements this.
 * The Worker routes never import a provider directly — only this interface.
 * Switching databases = changing one line in worker.ts.
 */

import type { SiteData } from "../types/api.types.ts";
import type { Product } from "../types/api.types.ts";
import type { Testimonial } from "../types/api.types.ts";
import type { Order, NewOrder } from "../types/api.types.ts";

export interface DbClient {
    // ── CMS ────────────────────────────────────────────────────
    getSiteContent(): Promise<SiteData>;
    getSiteSection(section: string): Promise<unknown>;
    upsertSiteSection(section: string, content: unknown, updatedBy?: string): Promise<void>;

    // ── Products ───────────────────────────────────────────────
    getProducts(activeOnly?: boolean): Promise<Product[]>;
    getProductBySlug(slug: string): Promise<Product | null>;
    searchProducts(query: string): Promise<Product[]>;
    upsertProduct(product: Partial<Product>): Promise<Product>;
    deleteProduct(id: string): Promise<void>;

    // ── Testimonials ───────────────────────────────────────────
    getTestimonials(visibleOnly?: boolean): Promise<Testimonial[]>;
    upsertTestimonial(t: Partial<Testimonial>): Promise<Testimonial>;
    deleteTestimonial(id: number): Promise<void>;

    // ── Newsletter ─────────────────────────────────────────────
    subscribeNewsletter(email: string, ip?: string): Promise<void>;
    unsubscribeNewsletter(email: string): Promise<void>;

    // ── Orders ─────────────────────────────────────────────────
    createOrder(order: NewOrder): Promise<Order>;
    getOrder(orderNumber: string): Promise<Order | null>;
    getCustomerOrders(customerId: string): Promise<Order[]>;
    updateOrderStatus(orderId: string, status: string): Promise<void>;
    getAllOrders(filters?: { status?: string; page?: number; limit?: number }): Promise<Order[]>;
}
