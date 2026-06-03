import { createClientAnonKey, createClientServiceRoleKey } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClientAnonKey()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const admin = createClientServiceRoleKey()

  const { data: existing } = await admin
    .from('preference_submissions')
    .select('user_id')
    .eq('user_id', user.id)
    .single()

  let error
  if (existing) {
    const fields: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if ('team_preference' in body) fields.team_preference = body.team_preference
    if ('committee_rank_1' in body) fields.committee_rank_1 = body.committee_rank_1
    if ('committee_rank_2' in body) fields.committee_rank_2 = body.committee_rank_2
    if ('committee_rank_3' in body) fields.committee_rank_3 = body.committee_rank_3
    ;({ error } = await admin.from('preference_submissions').update(fields).eq('user_id', user.id))
  } else {
    ;({ error } = await admin.from('preference_submissions').insert({
      user_id: user.id,
      team_preference: body.team_preference ?? '',
      committee_rank_1: body.committee_rank_1 ?? '',
      committee_rank_2: body.committee_rank_2 ?? '',
      committee_rank_3: body.committee_rank_3 ?? '',
      updated_at: new Date().toISOString(),
    }))
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true }, { status: 200 })
}
