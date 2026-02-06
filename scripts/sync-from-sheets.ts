import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { SyncEngine } from '../lib/sync-engine';

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!;
const CREDENTIALS_PATH = process.env.GOOGLE_SHEETS_CREDENTIALS_PATH || './google-credentials.json';

async function main() {
  try {
    console.log('🚀 Starting Google Sheets → Supabase sync (CLI Mode)...\n');

    // Load credentials
    const credentialsPath = path.resolve(process.cwd(), CREDENTIALS_PATH);
    if (!fs.existsSync(credentialsPath)) {
      throw new Error(`Google credentials file not found at: ${credentialsPath}`);
    }
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'));

    // Initialize Engine
    const engine = new SyncEngine(SPREADSHEET_ID, credentials, SUPABASE_URL, SUPABASE_KEY);

    // Read and Sync
    const perfumes = await engine.readPerfumes();
    
    if (perfumes.length === 0) {
      console.log('⚠️  No perfumes to sync');
      return;
    }

    const result = await engine.syncToSupabase(perfumes);

    console.log('\n✅ Sync completed!');
    console.log(`   📥 Inserted: ${result.inserted}`);
    console.log(`   🔄 Updated: ${result.updated}`);
    console.log(`   🗑️  Deleted: ${result.deleted}`);
    console.log('\n🎉 Sync process completed successfully!');

  } catch (error: any) {
    console.error('\n❌ Sync failed:', error);
    fs.writeFileSync('sync-error.json', JSON.stringify({ error: error.message, stack: error.stack }, null, 2));
    process.exit(1);
  }
}

main();
