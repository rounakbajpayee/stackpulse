import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'https://huubxklntrxcwqkoumhd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_TDCRrXlv30o9LjLM_uofjg_WhJDQ_si';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function seed() {
  console.log('[*] Reading 105+ startup seed data...');
  const startupsDataText = fs.readFileSync('C:/Projects/stackpulse/src/lib/startups-data.ts', 'utf8');
  
  // Extract JSON-like array or parse startups
  console.log('[*] Connecting to Supabase project...');
  
  const { data, error } = await supabase.from('startups').select('*').limit(5);
  if (error) {
    console.error('[-] Supabase query check:', error.message);
  } else {
    console.log('[+] Supabase connection successful! Found existing rows:', data.length);
  }
}

seed();
