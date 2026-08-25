/**
 * CMS copy arrives however an editor typed it, and editors type labels in
 * caps. Where the design no longer sets text in uppercase, a value stored as
 * "EXTRAIT DE PARFUM(EDP)" would still render shouted, so shouted input is
 * un-shouted here rather than relying on the database being tidy.
 *
 * Values that are not all-caps are returned untouched — this only ever
 * lowers case, never raises it.
 */

/** Acronyms and unit symbols that must keep their casing. */
const KEEP = new Set([
  "EDP", "EDT", "EDC", "ML", "L", "OZ", "FL", "ANOK", "NPR", "UV", "IFRA",
]);

const CASED = new Map([["ML", "mL"], ["L", "L"], ["OZ", "oz"], ["FL", "fl"]]);

/** Particles that stay lowercase mid-phrase — "Extrait de Parfum", not "De". */
const MINOR = new Set([
  "DE", "DU", "DES", "LA", "LE", "LES", "D", "OF", "THE", "AND", "ON", "IN", "A", "AN",
]);

const isShouted = (s: string) => s === s.toUpperCase() && /[A-Z]{4,}/.test(s);

/**
 * Title-cases a shouted string, preserving acronyms and unit symbols.
 * Also repairs the missing space in "PARFUM(EDP)" so the bracket does not
 * glue itself to the preceding word.
 */
export function unshout(input: string): string {
  if (!input || !isShouted(input)) return input;

  return input
    .replace(/(\w)\(/g, "$1 (")
    .replace(/[A-Za-z]+/g, (word, at: number) => {
      const upper = word.toUpperCase();
      if (CASED.has(upper)) return CASED.get(upper)!;
      if (KEEP.has(upper)) return upper;
      if (at > 0 && MINOR.has(upper)) return upper.toLowerCase();
      return upper.charAt(0) + upper.slice(1).toLowerCase();
    });
}
