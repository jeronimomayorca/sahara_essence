import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getPerfumeImageUrl(imageName: string | null | undefined): string {
  if (!imageName) return "/placeholder.svg"
  if (imageName.startsWith("http")) return imageName
  return `https://kwtkwtvnskytohiyixmw.supabase.co/storage/v1/object/public/perfume_images/${imageName}`
}

/**
 * Strips stray quotes, escape chars, and JSON key-value artifacts from a note string.
 * e.g. '"top":"Bergamota"' → "Bergamota"
 *      '"Rosa"'            → "Rosa"
 */
function cleanNoteString(raw: unknown): string {
  if (!raw || typeof raw !== 'string') return '';
  let s = raw.trim();
  // Remove escaped quotes
  s = s.replace(/\\"/g, '').replace(/\\'/g, '');
  // Remove wrapping quotes
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  // Remove JSON key-value artifacts like "top":"..." or top:
  s = s.replace(/^\w+:\s*/g, '').replace(/^"?\w+"?\s*:\s*"?/g, '').replace(/"$/g, '').trim();
  // Remove stray brackets and braces
  s = s.replace(/^[\[{]|[\]}]$/g, '').trim();
  // Final pass: strip any remaining quote characters (double, single, typographic)
  s = s.replace(/["""''`]/g, '').trim();
  return s;
}

/**
 * Parses any `notes` value from Supabase into a flat, clean array of note strings.
 * Handles: JSONB object {top,middle,base}, stringified JSON, flat arrays, plain strings.
 */
export function parseNotes(notes: unknown): string[] {
  const flatten = (val: unknown): string[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val.flatMap(flatten);
    if (typeof val === 'object') return Object.values(val as object).flatMap(flatten);
    const s = cleanNoteString(val);
    return s ? [s] : [];
  };

  // Try to parse if it's a JSON string
  if (typeof notes === 'string') {
    const trimmed = notes.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        return flatten(JSON.parse(trimmed));
      } catch {
        // Fall through to plain string handling
      }
    }
    // Plain comma-separated or single value
    return trimmed.split(',').map(cleanNoteString).filter(Boolean);
  }

  return flatten(notes);
}
