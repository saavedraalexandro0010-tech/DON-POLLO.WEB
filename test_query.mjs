import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_KEY);

async function main() {
  const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .ilike("username", "Alicia")
      .maybeSingle();
  console.log("Data:", data);
  console.log("Error:", error);
}
main();
