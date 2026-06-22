import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
  const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .ilike("username", "Alexandro")
      .maybeSingle();
      
  console.log("Anon query result:");
  console.log("Data:", data);
  console.log("Error:", error);
}
main();
