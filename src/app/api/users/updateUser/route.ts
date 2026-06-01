import { createClientAnonKey, createClientServiceRoleKey } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { CAPTAIN_EMAILS } from '@/types/index'

export async function PUT(req: NextRequest) {
  const supabase = await createClientAnonKey()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const admin = createClientServiceRoleKey()

  // Captains can update any user's team; others can only update their own flight/avatar
  if (body.id && body.id !== user.id) {
    if (!CAPTAIN_EMAILS.includes(user.email ?? '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const { error } = await admin
      .from('users')
      .update({ team: body.team ?? null })
      .eq('id', body.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true }, { status: 200 })
  }

  // Self-update: flight times and avatar
  const { flight_arrival, flight_departure, avatar_url } = body
  const { error } = await admin
    .from('users')
    .update({ flight_arrival, flight_departure, avatar_url })
    .eq('id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true }, { status: 200 })
}
