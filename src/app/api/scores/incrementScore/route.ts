import { createClientAnonKey, createClientServiceRoleKey } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClientAnonKey()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify user is captain or team lead
  const { data: userData } = await supabase
    .from('users')
    .select('is_captain, is_team_lead')
    .eq('id', user.id)
    .single()

  if (!userData?.is_captain && !userData?.is_team_lead) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { team, amount = 1 }: { team: 'lin' | 'ditty'; amount?: number } = await req.json()
  if (!['lin', 'ditty'].includes(team)) {
    return NextResponse.json({ error: 'Invalid team' }, { status: 400 })
  }

  const admin = createClientServiceRoleKey()
  const { data: current } = await admin
    .from('scores')
    .select('points')
    .eq('team', team)
    .single()

  const newPoints = (current?.points ?? 0) + amount

  const { error } = await admin
    .from('scores')
    .update({ points: newPoints, updated_by: user.id, updated_at: new Date().toISOString() })
    .eq('team', team)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, points: newPoints }, { status: 200 })
}
