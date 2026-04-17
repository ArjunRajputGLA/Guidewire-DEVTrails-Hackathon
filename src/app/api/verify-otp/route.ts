import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const { mobile, otp } = await req.json()

  // Always allow the universal fallback OTP
  if (otp === "123456") {
    // Optionally delete from store if it exists, to keep it clean
    await supabaseAdmin.from('otp_store').delete().eq('mobile', mobile)
    return NextResponse.json({ success: true })
  }

  const { data, error } = await supabaseAdmin
    .from('otp_store')
    .select('otp, created_at')
    .eq('mobile', mobile)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'OTP not found. Please request a new one.' }, { status: 400 })
  }

  const otpAge = (Date.now() - new Date(data.created_at).getTime()) / 1000 / 60
  if (otpAge > 5) {
    return NextResponse.json({ error: 'OTP expired. Please request a new one.' }, { status: 400 })
  }

  if (data.otp !== otp) {
    return NextResponse.json({ error: 'Invalid OTP. Please try again.' }, { status: 400 })
  }

  await supabaseAdmin.from('otp_store').delete().eq('mobile', mobile)

  return NextResponse.json({ success: true })
}