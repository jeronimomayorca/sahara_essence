
import { NextResponse } from 'next/server';
import { SyncEngine } from '@/lib/sync-engine';

// Force dynamic to prevent caching of the cron trigger
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Basic authorization check (e.g. for Vercel Cron)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // Allow Vercel Cron signature verification in production (omitted for simplicity here, but good practice)
      // For now, simpler check or check for environment variable presence
      if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!;
    
    // In Vercel environment, we need to handle credentials differently.
    // For simplicity, we can put the JSON content in an ENV variable GOOGLE_CREDENTIALS_JSON
    // Or read from the file if we commit it (but we don't commit it).
    // BETTER APPROACH for Vercel: Use ENV variable for the entire JSON content.
    
    let credentials;
    if (process.env.GOOGLE_CREDENTIALS_JSON) {
      credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
    } else {
        // Fallback for local dev if file exists
        // Note: In Next.js API routes, filesystem access might be tricky in serverless
        throw new Error('GOOGLE_CREDENTIALS_JSON environment variable is not set');
    }

    const engine = new SyncEngine(SPREADSHEET_ID, credentials, SUPABASE_URL, SUPABASE_KEY);

    const perfumes = await engine.readPerfumes();
    const result = await engine.syncToSupabase(perfumes);

    return NextResponse.json({
      success: true,
      message: 'Sync completed successfully',
      stats: result
    });

  } catch (error: any) {
    console.error('Sync API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
