import { createClientAnonKey } from '@/utils/supabase/server'
import { Team, UserWithDetails } from '@/types/index'
import PlayerCard from '@/components/PlayerCard'

export const dynamic = 'force-dynamic'

export default async function RosterPage() {
  const supabase = await createClientAnonKey()
  const [{ data }, { data: settings }, { data: authData }] = await Promise.all([
    supabase
      .from('users')
      .select('*, profiles(*), preference_submissions(submitted_at)')
      .order('name'),
    supabase
      .from('app_settings')
      .select('teams_revealed')
      .single(),
    supabase.auth.getUser(),
  ])

  const users = (data ?? []) as UserWithDetails[]
  const teamsRevealed = settings?.teams_revealed ?? false
  const showFlightInfo = !!authData.user
  const teamSections = getTeamSections(users)
  const unassignedUsers = users.filter((user) => !user.team)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <p className="text-bourbon-amber text-xs font-semibold uppercase tracking-widest mb-1">The Squad</p>
        <h1 className="font-serif text-3xl font-bold text-bourbon-dark">Roster</h1>
        <p className="text-stone-400 text-sm mt-1">18 players · ACE Bourbon Trip 2026</p>
      </div>
      {teamsRevealed ? (
        <div className="space-y-8">
          {teamSections.map((section) => (
            <TeamRosterSection
              key={section.team}
              title={section.title}
              team={section.team}
              users={section.users}
              teamsRevealed={teamsRevealed}
              showFlightInfo={showFlightInfo}
            />
          ))}
          {unassignedUsers.length > 0 && (
            <TeamRosterSection
              title="Unassigned"
              users={unassignedUsers}
              teamsRevealed={teamsRevealed}
              showFlightInfo={showFlightInfo}
            />
          )}
        </div>
      ) : (
        <PlayerGrid
          users={users}
          teamsRevealed={teamsRevealed}
          showFlightInfo={showFlightInfo}
        />
      )}
    </div>
  )
}

function getTeamSections(users: UserWithDetails[]) {
  return [
    {
      team: 'lin' as const,
      title: 'Team Lin',
      users: users.filter((user) => user.team === 'lin'),
    },
    {
      team: 'ditty' as const,
      title: 'Team Ditty',
      users: users.filter((user) => user.team === 'ditty'),
    },
  ].filter((section) => section.users.length > 0)
}

function TeamRosterSection({
  title,
  team,
  users,
  teamsRevealed,
  showFlightInfo,
}: {
  title: string
  team?: Team
  users: UserWithDetails[]
  teamsRevealed: boolean
  showFlightInfo: boolean
}) {
  const teamColor =
    team === 'lin'
      ? 'bg-team-lin'
      : team === 'ditty'
      ? 'bg-team-ditty'
      : 'bg-stone-300'

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3 border-b border-stone-200 pb-2">
        <div className="flex items-center gap-2">
          <span className={`h-3 w-3 rounded-full ${teamColor}`} aria-hidden="true" />
          <h2 className="font-serif text-2xl font-bold text-bourbon-dark">{title}</h2>
        </div>
        <span className="text-xs font-medium text-stone-400">
          {users.length} {users.length === 1 ? 'player' : 'players'}
        </span>
      </div>
      <PlayerGrid
        users={users}
        teamsRevealed={teamsRevealed}
        showFlightInfo={showFlightInfo}
      />
    </section>
  )
}

function PlayerGrid({
  users,
  teamsRevealed,
  showFlightInfo,
}: {
  users: UserWithDetails[]
  teamsRevealed: boolean
  showFlightInfo: boolean
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {users.map((user) => (
        <PlayerCard
          key={user.id}
          user={user}
          teamsRevealed={teamsRevealed}
          showFlightInfo={showFlightInfo}
        />
      ))}
    </div>
  )
}
