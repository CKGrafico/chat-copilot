/**
 * Smart file sorter for audio uploads.
 *
 * Sort priority (earliest first):
 *   1. Date/time extracted from filename (handles many formats)
 *   2. file.lastModified timestamp (reliable when filenames have no date)
 *   3. Natural/numeric string sort ("audio 2" < "audio 10")
 */

/**
 * Date patterns to try, in order of specificity.
 * Each returns a numeric timestamp (ms) when matched, or null.
 */
const DATE_EXTRACTORS: Array<(name: string) => number | null> = [
  // WhatsApp: "WhatsApp Ptt 2026-04-04 at 21.14.10"
  name => {
    const m = name.match(/(\d{4}-\d{2}-\d{2})[_ ]at[_ ](\d{2})[.\-:](\d{2})[.\-:](\d{2})/i);
    if (!m) return null;
    return Date.parse(`${m[1]}T${m[2]}:${m[3]}:${m[4]}`);
  },

  // ISO datetime with separator: "2026-04-04 21-14-10" or "2026-04-04_21:14:10"
  name => {
    const m = name.match(/(\d{4}-\d{2}-\d{2})[_ T](\d{2})[.\-:](\d{2})[.\-:](\d{2})/);
    if (!m) return null;
    return Date.parse(`${m[1]}T${m[2]}:${m[3]}:${m[4]}`);
  },

  // Compact datetime: "20260404-211410" or "20260404_211410"
  name => {
    const m = name.match(/(\d{4})(\d{2})(\d{2})[_\-T](\d{2})(\d{2})(\d{2})/);
    if (!m) return null;
    return Date.parse(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}`);
  },

  // Date only: "2026-04-04" anywhere in filename
  name => {
    const m = name.match(/(\d{4}-\d{2}-\d{2})/);
    if (!m) return null;
    return Date.parse(m[1]);
  },

  // Compact date only: "20260404"
  name => {
    const m = name.match(/(\d{4})(\d{2})(\d{2})/);
    if (!m) return null;
    const ts = Date.parse(`${m[1]}-${m[2]}-${m[3]}`);
    return isNaN(ts) ? null : ts;
  },
];

function extractDateFromName(name: string): number | null {
  for (const extractor of DATE_EXTRACTORS) {
    const ts = extractor(name);
    if (ts !== null && !isNaN(ts)) return ts;
  }
  return null;
}

/**
 * Sorts files in chronological order using the best available signal.
 * Returns a new sorted array — does not mutate the input.
 */
export function sortFiles(files: File[]): File[] {
  return [...files].sort((a, b) => {
    const dateA = extractDateFromName(a.name);
    const dateB = extractDateFromName(b.name);

    // Both have parseable dates in filename — sort by those
    if (dateA !== null && dateB !== null) return dateA - dateB;

    // Only one has a filename date — put that one first
    if (dateA !== null) return -1;
    if (dateB !== null) return 1;

    // No filename dates — use lastModified timestamp
    if (a.lastModified !== b.lastModified) return a.lastModified - b.lastModified;

    // Final fallback: natural/numeric string sort ("audio 2" < "audio 10")
    return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
  });
}
