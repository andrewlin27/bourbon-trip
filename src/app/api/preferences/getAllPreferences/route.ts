import { createClientAnonKey, createClientServiceRoleKey } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { CAPTAIN_EMAILS } from '@/types/index'

export async function GET() {
  const supabase = await createClientAnonKey()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !CAPTAIN_EMAILS.includes(user.email ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const admin = await createClientServiceRoleKey()
  const { data, error } = await admin
    .from('preference_submissions')
    .select('*, users(name, email)')
    .order('submitted_at')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 200 })
}
