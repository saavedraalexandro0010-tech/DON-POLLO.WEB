import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_KEY);

async function main() {
  const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) {
    console.error(error);
    return;
  }
  
  const emails = users.users.map(u => ({ id: u.id, email: u.email, created_at: u.created_at }));
  
  const { data: profiles } = await supabaseAdmin.from('profiles').select('*');
  
  const merged = profiles.map(p => {
    const u = emails.find(e => e.id === p.id);
    return {
      username: p.username,
      email: u ? u.email : 'Unknown',
      created_at: u ? u.created_at : 'Unknown'
    };
  });
  
  console.log("All accounts:");
  console.table(merged);
}
main();
