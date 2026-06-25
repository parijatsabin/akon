/**
 * API-level type definitions.
 * These are the shapes that travel over the wire (Worker ↔ frontend).
 * They mirror the database schema — not the legacy localStorage cms.types.ts.
 */

// Re-export CMS types for convenience
export type { SiteData } from "../../admin/types/cms.types.ts";

// ── Product ───────────────────────────────────────────────────
export interface Product {
    id: string;
    slug: string;
    name: string;
    collection: "Signature Collection" | "Luxury Collection" | "Limited Edition" | "Seasonal Fragrances";
    description: string;
    price_npr: number;        // integer NPR, e.g. 24500
    badge: string | null;
    accent_color: string;
    image_url: string;
    product_url: string;
    notes_top: string[];
    notes_heart: string[];
    notes_base: string[];
    sort_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// ── Testimonial ───────────────────────────────────────────────
export interface Testimonial {
    id: number;
    quote: string;
    author_name: string;
    author_title: string;
    rating: number;
    sort_order: number;
    is_visible: boolean;
}

// ── Orders ────────────────────────────────────────────────────
export type OrderStatus =
    | "pending" | "confirmed" | "processing"
    | "shipped" | "delivered" | "cancelled" | "refunded";

export interface OrderItem {
    id: string;
    product_id: string | null;
    product_name: string;
    product_slug: string;
    collection: string;
    image_url: string;
    unit_price_npr: number;
    quantity: number;
    line_total_npr: number;
}

export interface ShippingAddress {
    full_name: string;
    phone: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    district?: string;
    province?: string;
    country: string;
    postal_code?: string;
}

export interface Order {
    id: string;
    order_number: string;
    customer_id: string | null;
    status: OrderStatus;
    subtotal_npr: number;
    shipping_npr: number;
    discount_npr: number;
    total_npr: number;
    shipping_address: ShippingAddress;
    notes: string | null;
    items: OrderItem[];
    created_at: string;
    updated_at: string;
}

export interface NewOrder {
    customer_id?: string;
    items: Array<{
        product_id: string;
        quantity: number;
    }>;
    shipping_address: ShippingAddress;
    notes?: string;
    discount_npr?: number;
    shipping_npr?: number;
}

// ── Auth ──────────────────────────────────────────────────────
export type UserType = "customer" | "admin";

export interface UserProfile {
    id: string;
    user_type: UserType;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    avatar_url: string | null;
    is_active: boolean;
    created_at: string;
}

// ── API Response wrapper ──────────────────────────────────────
export interface ApiSuccess<T> {
    ok: true;
    data: T;
}

export interface ApiError {
    ok: false;
    error: string;
    code?: number;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
