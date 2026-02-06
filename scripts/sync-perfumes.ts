import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables (URL or SERVICE_ROLE_KEY).");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface SheetPerfume {
  id: number;
  name: string;
  price: number;
  brand: string;
}

/**
 * Parse Colombian price format: "$ 50.000" -> 50000
 */
function parsePrice(priceStr: string): number {
  // Remove $, spaces, and dots (thousand separators)
  const cleaned = priceStr.replace(/\$/g, '').replace(/\s/g, '').replace(/\./g, '');
  return parseFloat(cleaned) || 0;
}

/**
 * Extract brand name from perfume name using known brands dictionary
 */
function extractBrand(name: string): string {
  const knownBrands: Record<string, string> = {
    'LATTAFA': 'Lattafa',
    'BHARARA': 'Bharara',
    'ORIENTICA': 'Orientica',
    'ARMANI': 'Giorgio Armani',
    'CHANEL': 'Chanel',
    'DIOR': 'Dior',
    'VERSACE': 'Versace',
    'CAROLINA HERRERA': 'Carolina Herrera',
    'JEAN PAUL': 'Jean Paul Gaultier',
    'PACO RABANNE': 'Paco Rabanne',
    'HUGO BOSS': 'Hugo Boss',
    'CALVIN KLEIN': 'Calvin Klein',
    'CK': 'Calvin Klein',
    'VICTORIA SECRET': 'Victoria\'s Secret',
    'LACOSTE': 'Lacoste',
    'MONT BLANC': 'Montblanc',
    'MONTBLANC': 'Montblanc',
    'CREED': 'Creed',
    'BVLGARI': 'Bvlgari',
    'BURBERRY': 'Burberry',
    'DOLCE': 'Dolce & Gabbana',
    'GABBANA': 'Dolce & Gabbana',
    'YVES SAINT LAURENT': 'Yves Saint Laurent',
    'YSL': 'Yves Saint Laurent',
    'GIVENCHY': 'Givenchy',
    'KENZO': 'Kenzo',
    'MOSCHINO': 'Moschino',
    'DIESEL': 'Diesel',
    'NAUTICA': 'Nautica',
    'TOMMY': 'Tommy Hilfiger',
    'POLO': 'Ralph Lauren',
    'RALPH LAUREN': 'Ralph Lauren',
    'VALENTINO': 'Valentino',
    'ISSEY MIYAKE': 'Issey Miyake',
    'CARTIER': 'Cartier',
    'MONTALE': 'Montale',
    'PARIS HILTON': 'Paris Hilton',
    'BRITNEY': 'Britney Spears',
    'ARIANA GRANDE': 'Ariana Grande',
    'KATTY PERRY': 'Katy Perry',
    'PERRY ELLIS': 'Perry Ellis',
    'BOND': 'Bond No. 9',
    'LE LABO': 'Le Labo',
    'LOUIS VUITTON': 'Louis Vuitton',
    'LANCOME': 'Lancôme',
    'VIKTOR': 'Viktor & Rolf',
    'ROLF': 'Viktor & Rolf',
    'XERJOFF': 'Xerjoff',
    'INITIO': 'Initio',
    'SWISS ARMY': 'Swiss Army',
    'BEVERLY HILLS': 'Beverly Hills',
    'AL HARAMAIN': 'Al Haramain',
    'AHLI': 'Ahli',
    'ASAD': 'Asad',
  };

  const upperName = name.toUpperCase();
  
  // Check for known brands
  for (const [key, value] of Object.entries(knownBrands)) {
    if (upperName.includes(key)) {
      return value;
    }
  }
  
  // Fallback: use first word
  const firstWord = name.split(' ')[0];
  return firstWord || 'Sin marca';
}

/**
 * Parse CSV from public/perfumes.csv
 * Expected format: ID, NOMBRE, PRECIO, ... (other columns ignored)
 */
function parseCSV(filePath: string): SheetPerfume[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split(/\r?\n/).filter((line) => line.trim() !== "");
  
  if (lines.length === 0) return [];

  const result: SheetPerfume[] = [];

  // Skip header (line 0), start from line 1
  for (let i = 1; i < lines.length; i++) {
    const columns = lines[i].split(",");
    
    if (columns.length < 3) continue; // Need at least ID, NAME, PRICE

    const idStr = columns[0].trim();
    const name = columns[1].trim();
    const priceStr = columns[2].trim();

    // Skip if ID is empty
    if (!idStr) {
      console.warn(`Skipping row ${i + 1}: Empty ID for "${name}"`);
      continue;
    }

    const id = parseInt(idStr);
    const price = parsePrice(priceStr);

    if (!isNaN(id) && name && price > 0) {
      const brand = extractBrand(name);
      result.push({ id, name, price, brand });
    } else {
      console.warn(`Skipping row ${i + 1}: Invalid data (ID: ${idStr}, Name: ${name}, Price: ${priceStr})`);
    }
  }

  return result;
}

async function syncPerfumes() {
  const csvPath = path.join(process.cwd(), "public", "perfumes.csv");
  
  if (!fs.existsSync(csvPath)) {
    console.error("Error: 'public/perfumes.csv' not found.");
    console.log("Please ensure your CSV file is at: public/perfumes.csv");
    return;
  }

  console.log("Reading CSV from public/perfumes.csv...");
  const sheetPerfumes = parseCSV(csvPath);
  console.log(`✓ Loaded ${sheetPerfumes.length} perfumes from CSV.`);

  console.log("\nFetching current Supabase data...");
  const { data: dbPerfumes, error } = await supabase.from("perfumes").select("*");
  
  if (error) {
    console.error("Error fetching from DB:", error);
    return;
  }

  console.log(`✓ Found ${dbPerfumes.length} perfumes in database.\n`);

  const dbPerfumeMap = new Map(dbPerfumes.map((p) => [p.name.toLowerCase(), p]));
  const dbIdMap = new Map(dbPerfumes.map((p) => [p.id, p]));
  
  const sheetNames = new Set(sheetPerfumes.map((p) => p.name.toLowerCase()));

  let updateCount = 0;
  let insertCount = 0;
  let deleteCount = 0;

  // 1. Process Updates and Inserts
  console.log("=== SYNCING PERFUMES ===\n");
  
  for (const item of sheetPerfumes) {
    const normalizedName = item.name.toLowerCase();
    const existingByName = dbPerfumeMap.get(normalizedName);
    
    if (existingByName) {
      // Update existing perfume
      const needsUpdate = existingByName.price !== item.price || existingByName.id !== item.id;
      
      if (needsUpdate) {
        console.log(`📝 Updating: ${item.name}`);
        
        // Check for ID collision
        if (existingByName.id !== item.id && dbIdMap.has(item.id)) {
           console.warn(`   ⚠️  ID ${item.id} already taken by '${dbIdMap.get(item.id)?.name}' - updating price only`);
           
           const { error: upErr } = await supabase
             .from("perfumes")
             .update({ price: item.price })
             .eq("id", existingByName.id);

           if (upErr) console.error(`   ❌ Error:`, upErr.message);
           else {
             console.log(`   ✓ Price: $${existingByName.price} → $${item.price}`);
             updateCount++;
           }
        } else {
           // Safe to update both ID and price
           const { error: upErr } = await supabase
            .from("perfumes")
            .update({ id: item.id, price: item.price })
            .eq("id", existingByName.id);
          
           if (upErr) console.error(`   ❌ Error:`, upErr.message);
           else {
             console.log(`   ✓ ID: ${existingByName.id} → ${item.id}, Price: $${existingByName.price} → $${item.price}`);
             updateCount++;
           }
        }
      }
    } else {
      // Insert new perfume
      if (dbIdMap.has(item.id)) {
        console.warn(`⚠️  Cannot insert '${item.name}': ID ${item.id} already exists for '${dbIdMap.get(item.id)?.name}'`);
        continue;
      }
      
      console.log(`➕ Inserting: ${item.name}`);
      console.log(`   Brand: ${item.brand}, Price: $${item.price}`);
      
      const { error: insErr } = await supabase.from("perfumes").insert({
        id: item.id,
        name: item.name,
        price: item.price,
        brand: item.brand,
        image: "/placeholder.jpg",
        gender: "Unisex",
        family: "Sin clasificar",
        notes: { top: [], middle: [], base: [] },
        size: "100ml"
      });
      
      if (insErr) console.error(`   ❌ Error:`, insErr.message);
      else {
        console.log(`   ✓ Inserted successfully`);
        insertCount++;
      }
    }
  }

  // 2. Process Deletions
  console.log("\n=== CHECKING FOR DELETIONS ===\n");
  
  for (const dbP of dbPerfumes) {
    const nameInSheet = sheetNames.has(dbP.name.toLowerCase());
    
    if (!nameInSheet) {
      console.log(`🗑️  Deleting: ${dbP.name} (not in CSV)`);
      const { error: delErr } = await supabase.from("perfumes").delete().eq("id", dbP.id);
      if (delErr) console.error(`   ❌ Error:`, delErr.message);
      else {
        console.log(`   ✓ Deleted`);
        deleteCount++;
      }
    }
  }

  console.log("\n=== SYNC COMPLETE ===");
  console.log(`✓ Updated: ${updateCount}`);
  console.log(`✓ Inserted: ${insertCount}`);
  console.log(`✓ Deleted: ${deleteCount}`);
  console.log(`✓ Total in CSV: ${sheetPerfumes.length}`);
}

syncPerfumes();
