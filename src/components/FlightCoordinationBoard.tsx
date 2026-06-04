'use client'

import { useState } from 'react'
import { User } from '@/types/index'
import {
  buildFlightMatches,
  buildPersonalizedFlightMatches,
  FlightGroup,
  FlightLeg,
  formatFlightDisplayTime,
  formatMinutes,
  getFlightLegs,
} from '@/utils/flights'

interface Props {
  users: Pick<User, 'id' | 'name' | 'flight_arrival' | 'flight_departure'>[]
  currentUserId: string | null
}

const KIND_LABEL = {
  arrival: 'Arrivals',
  departure: 'Departures',
} as const

export default function FlightCoordinationBoard({ users, currentUserId }: Props) {
  const [mode, setMode] = useState<'all' | 'mine'>('all')
  const matches = buildFlightMatches(users)
  const personalizedMatches = buildPersonalizedFlightMatches(users, currentUserId)
  const incompleteLegs = getFlightLegs(users).filter((leg) => leg.minutes === null)
  const hasAnyFlights = users.some((user) => user.flight_arrival || user.flight_departure)
  const hasPersonalFlight = personalizedMatches.currentUserLegs.length > 0
  const activeMatches = mode === 'mine' ? personalizedMatches : matches

  if (!hasAnyFlights) {
    return (
      <div className="bg-white border border-stone-200 rounded-xl px-5 py-8 text-center">
        <p className="text-stone-400 text-sm">No flights added yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {currentUserId && (
        <div className="bg-white border border-stone-200 rounded-xl p-1 grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => setMode('all')}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              mode === 'all'
                ? 'bg-bourbon-dark text-bourbon-cream shadow-sm'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            All Groups
          </button>
          <button
            type="button"
            onClick={() => setMode('mine')}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              mode === 'mine'
                ? 'bg-bourbon-dark text-bourbon-cream shadow-sm'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            My Matches
          </button>
        </div>
      )}

      {mode === 'mine' && !currentUserId && (
        <div className="bg-white border border-stone-200 rounded-xl px-5 py-6">
          <p className="text-sm font-medium text-stone-800">Sign in to see personalized matches.</p>
          <p className="text-sm text-stone-500 mt-1">
            The public groups below still show everyone&apos;s flight coordination.
          </p>
        </div>
      )}

      {mode === 'mine' && currentUserId && !hasPersonalFlight && (
        <div className="bg-white border border-stone-200 rounded-xl px-5 py-6">
          <p className="text-sm font-medium text-stone-800">Add your flight details to unlock My Matches.</p>
          <p className="text-sm text-stone-500 mt-1">
            Include your flight times and flight numbers on your profile.
          </p>
        </div>
      )}

      {mode === 'all' && incompleteLegs.length > 0 && (
        <section className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-amber-900">Needs flight details</h2>
              <p className="text-xs text-amber-700 mt-0.5">
                Missing times will not appear in one-hour matches.
              </p>
            </div>
            <span className="text-xs font-medium text-amber-700">{incompleteLegs.length}</span>
          </div>
          <div className="mt-3 divide-y divide-amber-200/70">
            {incompleteLegs.map((leg) => (
              <div key={`${leg.userId}:${leg.kind}:missing`} className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-amber-950">{leg.userName}</p>
                  <p className="text-xs text-amber-700 capitalize">{leg.kind}</p>
                </div>
                <p className="text-xs text-amber-800 text-right">
                  Missing time
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <FlightGroupSection
        title={mode === 'mine' ? 'Your Same Flights' : 'Same Flight'}
        description="People on the exact same flight number."
        emptyText={mode === 'mine' ? 'No one shares your flight numbers yet.' : 'No shared flight numbers yet.'}
        groups={activeMatches.sameFlights}
        currentUserId={currentUserId}
        showFlight
      />
      <FlightGroupSection
        title={mode === 'mine' ? 'Near Your Times' : 'One-Hour Windows'}
        description="People arriving or departing within an hour of each other."
        emptyText={mode === 'mine' ? 'No one is within one hour of your times yet.' : 'No flight times within one hour yet.'}
        groups={activeMatches.closeAirportWindows}
        currentUserId={currentUserId}
        showWindow
      />
    </div>
  )
}

function FlightGroupSection({
  title,
  description,
  emptyText,
  groups,
  currentUserId,
  showFlight = false,
  showWindow = false,
}: {
  title: string
  description?: string
  emptyText: string
  groups: FlightGroup[]
  currentUserId: string | null
  showFlight?: boolean
  showWindow?: boolean
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl font-bold text-bourbon-dark">{title}</h2>
          {description && <p className="text-xs text-stone-400 mt-0.5">{description}</p>}
        </div>
        <span className="text-xs text-stone-400 shrink-0">{groups.length}</span>
      </div>
      {groups.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-xl px-4 py-5">
          <p className="text-sm text-stone-400">{emptyText}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => (
            <FlightGroupCard
              key={group.key}
              group={group}
              currentUserId={currentUserId}
              showFlight={showFlight}
              showWindow={showWindow}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function FlightGroupCard({
  group,
  currentUserId,
  showFlight,
  showWindow,
}: {
  group: FlightGroup
  currentUserId: string | null
  showFlight: boolean
  showWindow: boolean
}) {
  const timedTravelers = group.travelers.filter((leg) => leg.minutes !== null)
  const firstTime = timedTravelers[0]?.minutes
  const lastTime = timedTravelers[timedTravelers.length - 1]?.minutes

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-bourbon-amber">
            {KIND_LABEL[group.kind]}
          </span>
          {showFlight && group.flight && (
            <span className="font-mono text-sm bg-bourbon-amber/10 text-bourbon-rust px-2 py-0.5 rounded-md">
              {group.flight}
            </span>
          )}
        </div>
        {showWindow && typeof firstTime === 'number' && typeof lastTime === 'number' && (
          <span className="text-xs text-stone-400">
            {formatMinutes(firstTime)} - {formatMinutes(lastTime)}
          </span>
        )}
      </div>
      <div className="divide-y divide-stone-100">
        {group.travelers.map((traveler) => (
          <TravelerRow
            key={`${group.key}:${traveler.userId}:${traveler.flight}`}
            traveler={traveler}
            isCurrentUser={traveler.userId === currentUserId}
          />
        ))}
      </div>
    </div>
  )
}

function TravelerRow({ traveler, isCurrentUser }: { traveler: FlightLeg; isCurrentUser: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0">
      <span className="flex items-center gap-2 text-sm font-medium text-stone-800">
        {traveler.userName}
        {isCurrentUser && (
          <span className="text-[10px] uppercase tracking-wide bg-bourbon-amber/10 text-bourbon-rust px-1.5 py-0.5 rounded">
            You
          </span>
        )}
      </span>
      <span className="flex items-center gap-2 text-xs text-stone-500">
        {traveler.time && <span>{formatFlightDisplayTime(traveler.time)}</span>}
        {traveler.flight && <span className="font-mono text-stone-400">{traveler.flight}</span>}
      </span>
    </div>
  )
}
