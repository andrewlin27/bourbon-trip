'use client'

import { useMemo, useState } from 'react'
import { Team, UserWithDetails } from '@/types/index'
import PlayerCard from '@/components/PlayerCard'

type RosterFilter = 'all' | Team

interface Props {
  users: UserWithDetails[]
  showFlightInfo: boolean
}

const FILTERS: { value: RosterFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'lin', label: 'Team Lin' },
  { value: 'ditty', label: 'Team Ditty' },
]

export default function RosterTeamFilter({ users, showFlightInfo }: Props) {
  const [filter, setFilter] = useState<RosterFilter>('all')

  const filteredUsers = useMemo(() => {
    if (filter === 'all') return users
    return users.filter((user) => user.team === filter)
  }, [filter, users])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="bg-white border border-stone-200 rounded-xl p-1 grid grid-cols-3 gap-1 sm:w-auto">
          {FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                filter === option.value
                  ? getActiveFilterClass(option.value)
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className="text-sm text-stone-400">
          Showing {filteredUsers.length} of {users.length} players
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredUsers.map((user) => (
          <PlayerCard
            key={user.id}
            user={user}
            teamsRevealed
            showFlightInfo={showFlightInfo}
          />
        ))}
      </div>
    </div>
  )
}

function getActiveFilterClass(filter: RosterFilter) {
  if (filter === 'lin') return 'bg-team-lin text-white shadow-sm'
  if (filter === 'ditty') return 'bg-team-ditty text-white shadow-sm'
  return 'bg-bourbon-dark text-bourbon-cream shadow-sm'
}
