"use server";

import { createClient } from "@supabase/supabase-js";

export async function createWorkerProfile(formData: any) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing Supabase credentials for Admin operations.");
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    });

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
