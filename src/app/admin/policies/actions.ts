"use server";

import { createClient } from "@supabase/supabase-js";

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

export async function fetchWorkerPoliciesAction() {
  try {
    const supabaseAdmin = getAdminClient();
    
    // Fetch all active worker policies
    const { data, error } = await supabaseAdmin
      .from("worker_policies")
      .select("*, worker_profiles(full_name, mobile), insurance_products(name, tier)")
      .eq("status", "active")
      .order("created_at", { ascending: false });
      
    if (error) {
      console.error("Error fetching worker policies in action:", error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (err: any) {
    console.error("Server action exception:", err);
    return { success: false, error: err.message };
  }
}
