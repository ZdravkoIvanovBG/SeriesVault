import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const TMDB_BASE = "https://api.themoviedb.org/3";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const token = Deno.env.get("TMDB_API_READ_ACCESS_TOKEN");
    if (!token) {
      return new Response(JSON.stringify({ error: "TMDB token not configured" }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { endpoint, params } = await req.json();

    if (!endpoint) {
      return new Response(JSON.stringify({ error: "Endpoint is required" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Whitelist allowed endpoints
    const allowedPrefixes = [
      "/trending/tv",
      "/search/tv",
      "/tv/",
      "/genre/tv",
      "/discover/tv",
    ];

    if (!allowedPrefixes.some((p) => endpoint.startsWith(p))) {
      return new Response(JSON.stringify({ error: "Endpoint not allowed" }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const queryString = params
      ? "?" + new URLSearchParams(params).toString()
      : "";

    const tmdbRes = await fetch(`${TMDB_BASE}${endpoint}${queryString}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await tmdbRes.json();

    return new Response(JSON.stringify(data), {
      status: tmdbRes.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
