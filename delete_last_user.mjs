import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_KEY);

async function main() {
  const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) {
    console.error(error);
    return;
  }
  // sort by created_at desc
  const sorted = users.users.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  
  if (sorted.length > 0) {
    const lastUser = sorted[0];
    console.log("Last user:", lastUser.email, lastUser.user_metadata?.username, lastUser.created_at);
    
    const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(lastUser.id);
    if (delErr) {
      console.log("Error deleting:", delErr);
    } else {
      console.log("Deleted user successfully:", lastUser.email);
    }
  } else {
    console.log("No users found.");
  }
}
main();
