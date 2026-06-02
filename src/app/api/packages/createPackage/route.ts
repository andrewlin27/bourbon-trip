import { createClientAnonKey, createClientServiceRoleKey } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClientAnonKey()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { requestee_ids }: { requestee_ids: string[] } = await req.json()
  if (!requestee_ids?.length) {
    return NextResponse.json({ error: 'No requestees provided' }, { status: 400 })
  }

  const admin = createClientServiceRoleKey()
  const rows = requestee_ids.map((id) => ({
    requester_id: user.id,
    requestee_id: id,
    status: 'pending',
  }))

  // Upsert — ignore duplicates, reset to pending if previously declined
  const { error } = await admin
    .from('package_requests')
    .upsert(rows, { onConflict: 'requester_id,requestee_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: created } = await admin
    .from('package_requests')
    .select('id, status, requestee:users!requestee_id(id, name)')
    .eq('requester_id', user.id)
    .in('requestee_id', requestee_ids)

  return NextResponse.json({ success: true, packages: created ?? [] }, { status: 200 })
}
