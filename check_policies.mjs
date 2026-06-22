import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_KEY);

async function main() {
  const { data, error } = await supabaseAdmin.rpc('get_policies');
  if (error) {
    // maybe rpc doesn't exist, try querying pg_policies
    const { data: policies, error: err2 } = await supabaseAdmin
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'profiles');
    console.log("Policies:", policies);
  } else {
    console.log(data);
  }
}
main();
