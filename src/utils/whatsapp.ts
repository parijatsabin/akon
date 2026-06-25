/**
 * WhatsApp redirect utility.
 * Used when a non-logged-in user clicks "Order" on a product.
 * Opens WhatsApp Web/App with a pre-filled message to the company.
 */

import type { Product } from "../api/types/api.types.ts";

/** Format integer NPR to display string: 24500 → "NPR 24,500" */
export function formatPrice(priceNpr: number): string {
    return `NPR ${priceNpr.toLocaleString("en-IN")}`;
}

/** Build a WhatsApp order inquiry message for a product */
export function buildWhatsAppMessage(product: Product): string {
    const notes = [
        product.notes_top?.join(", "),
        product.notes_heart?.join(", "),
        product.notes_base?.join(", "),
    ]
        .filter(Boolean)
        .join(" | ");

    return [
        `Hi ANOK 👋`,
        ``,
        `I'm interested in ordering:`,
        ``,
        `🌸 *${product.name}* — ${product.collection}`,
        `💰 ${formatPrice(product.price_npr)}`,
        product.badge ? `🏷️ ${product.badge}` : null,
        notes ? `📝 Notes: ${notes}` : null,
        ``,
        `Please help me complete my purchase.`,
    ]
        .filter((line) => line !== null)
        .join("\n");
}

/**
 * Opens WhatsApp with a pre-filled message.
 * @param phone  Company WhatsApp number from brand settings (e.g. "+9779868765432")
 * @param product  The product the user wants to order
 */
export function openWhatsAppOrder(phone: string, product: Product): void {
    // Strip all non-digit characters except leading +
    const cleanPhone = phone.replace(/[^\d+]/g, "").replace(/^\+/, "");
    const message = buildWhatsAppMessage(product);
    const encoded = encodeURIComponent(message);
    const waUrl = `https://wa.me/${cleanPhone}?text=${encoded}`;

    window.open(waUrl, "_blank", "noopener,noreferrer");
}
