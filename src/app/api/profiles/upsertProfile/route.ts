import { createClientAnonKey, createClientServiceRoleKey } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClientAnonKey()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { prompt1_question, prompt1_answer, prompt2_question, prompt2_answer } = body

  const admin = createClientServiceRoleKey()
  const { error } = await admin.from('profiles').upsert({
    user_id: user.id,
    prompt1_question,
    prompt1_answer,
    prompt2_question,
    prompt2_answer,
    updated_at: new Date().toISOString(),
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true }, { status: 200 })
}
