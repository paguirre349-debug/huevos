import { createClient } from "@supabase/supabase-js";

// Estas dos variables las cargás en Vercel (te explico en el instructivo).
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
