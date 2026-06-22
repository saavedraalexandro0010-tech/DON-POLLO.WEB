import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_KEY);

async function main() {
  const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .ilike("username", "Alexandro")
      .maybeSingle();
  console.log("Data Alexandro:", data);
  console.log("Error Alexandro:", error);
}
main();
