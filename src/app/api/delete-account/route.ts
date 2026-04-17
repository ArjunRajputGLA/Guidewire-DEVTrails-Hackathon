import { createSupabaseServerClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Get the current user session
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    // Clean up service role key in case it includes trailing comments
    let serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    if (serviceKey.includes('#')) {
      serviceKey = serviceKey.split('#')[0].trim();
    }
    
    // Use the Supabase Service Role Key to bypass RLS and delete everything
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Forcefully delete all related table entities as admin
    const tables = [
      { name: 'claims', col: 'worker_id' },
      { name: 'notifications', col: 'user_id' },
      { name: 'kyc_documents', col: 'worker_id' },
      { name: 'payment_info', col: 'worker_id' },
      { name: 'worker_policies', col: 'worker_id' },
      { name: 'income_data', col: 'worker_id' },
      { name: 'gig_profiles', col: 'id' },
      { name: 'worker_profiles', col: 'id' }
    ];

    for (const table of tables) {
      const { error } = await supabaseAdmin.from(table.name).delete().eq(table.col, user.id);
      if (error) {
        console.error(`Error deleting from ${table.name}:`, error);
        return NextResponse.json({ success: false, error: `Failed deleting from ${table.name}: ${error.message}` }, { status: 500 });
      }
    }
    
    // Finally, completely eradicate the Authentication User
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    
    if (deleteUserError) {
      console.error("Failed to delete auth user:", deleteUserError);
      return NextResponse.json({ success: false, error: deleteUserError.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    console.error('Delete account error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
