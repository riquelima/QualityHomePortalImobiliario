import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://ckzhvurabmhvteekyjxg.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNremh2dXJhYm1odnRlZWt5anhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMDI3ODAsImV4cCI6MjA3MzY3ODc4MH0.Flyk7vlukV-hr5wThG6IogQTBQuUcI164kbU0cFwvws';

// By adding the 'Cache-Control': 'no-store' header, we instruct the browser
// to always fetch the latest data from Supabase, bypassing any local cache.
// This resolves the issue where data loads in incognito mode but not in a normal
// browser session due to stale cached data.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: {
      'Cache-Control': 'no-store',
    },
  },
});
