import { createClientAnonKey, createClientServiceRoleKey } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { CAPTAIN_EMAILS } from '@/types/index'
import AdminClient from './AdminClient'

export default async function AdminPage() {
  const supabase = await createClientAnonKey()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !CAPTAIN_EMAILS.includes(user.email ?? '')) redirect('/')

  const admin = createClientServiceRoleKey()

  const [prefsRes, packagesRes, rankingsRes, usersRes, settingsRes] = await Promise.all([
    admin.from('preference_submissions').select('*, users(name, email)').order('submitted_at'),
    admin.from('package_requests').select('*, requester:users!requester_id(name), requestee:users!requestee_id(name)').order('created_at'),
    admin.from('power_rankings').select('rank, season_label, user_id, users(id, name)').order('rank'),
    admin.from('users').select('id, name, team, is_captain, avatar_url').order('name'),
    admin.from('app_settings').select('*').single(),
  ])

  return (
    <AdminClient
      preferences={prefsRes.data ?? []}
      packageRequests={packagesRes.data ?? []}
      rankings={rankingsRes.data ?? []}
      allUsers={usersRes.data ?? []}
      settings={settingsRes.data}
    />
  )
}
