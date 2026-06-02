import { createClientAnonKey, createClientServiceRoleKey } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ProfileClient from './ProfileClient'

export default async function ProfilePage() {
  const supabase = await createClientAnonKey()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/?auth=required')

  const admin = createClientServiceRoleKey()

  const [userRes, profileRes, prefRes, incomingRaw, acceptedRaw, outgoingRes, allUsersRes] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('profiles').select('*').eq('user_id', user.id).single(),
    supabase.from('preference_submissions').select('*').eq('user_id', user.id).single(),
    supabase.from('package_requests')
      .select('id, requester_id, status, created_at, requestee_id, requester:users!requester_id(id, name)')
      .eq('requestee_id', user.id)
      .eq('status', 'pending'),
    supabase.from('package_requests')
      .select('id, requester_id, requester:users!requester_id(id, name)')
      .eq('requestee_id', user.id)
      .eq('status', 'accepted')
      .limit(1),
    supabase.from('package_requests')
      .select('id, status, requestee:users!requestee_id(id, name)')
      .eq('requester_id', user.id)
      .order('created_at'),
    supabase.from('users').select('id, name, is_captain').order('name'),
  ])

  // For each incoming pending request, fetch the other non-declined group members
  const incoming = incomingRaw.data ?? []
  const requesterIds = [...new Set(incoming.map((r) => r.requester_id))]

  const groupMembersMap: Record<string, { id: string; name: string; status: string }[]> = {}
  if (requesterIds.length > 0) {
    const { data: others } = await admin
      .from('package_requests')
      .select('requester_id, status, requestee:users!requestee_id(id, name)')
      .in('requester_id', requesterIds)
      .neq('requestee_id', user.id)
      .neq('status', 'declined')

    for (const other of others ?? []) {
      const rid = other.requester_id as string
      if (!groupMembersMap[rid]) groupMembersMap[rid] = []
      const requestee = Array.isArray(other.requestee) ? other.requestee[0] : other.requestee
      if (requestee) groupMembersMap[rid].push({ id: (requestee as { id: string; name: string }).id, name: (requestee as { id: string; name: string }).name, status: other.status as string })
    }
  }

  const pendingPackages = incoming.map((req) => {
    const requesterRaw = Array.isArray(req.requester) ? req.requester[0] : req.requester
    return {
      ...req,
      requester: requesterRaw as { id: string; name: string },
      groupMembers: groupMembersMap[req.requester_id] ?? [],
    }
  })

  // Build accepted group view (the group this user joined as a requestee)
  const acceptedRow = acceptedRaw.data?.[0] ?? null
  let acceptedGroup: { requester: { id: string; name: string }; members: { id: string; name: string; status: string }[] } | null = null

  if (acceptedRow) {
    const requesterRaw = Array.isArray(acceptedRow.requester) ? acceptedRow.requester[0] : acceptedRow.requester
    const requester = requesterRaw as { id: string; name: string }

    const { data: otherMembers } = await admin
      .from('package_requests')
      .select('status, requestee:users!requestee_id(id, name)')
      .eq('requester_id', acceptedRow.requester_id)
      .neq('requestee_id', user.id)
      .neq('status', 'declined')

    const members = (otherMembers ?? []).map((m) => {
      const requestee = Array.isArray(m.requestee) ? m.requestee[0] : m.requestee
      return { ...(requestee as { id: string; name: string }), status: m.status as string }
    })

    acceptedGroup = { requester, members }
  }

  return (
    <ProfileClient
      currentUser={userRes.data}
      profile={profileRes.data ?? null}
      existingPreference={prefRes.data ?? null}
      pendingPackages={pendingPackages}
      hasAcceptedGroup={!!acceptedRow}
      acceptedGroup={acceptedGroup}
      outgoingPackages={outgoingRes.data ?? []}
      allUsers={allUsersRes.data ?? []}
    />
  )
}
