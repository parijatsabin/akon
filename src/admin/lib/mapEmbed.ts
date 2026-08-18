/**
 * Google Maps embed parsing.
 *
 * The CMS field asks for a URL, but "Share → Embed a map" in Google Maps gives
 * you a whole <iframe> element. Pasting that — the obvious thing to do — used
 * to store the markup as the src and silently break the map. This accepts
 * either form and keeps only the URL.
 *
 * Storing the URL rather than the markup is deliberate: ContactPage renders
 * its own <iframe> with fixed attributes, so nothing an editor pastes can
 * introduce arbitrary HTML or its own script/style/sandbox settings.
 */

/** Google's embed endpoint. Anything else is refused. */
const EMBED_PREFIX = "https://www.google.com/maps/embed";

export interface MapEmbedResult {
    /** The extracted URL, or "" when the input was empty or unusable. */
    url: string;
    /** Message to show the editor; null when the input was fine. */
    error: string | null;
    /** True when an <iframe> was unwrapped, so the UI can say what happened. */
    extracted: boolean;
}

export function parseMapEmbed(input: string): MapEmbedResult {
    const raw = input.trim();
    if (!raw) return { url: "", error: null, extracted: false };

    let candidate = raw;
    let extracted = false;

    // Unwrap a pasted element, taking the src attribute.
    if (/^<iframe/i.test(raw)) {
        const src = raw.match(/\ssrc=["']([^"']+)["']/i);
        if (!src) {
            return {
                url: "",
                extracted: false,
                error: "That looks like an iframe but has no src. Copy the whole snippet from Google Maps.",
            };
        }
        candidate = src[1];
        extracted = true;
    }

    // Google escapes ampersands inside the HTML attribute.
    candidate = candidate.replace(/&amp;/g, "&").trim();

    if (!candidate.startsWith(EMBED_PREFIX)) {
        return {
            url: "",
            extracted,
            error:
                "That is not a Google Maps embed link. In Google Maps use Share → " +
                "Embed a map, then paste what it gives you. A normal maps.google.com " +
                "link from the address bar will not display.",
        };
    }

    return { url: candidate, error: null, extracted };
}
