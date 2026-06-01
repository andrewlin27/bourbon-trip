import { createClientAnonKey, createClientServiceRoleKey } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { CAPTAIN_EMAILS } from '@/types/index'

export async function PUT(req: NextRequest) {
  const supabase = await createClientAnonKey()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !CAPTAIN_EMAILS.includes(user.email ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { rankings, season_label }: { rankings: { user_id: string; rank: number }[]; season_label: string } = await req.json()

  const admin = createClientServiceRoleKey()
  const rows = rankings.map(({ user_id, rank }) => ({
    user_id,
    rank,
    season_label,
    updated_at: new Date().toISOString(),
  }))

  const { error } = await admin
    .from('power_rankings')
    .upsert(rows, { onConflict: 'user_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true }, { status: 200 })
}
