"use server";

import { createClient } from "@supabase/supabase-js";

// Helper function to create supabaseAdmin when needed
function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://irdacjbfzoslibpuomrh.supabase.co";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyZGFjamJmem9zbGlicHVvbXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDU4ODI3NywiZXhwIjoyMDkwMTY0Mjc3fQ.rra4G2bXeWiRH6KE7mh5Xxkacm01TtvOiHPz3uVYzew";
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase credentials for Admin operations.");
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  });
}

export async function createWorkerProfile(formData: any) {
  try {
    const supabaseAdmin = getAdminClient();

    // 1. Create User
    const { data: auth, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: formData.email,
      password: formData.password,
      email_confirm: true,
      user_metadata: { name: formData.name }
    });

    if (authError) throw authError;

    // Use TypeScript optional chaining for safety during build
    const userId = auth?.user?.id;
    if (!userId) throw new Error("User ID was not created.");

    // Give triggers a moment just in case they are creating a row that upsert could conflict with on 0.01ms race conditions
    await new Promise((resolve) => setTimeout(resolve, 800));

    // 2. Upsert profile records
    await Promise.all([
      supabaseAdmin.from("worker_profiles").upsert({
        id: userId,
        full_name: formData.name,
        mobile: formData.phone,
        city: formData.city,
        city_zone: formData.zone,
        onboarding_step: 5,
        onboarding_complete: true
      }),
      supabaseAdmin.from("gig_profiles").upsert({
        id: userId,
        platform: formData.platform,
        tenure_months: parseInt(String(formData.tenure), 10) || 0
      }),
      supabaseAdmin.from("income_data").upsert({
        worker_id: userId,
        avg_daily_earnings: parseInt(String(formData.dailyAvgEarnings), 10) || 0
      }, { onConflict: 'worker_id' })
    ]);

    return { success: true };
  } catch (err: any) {
    console.error("Admin Worker Creation Error:", err);
    return { success: false, message: err.message || "Failed to create worker." };
  }
}

export async function getWorkersStatuses() {
  try {
    const supabaseAdmin = getAdminClient();
    const { data: usersData, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) throw error;
    
    // Map of userId -> status
    const statusMap: Record<string, "active" | "inactive" | "suspended"> = {};
    usersData.users.forEach((user) => {
      const metaStatus = user.user_metadata?.status;
      statusMap[user.id] = metaStatus || "active";
    });
    
    return { success: true, statuses: statusMap };
  } catch (err: any) {
    console.error("Error fetching statuses:", err);
    return { success: false, message: err.message || "Failed to fetch statuses." };
  }
}

export async function updateWorkerStatus(userId: string, newStatus: "active" | "inactive" | "suspended") {
  try {
    const supabaseAdmin = getAdminClient();
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: { status: newStatus }
    });
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error("Error updating worker status:", err);
    return { success: false, message: err.message || "Failed to update status." };
  }
}

export async function deleteWorkerRecord(userId: string) {
  try {
    const supabaseAdmin = getAdminClient();
    
    // Delete in order to satisfy FK constraints if needed
    await supabaseAdmin.from('claims').delete().eq('worker_id', userId);
    await supabaseAdmin.from('payment_info').delete().eq('worker_id', userId);
    await supabaseAdmin.from('payment_info').delete().eq('id', userId);
    await supabaseAdmin.from('income_data').delete().eq('worker_id', userId);
    await supabaseAdmin.from('gig_profiles').delete().eq('id', userId);
    await supabaseAdmin.from('kyc_documents').delete().eq('worker_id', userId);
    await supabaseAdmin.from('worker_profiles').delete().eq('id', userId);
    
    // Finally, delete the Auth user
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteAuthError) throw deleteAuthError;

    return { success: true };
  } catch (err: any) {
    console.error("Error deleting worker:", err);
    return { success: false, message: err.message || "Failed to delete worker." };
  }
}

export async function getWorkersData() {
  try {
    const supabaseAdmin = getAdminClient();

    const { data: profiles, error: profileErr } = await supabaseAdmin
      .from("worker_profiles")
      .select("id, full_name, mobile, city, city_zone, updated_at, gig_profiles(platform, tenure_months), income_data!income_data_worker_id_fkey(avg_daily_earnings)");

    if (profileErr) throw profileErr;

    const { data: users, error: userErr } = await supabaseAdmin.auth.admin.listUsers();
    if (userErr) throw userErr;

    const authUsers = users.users;
    
    return { success: true, data: profiles, authUsers: authUsers.map(u => ({ id: u.id, email: u.email, phone: u.phone })) };
  } catch (err: any) {
    console.error("Error fetching workers:", err);
    return { success: false, error: err.message };
  }
}
