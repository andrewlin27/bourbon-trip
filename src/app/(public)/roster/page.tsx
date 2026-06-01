import { createClientAnonKey } from '@/utils/supabase/server'
import { UserWithDetails } from '@/types/index'
import PlayerCard from '@/components/PlayerCard'

export const revalidate = 60

export default async function RosterPage() {
  const supabase = await createClientAnonKey()
  const { data } = await supabase
    .from('users')
    .select('*, profiles(*), preference_submissions(submitted_at)')
    .order('name')

  const { data: settings } = await supabase
    .from('app_settings')
    .select('teams_revealed')
    .single()

  const users = (data ?? []) as UserWithDetails[]
  const teamsRevealed = settings?.teams_revealed ?? false

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <p className="text-bourbon-amber text-xs font-semibold uppercase tracking-widest mb-1">The Squad</p>
        <h1 className="font-serif text-3xl font-bold text-bourbon-dark">Roster</h1>
        <p className="text-stone-400 text-sm mt-1">18 players · ACE Bourbon Trip 2026</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {users.map((user) => (
          <PlayerCard key={user.id} user={user} teamsRevealed={teamsRevealed} />
        ))}
      </div>
    </div>
  )
}
