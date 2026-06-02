import { createClientAnonKey, createClientServiceRoleKey } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(req: NextRequest) {
  const supabase = await createClientAnonKey()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { data: existing } = await supabase
    .from('package_requests')
    .select('requester_id, status')
    .eq('id', id)
    .single()

  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (existing.requester_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (existing.status !== 'pending') return NextResponse.json({ error: 'Only pending requests can be rescinded' }, { status: 409 })

  const admin = createClientServiceRoleKey()
  const { error } = await admin.from('package_requests').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true }, { status: 200 })
}
