import { createClientAnonKey } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClientAnonKey()
  const { data, error } = await supabase
    .from('power_rankings')
    .select('rank, season_label, updated_at, users(id, name, avatar_url)')
    .order('rank')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 200 })
}
