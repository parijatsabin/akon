/**
 * useWhatsApp — builds a wa.me deep-link with a pre-filled message.
 *
 * Uses brand.phone from the CMS as the WhatsApp number.
 * Strips everything that isn't a digit (removes +, spaces, dashes).
 *
 * Usage:
 *   const waLink = useWhatsApp({ name: "Noir Veil", size: "100 ml", price: "NPR 24,500" });
 *   <a href={waLink} target="_blank" rel="noopener noreferrer">Order on WhatsApp</a>
 */

import { useSiteData } from "../data/SiteDataProvider";

interface WhatsAppOptions {
    name: string;
    size?: string;
    price?: string;
    qty?: number;
}

export function useWhatsApp({ name, size, price, qty }: WhatsAppOptions): string {
    const { brand } = useSiteData();

    // Strip everything except digits from the stored phone number
    const number = brand.phone.replace(/\D/g, "");

    const parts = [`Hi! I'm interested in ordering *${name}*`];
    if (size) parts.push(`Size: ${size}`);
    if (qty && qty > 1) parts.push(`Quantity: ${qty}`);
    if (price) parts.push(`Price: ${price}`);
    parts.push("Could you please assist me with this order? Thank you.");

    const message = encodeURIComponent(parts.join("\n"));
    return `https://wa.me/${number}?text=${message}`;
}
