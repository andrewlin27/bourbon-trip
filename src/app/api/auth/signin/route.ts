import { createClientAnonKey, createClientServiceRoleKey } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  const admin = createClientServiceRoleKey()
  const { data: knownUser } = await admin
    .from('users')
    .select('id')
    .eq('email', email.trim().toLowerCase())
    .single()

  if (!knownUser) {
    return NextResponse.json(
      { error: 'That email isn\'t on the guest list. Check for typos or contact a captain.' },
      { status: 403 }
    )
  }

  const supabase = await createClientAnonKey()
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback`,
    },
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true }, { status: 200 })
}
