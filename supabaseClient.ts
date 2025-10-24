import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ckzhvurabmhvteekyjxg.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNremh2dXJhYm1odnRlZWt5anhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMDI3ODAsImV4cCI6MjA3MzY3ODc4MH0.Flyk7vlukV-hr5wThG6IogQTBQuUcI164kbU0cFwvws';

// By removing the custom fetch wrapper, we rely on the robust, built-in
// fetch handling of the Supabase client library. This is more stable, especially
// for complex operations like file uploads, and fixes the issue where the
// publishing process would hang indefinitely. The original problem of caching
// should be addressed by configuring CORS and cache policies in the Supabase Dashboard,
// which is the recommended approach.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);