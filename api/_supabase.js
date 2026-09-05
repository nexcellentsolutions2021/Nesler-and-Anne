import { createClient } from '@supabase/supabase-js';

// Uses the SERVICE ROLE key — this file only ever runs on the server
// (inside a Vercel serverless function), never in the browser, so the
// key is never exposed to guests or the admin's browser.
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);
