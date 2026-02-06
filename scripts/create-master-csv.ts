import * as fs from 'fs';
import * as path from 'path';

// Parse Colombian price format
function parsePrice(priceStr: string): number {
  return parseFloat(priceStr.replace(/\$/g, '').replace(/\s/g, '').replace(/\./g, '')) || 0;
}

// Read price sheet
const priceSheetPath = path.join(process.cwd(), 'public', 'Copia de PRECIOS_PAGINA_SAHARA_ACTUALIZADOS.xlsx - Sheet1.csv');
const perfumesRowsPath = path.join(process.cwd(), 'public', 'perfumes_rows.csv');
const outputPath = path.join(process.cwd(), 'public', 'perfumes_master.csv');

console.log('📖 Reading price sheet...');
const priceContent = fs.readFileSync(priceSheetPath, 'utf-8');
const priceLines = priceContent.split(/\r?\n/).filter(line => line.trim() !== '');

console.log('📖 Reading perfumes rows...');
const rowsContent = fs.readFileSync(perfumesRowsPath, 'utf-8');
const rowsLines = rowsContent.split(/\r?\n/).filter(line => line.trim() !== '');

// Parse perfumes_rows.csv into a map
interface PerfumeRow {
  id: number;
  name: string;
  brand: string;
  gender: string;
  family: string;
  notes: string;
  size: string;
  price: number;
  image: string;
  description: string;
  story: string;
  concentration: string;
  longevity: string;
  sillage: string;
  season: string;
  occasion: string;
  embedding: string;
}

const perfumeDataMap = new Map<number, PerfumeRow>();

// Parse perfumes_rows.csv (skip header)
for (let i = 1; i < rowsLines.length; i++) {
  const line = rowsLines[i];
  // Simple regex to extract id at the beginning
  const match = line.match(/^(\d+),([^,]+),/);
  if (match) {
    const id = parseInt(match[1]);
    const columns = line.split(',');
    
    perfumeDataMap.set(id, {
      id,
      name: columns[1] || '',
      brand: columns[2] || '',
      gender: columns[3] || 'Unisex',
      family: columns[4] || 'Sin clasificar',
      notes: columns[5] || '{"top":[],"base":[],"middle":[]}',
      size: columns[6] || '100ml',
      price: parseInt(columns[7]) || 0,
      image: columns[8] || '/placeholder.jpg',
      description: columns[9] || '',
      story: columns[10] || '',
      concentration: columns[11] || '',
      longevity: columns[12] || '',
      sillage: columns[13] || '',
      season: columns[14] || '',
      occasion: columns[15] || '',
      embedding: columns[16] || ''
    });
  }
}

// Build the master CSV with ALL columns
const headers = [
  'id',
  'name',
  'brand',
  'gender',
  'family',
  'notes',
  'size',
  'price',
  'image',
  'description',
  'story',
  'concentration',
  'longevity',
  'sillage',
  'season',
  'occasion',
  'embedding',
  'precio_costo',
  'precio_pagina',
  'envio',
  'empaque',
  'costo_total_real',
  'ganancia_marca',
  'comision_vendedor',
  'marketing',
  'precio_recomendado'
];

const output: string[] = [headers.join(',')];

// Process each perfume from the price sheet
for (let i = 1; i < priceLines.length; i++) {
  const line = priceLines[i];
  const columns = line.split(',');
  
  if (columns.length < 13) continue;
  
  const id = columns[0].trim();
  const name = columns[1].trim();
  const precio_costo = parsePrice(columns[2] || '');
  const precio_pagina = parsePrice(columns[3] || '');
  const envio = parsePrice(columns[4] || '');
  const empaque = parsePrice(columns[5] || '');
  const costo_total_real = parsePrice(columns[6] || '');
  const ganancia_marca = parsePrice(columns[7] || '');
  const comision_vendedor = parsePrice(columns[8] || '');
  const marketing = parsePrice(columns[9] || '');
  const precio_recomendado = parsePrice(columns[10] || '');
  const price = parsePrice(columns[12] || '');
  
  if (!id || !name) continue;
  
  // Check if we have existing data for this perfume
  const numId = parseInt(id);
  const existingData = perfumeDataMap.get(numId);
  
  let brand = '';
  let gender = 'Unisex';
  let family = 'Sin clasificar';
  let notes = '{"top":[],"base":[],"middle":[]}';
  let size = '100ml';
  let image = '/placeholder.jpg';
  let description = '';
  let story = '';
  let concentration = '';
  let longevity = '';
  let sillage = '';
  let season = '';
  let occasion = '';
  let embedding = '';
  
  // If we have existing data, use it
  if (existingData) {
    brand = existingData.brand;
    gender = existingData.gender;
    family = existingData.family;
    notes = existingData.notes;
    size = existingData.size;
    image = existingData.image;
    description = existingData.description;
    story = existingData.story;
    concentration = existingData.concentration;
    longevity = existingData.longevity;
    sillage = existingData.sillage;
    season = existingData.season;
    occasion = existingData.occasion;
    embedding = existingData.embedding;
  }
  
  // Escape commas in fields that might contain them
  const escapeCsv = (str: string) => {
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  
  // Build the row
  const row = [
    id,
    escapeCsv(name),
    escapeCsv(brand),
    gender,
    escapeCsv(family),
    escapeCsv(notes),
    size,
    price,
    image,
    escapeCsv(description),
    escapeCsv(story),
    concentration,
    longevity,
    sillage,
    escapeCsv(season),
    escapeCsv(occasion),
    embedding,
    precio_costo,
    precio_pagina,
    envio,
    empaque,
    costo_total_real,
    ganancia_marca,
    comision_vendedor,
    marketing,
    precio_recomendado
  ].join(',');
  
  output.push(row);
}

fs.writeFileSync(outputPath, output.join('\n'), 'utf-8');
console.log(`\n✅ Master CSV created with ${output.length - 1} perfumes`);
console.log(`✅ Columns: ${headers.length}`);
console.log(`✅ File saved to: ${outputPath}`);
console.log(`\n📋 Columns included:`);
headers.forEach((h, i) => console.log(`   ${(i + 1).toString().padStart(2, ' ')}. ${h}`));
