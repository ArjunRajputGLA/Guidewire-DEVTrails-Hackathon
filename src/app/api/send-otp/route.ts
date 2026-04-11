// import { NextRequest, NextResponse } from 'next/server'
// import { createClient } from '@supabase/supabase-js'

// const supabaseAdmin = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.SUPABASE_SERVICE_ROLE_KEY!
// )

// export async function POST(req: NextRequest) {
//   const { mobile } = await req.json()

//   if (!mobile || mobile.length !== 10) {
//     return NextResponse.json({ error: 'Invalid mobile number' }, { status: 400 })
//   }

//   const otp = Math.floor(100000 + Math.random() * 900000).toString()

//   await supabaseAdmin.from('otp_store').upsert({
//     mobile, otp, created_at: new Date().toISOString()
//   })

//   const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
//     method: 'POST',
//     headers: {
//       'authorization': process.env.FAST2SMS_API_KEY!,
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({
//       route: 'q',
//       message: `Your GigShield OTP is: ${otp}. Valid for 5 minutes. Do not share with anyone.`,
//       language: 'english',
//       flash: 0,
//       numbers: mobile,
//     })
//   })

//   const result = await response.json()

//   if (!result.return) {
//     return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 })
//   }

//   return NextResponse.json({ success: true })
// }

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const { mobile } = await req.json()

  if (!mobile || mobile.length !== 10) {
    return NextResponse.json({ error: 'Invalid mobile number' }, { status: 400 })
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString()

  const { error: dbError } = await supabaseAdmin.from('otp_store').upsert({
    mobile, otp, created_at: new Date().toISOString()
  })

  if (dbError) {
    console.error('DB Error:', dbError)
    return NextResponse.json({ error: 'Database error: ' + dbError.message }, { status: 500 })
  }

  const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
    method: 'POST',
    headers: {
      'authorization': process.env.FAST2SMS_API_KEY!,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      route: 'q',
      message: `Your GigShield OTP is: ${otp}. Valid for 5 minutes.`,
      language: 'english',
      flash: 0,
      numbers: mobile,
    })
  })

  const result = await response.json()
  console.log('Fast2SMS response:', result)

  if (!result.return) {
    return NextResponse.json({ error: 'SMS failed: ' + JSON.stringify(result) }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}