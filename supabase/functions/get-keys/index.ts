import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
serve((req) => new Response(Deno.env.get('GEMINI_API_KEYS') || "none"));
