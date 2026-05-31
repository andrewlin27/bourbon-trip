import { createClientAnonKey } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClientAnonKey()
  const { data, error } = await supabase
    .from('users')
    .select('*, profiles(*), preference_submissions(submitted_at)')
    .order('name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 200 })
}
