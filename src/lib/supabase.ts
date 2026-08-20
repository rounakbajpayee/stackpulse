import { createClient } from '@supabase/supabase-js';
import { SEED_STARTUPS } from './startups-data';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://huubxklntrxcwqkoumhd.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_TDCRrXlv30o9LjLM_uofjg_WhJDQ_si';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const DEFAULT_STARTUPS = SEED_STARTUPS;
