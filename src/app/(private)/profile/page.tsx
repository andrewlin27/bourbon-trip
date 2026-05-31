import { createClientAnonKey } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ProfileClient from './ProfileClient'

export default async function ProfilePage() {
  const supabase = await createClientAnonKey()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/?auth=required')

  const [userRes, profileRes, prefRes, packagesRes, allUsersRes] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('profiles').select('*').eq('user_id', user.id).single(),
    supabase.from('preference_submissions').select('*').eq('user_id', user.id).single(),
    supabase.from('package_requests')
      .select('*, requester:users!requester_id(id, name)')
      .eq('requestee_id', user.id)
      .eq('status', 'pending'),
    supabase.from('users').select('id, name, is_captain').order('name'),
  ])

  return (
    <ProfileClient
      currentUser={userRes.data}
      profile={profileRes.data ?? null}
      existingPreference={prefRes.data ?? null}
      pendingPackages={packagesRes.data ?? []}
      allUsers={allUsersRes.data ?? []}
    />
  )
}
