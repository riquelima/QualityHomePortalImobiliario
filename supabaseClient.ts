import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ckzhvurabmhvteekyjxg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNremh2dXJhYm1odnRlZWt5anhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMDI3ODAsImV4cCI6MjA3MzY3ODc4MH0.Flyk7vlukV-hr5wThG6IogQTBQuUcI164kbU0cFwvws';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);