import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Cleans a single note string by removing:
 * - Leading/trailing quotes
 * - Escaped quotes (\", \')
 * - Brackets from JSON array strings (["...", "..."])
 * - Unwanted characters like backslashes and curly braces
 */
function cleanNote(raw: string): string {
  if (!raw || typeof raw !== "string") return raw;

  let cleaned = raw.trim();

  // Remove wrapping double or single quotes
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) ||
      (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1);
  }

  // Remove escaped quotes
  cleaned = cleaned.replace(/\\"/g, "").replace(/\\'/g, "");

  // Remove stray backslashes
  cleaned = cleaned.replace(/\\/g, "");

  // Remove any remaining surrounding brackets or braces
  cleaned = cleaned.replace(/^\[|\]$/g, "").trim();
  cleaned = cleaned.replace(/^\{|\}$/g, "").trim();

  return cleaned.trim();
}

/**
 * Parses a notes value that might be:
 * - A valid object: { top: [], middle: [], base: [] }
 * - A string that looks like JSON: "[\"bergamota\", \"rosa\"]"
 * - An array of strings
 * Returns a clean { top: [], middle: [], base: [] } object.
 */
function normalizeNotes(notes: any): { top: string[]; middle: string[]; base: string[] } {
  const clean = (arr: any[]): string[] =>
    (arr || []).filter(Boolean).map((n: any) => cleanNote(String(n))).filter(Boolean);

  // Already a proper object
  if (notes && typeof notes === "object" && !Array.isArray(notes)) {
    return {
      top: clean(notes.top || []),
      middle: clean(notes.middle || []),
      base: clean(notes.base || []),
    };
  }

  // It's a JSON string — try to parse it
  if (typeof notes === "string") {
    try {
      const parsed = JSON.parse(notes);
      if (typeof parsed === "object" && !Array.isArray(parsed)) {
        return {
          top: clean(parsed.top || []),
          middle: clean(parsed.middle || []),
          base: clean(parsed.base || []),
        };
      }
      if (Array.isArray(parsed)) {
        return { top: clean(parsed), middle: [], base: [] };
      }
    } catch {
      // Not valid JSON — treat as a comma-separated string
      const parts = notes.split(",").map((s: string) => cleanNote(s)).filter(Boolean);
      return { top: parts, middle: [], base: [] };
    }
  }

  // It's an array (flat)
  if (Array.isArray(notes)) {
    return { top: clean(notes), middle: [], base: [] };
  }

  return { top: [], middle: [], base: [] };
}

/**
 * Cleans a text field that might be a JSON-stringified array like:
 *   "[\"cita\", \"noche\"]"  ->  "cita, noche"
 * or a plain string, which is left as-is.
 */
function cleanTextField(value: string | null): string | null {
  if (!value || typeof value !== "string") return value;

  const trimmed = value.trim();

  // Looks like a JSON array string
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((s: string) => cleanNote(s)).filter(Boolean).join(", ");
      }
    } catch {
      // Remove brackets and clean
      return trimmed.slice(1, -1).split(",").map(cleanNote).filter(Boolean).join(", ");
    }
  }

  return cleanNote(trimmed);
}

async function run() {
  console.log("Fetching all perfumes...");
  const { data: perfumes, error } = await supabase
    .from("perfumes")
    .select("id, name, notes, occasion, season, longevity, sillage, concentration, family");

  if (error || !perfumes) {
    console.error("Error fetching perfumes:", error);
    return;
  }

  console.log(`Found ${perfumes.length} perfumes. Starting cleanup...\n`);

  let updatedCount = 0;
  let skippedCount = 0;

  for (const perfume of perfumes) {
    const cleanedNotes = normalizeNotes(perfume.notes);
    const cleanedOccasion = cleanTextField(perfume.occasion);
    const cleanedSeason = cleanTextField(perfume.season);
    const cleanedLongevity = cleanTextField(perfume.longevity);
    const cleanedSillage = cleanTextField(perfume.sillage);
    const cleanedConcentration = cleanTextField(perfume.concentration);
    const cleanedFamily = cleanTextField(perfume.family);

    const notesChanged = JSON.stringify(cleanedNotes) !== JSON.stringify(perfume.notes);
    const textChanged =
      cleanedOccasion !== perfume.occasion ||
      cleanedSeason !== perfume.season ||
      cleanedLongevity !== perfume.longevity ||
      cleanedSillage !== perfume.sillage ||
      cleanedConcentration !== perfume.concentration ||
      cleanedFamily !== perfume.family;

    if (!notesChanged && !textChanged) {
      skippedCount++;
      continue;
    }

    const { error: updateError } = await supabase
      .from("perfumes")
      .update({
        notes: cleanedNotes,
        occasion: cleanedOccasion,
        season: cleanedSeason,
        longevity: cleanedLongevity,
        sillage: cleanedSillage,
        concentration: cleanedConcentration,
        family: cleanedFamily,
      })
      .eq("id", perfume.id);

    if (updateError) {
      console.error(`❌ Error updating ${perfume.name}:`, updateError.message);
    } else {
      console.log(`✅ Cleaned: ${perfume.name}`);
      if (notesChanged) {
        console.log(`   notes.top: ${cleanedNotes.top.slice(0, 3).join(", ")}`);
      }
      if (cleanedOccasion !== perfume.occasion) console.log(`   occasion: ${perfume.occasion} → ${cleanedOccasion}`);
      if (cleanedSeason !== perfume.season) console.log(`   season: ${perfume.season} → ${cleanedSeason}`);
      updatedCount++;
    }

    // Small pause to avoid rate limits
    await new Promise((r) => setTimeout(r, 100));
  }

  console.log(`\n--- Done! ---`);
  console.log(`Updated: ${updatedCount} perfumes`);
  console.log(`Skipped (already clean): ${skippedCount} perfumes`);
}

run();
