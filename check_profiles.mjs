import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_KEY);

async function main() {
  const { data: profiles, error } = await supabaseAdmin.from('profiles').select('*');
  if (error) {
    console.error(error);
    return;
  }
  console.log("Profiles in DB:", profiles.map(p => ({ id: p.id, username: p.username })));
}
main();
