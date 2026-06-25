/**
 * Generates a SHA-256 checksum of a migration file's content.
 * Used to detect if a previously-run migration file has been modified.
 */
export async function sha256(content: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}
