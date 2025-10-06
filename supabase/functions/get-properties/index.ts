// FIX: The Deno global is not recognized in some editor environments.
// Declaring it here satisfies the type checker. The Supabase Edge Function
// runtime provides the Deno global.
declare const Deno: any;

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// NOTE FOR DEVELOPER:
// This Edge Function acts as a proxy to bypass browser CORS restrictions.
// While this works, the standard and recommended solution for Supabase projects
// is to configure the allowed origins directly in your project's dashboard.
//
// To do this, go to:
// 1. Your Supabase Project Dashboard
// 2. Project Settings (the gear icon)
// 3. API settings
// 4. Find the "CORS Origins" section and add the URL of your web app.
//
// This function requires SUPABASE_URL and SUPABASE_ANON_KEY to be set as
// environment variables in your Supabase project.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();

    // Create a Supabase client with the user's authorization.
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );
    
    // Replicate the query logic from the frontend app.
    let propertyQuery = supabase.from('imoveis').select('*, perfis:anunciante_id(*), midias_imovel(*)');
    
    if (userId) {
        propertyQuery = propertyQuery.or(`status.eq.ativo,anunciante_id.eq.${userId}`);
    } else {
        propertyQuery = propertyQuery.eq('status', 'ativo');
    }

    const { data, error } = await propertyQuery;

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
