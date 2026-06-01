import { createClientAnonKey, createClientServiceRoleKey } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClientAnonKey()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { team_preference, committee_rank_1, committee_rank_2, committee_rank_3 } = body

  const admin = createClientServiceRoleKey()
  const { error } = await admin.from('preference_submissions').upsert({
    user_id: user.id,
    team_preference,
    committee_rank_1,
    committee_rank_2,
    committee_rank_3,
    updated_at: new Date().toISOString(),
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true }, { status: 200 })
}
