import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://ckzhvurabmhvteekyjxg.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNremh2dXJhYm1odnRlZWt5anhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMDI3ODAsImV4cCI6MjA3MzY3ODc4MH0.Flyk7vlukV-hr5wThG6IogQTBQuUcI164kbU0cFwvws';

// This custom fetch function ensures that every request made to Supabase
// bypasses the browser's cache. This is a more robust solution to prevent
// stale data from being shown, which was causing inconsistencies between
// normal and incognito browser sessions.
const customFetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const options = init || {};
  // 'no-store' is the most direct instruction to the browser not to use any cache
  // and not to store the response in any cache.
  options.cache = 'no-store';
  return fetch(input, options);
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: customFetch,
  },
});