import { createClientAnonKey, createClientServiceRoleKey } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const supabase = await createClientAnonKey()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { status }: { status: 'accepted' | 'declined' } = await req.json()

  const admin = createClientServiceRoleKey()

  // Fetch the request to verify user is the requestee
  const { data: pkgReq, error: fetchErr } = await admin
    .from('package_requests')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchErr || !pkgReq) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 })
  }
  if (pkgReq.requestee_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Prevent accepting a second group
  if (status === 'accepted') {
    const [{ data: incomingAccepted }, { data: outgoingAccepted }] = await Promise.all([
      admin.from('package_requests').select('id').eq('requestee_id', user.id).eq('status', 'accepted').neq('id', id).limit(1),
      admin.from('package_requests').select('id').eq('requester_id', user.id).eq('status', 'accepted').limit(1),
    ])

    if (incomingAccepted?.length || outgoingAccepted?.length) {
      return NextResponse.json({ error: 'You have already accepted a package group' }, { status: 409 })
    }
  }

  // Update the status
  const { error: updateErr } = await admin
    .from('package_requests')
    .update({ status })
    .eq('id', id)

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })

  // On accept: auto-rescind all outgoing pending requests from the acceptee
  if (status === 'accepted') {
    await admin
      .from('package_requests')
      .delete()
      .eq('requester_id', user.id)
      .in('status', ['pending', 'declined'])
  }

  // On accept: override the requestee's team_preference to match requester's
  if (status === 'accepted') {
    const { data: requesterPref } = await admin
      .from('preference_submissions')
      .select('team_preference')
      .eq('user_id', pkgReq.requester_id)
      .single()

    if (requesterPref) {
      await admin.from('preference_submissions').upsert({
        user_id: user.id,
        team_preference: requesterPref.team_preference,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
    }
  }

  return NextResponse.json({ success: true }, { status: 200 })
}
