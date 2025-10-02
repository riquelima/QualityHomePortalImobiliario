import { createClient } from '@supabase/supabase-js';

// --- IMPORTANTE: AÇÃO NECESSÁRIA PARA O PREVIEW FUNCIONAR ---
// O preview está mostrando um erro de "Invalid API key" porque a chave na linha abaixo está incorreta.
// Por favor, substitua o valor de `SUPABASE_ANON_KEY_FALLBACK` pela sua chave "anon public" correta do Supabase.
// Você pode encontrá-la no seu painel do Supabase em: Project Settings > API > Project API keys.
const SUPABASE_URL_FALLBACK = 'https://ckzhvurabmhvteekyjxg.supabase.co';
const SUPABASE_ANON_KEY_FALLBACK = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNremh2dXJhYm1odnRlZWt5anhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTgxMDQzMjgsImV4cCI6MjAzMzY4MDMyOH0.C4nKR-13GrSa-9a3cM03272-i_EIDpGYh-3-aO4jWDA'; // <--- SUBSTITUA ESTA CHAVE PELA SUA CHAVE CORRETA

const supabaseUrl = process.env.SUPABASE_URL || SUPABASE_URL_FALLBACK;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || SUPABASE_ANON_KEY_FALLBACK;

if (!supabaseUrl || !supabaseAnonKey || supabaseAnonKey.includes('SUA_CHAVE')) {
  throw new Error('Supabase URL e chave anônima devem ser fornecidas corretamente em supabaseClient.ts ou nas variáveis de ambiente.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
