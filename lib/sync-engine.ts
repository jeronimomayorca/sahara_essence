
import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';
import * as path from 'path';

// Types
export interface PerfumeRow {
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
  embedding?: string;
  [key: string]: any; // Allow other properties
}

export interface SyncResult {
  inserted: number;
  updated: number;
  deleted: number;
  total: number;
}

export class SyncEngine {
  private supabase;
  private spreadsheetId: string;
  private credentials: any;

  constructor(spreadsheetId: string, credentials: any, supabaseUrl: string, supabaseKey: string) {
    this.spreadsheetId = spreadsheetId;
    this.credentials = credentials;
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  private async getGoogleSheetsClient() {
    const auth = new google.auth.GoogleAuth({
      credentials: this.credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    return google.sheets({ version: 'v4', auth });
  }

  async readPerfumes(): Promise<PerfumeRow[]> {
    console.log('📖 Reading perfumes from Google Sheets...');
    
    const sheets = await this.getGoogleSheetsClient();
    
    // Get spreadsheet metadata to find the correct sheet name
    const meta = await sheets.spreadsheets.get({
      spreadsheetId: this.spreadsheetId,
    });

    const sheetName = meta.data.sheets?.[0]?.properties?.title;
    if (!sheetName) {
      throw new Error('Could not find any sheets in the spreadsheet');
    }

    console.log(`📄 Found sheet: "${sheetName}"`);

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: `${sheetName}!A:Z`,
    });

    const rows = response.data.values;
    
    if (!rows || rows.length === 0) {
      console.log('⚠️  No data found in sheet');
      return [];
    }

    // First row is headers
    const headers = rows[0];
    const perfumes: PerfumeRow[] = [];

    // Process data rows (skip header)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      
      // Skip empty rows
      if (!row[0] || !row[1]) continue;

      const perfume: any = {};
      
      headers.forEach((header: string, index: number) => {
        const value = row[index] || '';
        
        // Map headers to object properties
        const key = header.toLowerCase();
        
        if (['id'].includes(key)) {
            perfume[key] = parseInt(value) || 0;
        } else if (['price', 'precio_costo', 'precio_pagina', 'envio', 'empaque', 'costo_total_real', 
                    'ganancia_marca', 'comision_vendedor', 'marketing', 'precio_recomendado'].includes(key)) {
            perfume[key] = parseFloat(value) || 0;
        } else {
            perfume[key] = value;
        }
        
        // Defaults
        if (key === 'gender' && !value) perfume.gender = 'Unisex';
        if (key === 'family' && !value) perfume.family = 'Sin clasificar';
        if (key === 'notes' && !value) perfume.notes = '{"top":[],"base":[],"middle":[]}';
        if (key === 'size' && !value) perfume.size = '100ml';
        if (key === 'image' && !value) perfume.image = '/placeholder.jpg';
      });

      if (perfume.id && perfume.name) {
        perfumes.push(perfume as PerfumeRow);
      }
    }

    console.log(`✅ Found ${perfumes.length} perfumes in sheet`);
    return perfumes;
  }

  async syncToSupabase(perfumes: PerfumeRow[]): Promise<SyncResult> {
    console.log('\n🔄 Starting sync to Supabase...');

    // Get existing perfumes from Supabase
    const { data: existingPerfumes, error: fetchError } = await this.supabase
      .from('perfumes')
      .select('id');

    if (fetchError) {
      console.error('❌ Error fetching existing perfumes:', fetchError);
      throw fetchError;
    }

    const existingIds = new Set(existingPerfumes?.map((p) => p.id) || []);
    const sheetIds = new Set(perfumes.map((p) => p.id));

    let inserted = 0;
    let updated = 0;
    let deleted = 0;

    // Insert or Update perfumes
    for (const perfume of perfumes) {
      // Remove internal business fields before inserting to public table
      const { 
        precio_costo, 
        precio_pagina, 
        envio, 
        empaque, 
        costo_total_real, 
        ganancia_marca, 
        comision_vendedor, 
        marketing, 
        precio_recomendado,
        ...publicPerfume 
      } = perfume;

      if (existingIds.has(perfume.id)) {
        // Update existing
        const { error } = await this.supabase
          .from('perfumes')
          .update(publicPerfume)
          .eq('id', perfume.id);

        if (error) {
          console.error(`❌ Error updating perfume ${perfume.id}:`, error);
        } else {
          updated++;
        }
      } else {
        // Insert new
        const { error } = await this.supabase
          .from('perfumes')
          .insert(publicPerfume);

        if (error) {
          console.error(`❌ Error inserting perfume ${perfume.id}:`, error);
        } else {
          inserted++;
        }
      }
    }

    // Delete perfumes that are no longer in the sheet
    const idsToDelete = [...existingIds].filter((id) => !sheetIds.has(id));
    
    if (idsToDelete.length > 0) {
      const { error } = await this.supabase
        .from('perfumes')
        .delete()
        .in('id', idsToDelete);

      if (error) {
        console.error('❌ Error deleting perfumes:', error);
      } else {
        deleted = idsToDelete.length;
      }
    }

    return { inserted, updated, deleted, total: perfumes.length };
  }
}
