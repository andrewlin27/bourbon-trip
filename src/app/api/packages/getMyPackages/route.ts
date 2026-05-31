import { createClientAnonKey } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClientAnonKey()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get incoming pending requests for this user
  const { data: incoming, error: e1 } = await supabase
    .from('package_requests')
    .select('*, requester:users!requester_id(id, name)')
    .eq('requestee_id', user.id)
    .eq('status', 'pending')

  // Get outgoing requests this user sent
  const { data: outgoing, error: e2 } = await supabase
    .from('package_requests')
    .select('*, requestee:users!requestee_id(id, name, email)')
    .eq('requester_id', user.id)

  if (e1 || e2) return NextResponse.json({ error: (e1 ?? e2)?.message }, { status: 500 })
  return NextResponse.json({ incoming: incoming ?? [], outgoing: outgoing ?? [] }, { status: 200 })
}
