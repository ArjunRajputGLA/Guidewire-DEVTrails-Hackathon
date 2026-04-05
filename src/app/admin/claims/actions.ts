"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

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

export async function deleteClaimAction(id: string) {
  try {
    const supabaseAdmin = getAdminClient();
    
    const { error } = await supabaseAdmin
      .from("claims")
      .delete()
      .eq("id", id);
      
    if (error) {
      console.error("Error deleting claim in action:", error);
      return { success: false, error: error.message };
    }
    
    // Explicitly revalidate the admin claims path so Next.js pulls fresh data
    revalidatePath("/admin/claims");

    return { success: true };
  } catch (err: any) {
    console.error("Server action exception:", err);
    return { success: false, error: err.message };
  }
}
