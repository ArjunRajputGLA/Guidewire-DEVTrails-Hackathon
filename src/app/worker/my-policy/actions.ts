"use server";

import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://irdacjbfzoslibpuomrh.supabase.co";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyZGFjamJmem9zbGlicHVvbXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDU4ODI3NywiZXhwIjoyMDkwMTY0Mjc3fQ.rra4G2bXeWiRH6KE7mh5Xxkacm01TtvOiHPz3uVYzew";
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  });
}

export async function removeWorkerPolicyAction(policyRowId: string, workerId: string) {
  try {
    const supabaseAdmin = getAdminClient();
    
    const { error } = await supabaseAdmin
      .from("worker_policies")
      .delete()
      .eq("id", policyRowId)
      .eq("worker_id", workerId);
      
    if (error) {
      return { success: false, error: error.message };
    }
    
    // Add notification
    await supabaseAdmin.from("notifications").insert([{
      user_id: workerId,
      title: "Policy Removed",
      message: "You have successfully removed a policy coverage.",
      type: "info"
    }]);

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
