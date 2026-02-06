import * as fs from 'fs';
import * as path from 'path';

const csvPath = path.join(process.cwd(), 'public', 'perfumes.csv');
const outputPath = path.join(process.cwd(), 'public', 'perfumes_master.csv');

const content = fs.readFileSync(csvPath, 'utf-8');
const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');

const output: string[] = ['id,name,price'];

// Skip header (line 0), start from line 1
for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  const columns = line.split(',');
  
  if (columns.length < 13) continue;
  
  const id = columns[0].trim();
  const name = columns[1].trim();
  // Column 12 (index 12) is "price"
  const priceStr = columns[12].trim();
  
  // Remove $ and spaces and dots (thousand separators)
  const price = priceStr.replace(/\$/g, '').replace(/\s/g, '').replace(/\./g, '');
  
  if (id && name && price) {
    output.push(`${id},${name},${price}`);
  }
}

fs.writeFileSync(outputPath, output.join('\n'), 'utf-8');
console.log(`✓ CSV actualizado con ${output.length - 1} perfumes`);
console.log(`✓ Archivo guardado en: ${outputPath}`);
