import { User } from '@/types/index'

export type FlightKind = 'arrival' | 'departure'

export interface ParsedFlight {
  airport: string
  time: string
  flight: string
  minutes: number | null
}

export interface FlightLeg extends ParsedFlight {
  kind: FlightKind
  userId: string
  userName: string
}

export interface FlightGroup {
  key: string
  kind: FlightKind
  airport: string
  flight?: string
  travelers: FlightLeg[]
}

export interface FlightMatches {
  sameFlights: FlightGroup[]
  closeAirportWindows: FlightGroup[]
  airportGroups: FlightGroup[]
}

export interface PersonalizedFlightMatches extends FlightMatches {
  currentUserLegs: FlightLeg[]
}

const AIRPORT_RE = /^[A-Z]{3}$/
const FLIGHT_RE = /^[A-Z0-9]{2,4}\d{1,4}[A-Z]?$/i
const TIME_RE = /^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i

export function parseFlightValue(value: string | null | undefined): ParsedFlight {
  const tokens = (value ?? '').trim().split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return { airport: '', time: '', flight: '', minutes: null }

  let airport = ''
  let flight = ''

  if (AIRPORT_RE.test(tokens[0].toUpperCase())) {
    airport = tokens.shift()!.toUpperCase()
  }

  if (tokens.length > 1 && FLIGHT_RE.test(tokens[tokens.length - 1])) {
    flight = tokens.pop()!.toUpperCase()
  }

  const time = tokens.join(' ')

  return {
    airport,
    time,
    flight,
    minutes: parseTimeToMinutes(time),
  }
}

export function combineFlightValue(airport: string, time: string, flight: string): string {
  return [airport.trim().toUpperCase(), time.trim(), flight.trim().toUpperCase()]
    .filter(Boolean)
    .join(' ')
}

export function parseTimeToMinutes(value: string): number | null {
  const compact = value.trim().toLowerCase().replace(/\s+/g, '')
  if (!compact) return null

  const match = compact.match(TIME_RE)
  if (!match) return null

  let hour = Number(match[1])
  const minute = match[2] ? Number(match[2]) : 0
  const meridiem = match[3]?.toLowerCase()

  if (minute > 59 || hour > 23) return null

  if (meridiem) {
    if (hour < 1 || hour > 12) return null
    if (meridiem === 'pm' && hour !== 12) hour += 12
    if (meridiem === 'am' && hour === 12) hour = 0
  }

  return hour * 60 + minute
}

export function formatMinutes(minutes: number): string {
  const hour24 = Math.floor(minutes / 60)
  const minute = minutes % 60
  const period = hour24 >= 12 ? 'PM' : 'AM'
  const hour12 = hour24 % 12 || 12
  return `${hour12}:${String(minute).padStart(2, '0')} ${period}`
}

export function getFlightLegs(users: Pick<User, 'id' | 'name' | 'flight_arrival' | 'flight_departure'>[]): FlightLeg[] {
  return users.flatMap((user) => {
    const arrival = parseFlightValue(user.flight_arrival)
    const departure = parseFlightValue(user.flight_departure)

    return [
      arrival.time || arrival.flight || arrival.airport
        ? { ...arrival, kind: 'arrival' as const, userId: user.id, userName: user.name }
        : null,
      departure.time || departure.flight || departure.airport
        ? { ...departure, kind: 'departure' as const, userId: user.id, userName: user.name }
        : null,
    ].filter((leg): leg is FlightLeg => leg !== null)
  })
}

export function buildFlightMatches(
  users: Pick<User, 'id' | 'name' | 'flight_arrival' | 'flight_departure'>[]
): FlightMatches {
  const legs = getFlightLegs(users)

  return {
    sameFlights: buildSameFlightGroups(legs),
    closeAirportWindows: buildCloseAirportWindows(legs),
    airportGroups: buildAirportGroups(legs),
  }
}

export function buildPersonalizedFlightMatches(
  users: Pick<User, 'id' | 'name' | 'flight_arrival' | 'flight_departure'>[],
  currentUserId: string | null
): PersonalizedFlightMatches {
  const legs = getFlightLegs(users)
  const currentUserLegs = currentUserId
    ? legs.filter((leg) => leg.userId === currentUserId)
    : []

  return {
    currentUserLegs,
    sameFlights: buildPersonalSameFlightGroups(legs, currentUserLegs),
    closeAirportWindows: buildPersonalCloseAirportWindows(legs, currentUserLegs),
    airportGroups: buildPersonalAirportGroups(legs, currentUserLegs),
  }
}

function buildSameFlightGroups(legs: FlightLeg[]): FlightGroup[] {
  const groups = new Map<string, FlightLeg[]>()

  for (const leg of legs) {
    if (!leg.flight) continue
    const key = `${leg.kind}:${leg.flight}`
    groups.set(key, [...(groups.get(key) ?? []), leg])
  }

  return [...groups.entries()]
    .filter(([, travelers]) => travelers.length > 1)
    .map(([key, travelers]) => ({
      key,
      kind: travelers[0].kind,
      airport: travelers[0].airport,
      flight: travelers[0].flight,
      travelers: sortTravelers(travelers),
    }))
    .sort(compareFlightGroups)
}

function buildPersonalSameFlightGroups(legs: FlightLeg[], currentUserLegs: FlightLeg[]): FlightGroup[] {
  return currentUserLegs
    .filter((currentLeg) => currentLeg.flight)
    .map((currentLeg) => {
      const travelers = legs.filter((leg) =>
        leg.userId !== currentLeg.userId &&
        leg.kind === currentLeg.kind &&
        leg.flight === currentLeg.flight
      )

      return {
        key: `mine:${currentLeg.kind}:flight:${currentLeg.flight}`,
        kind: currentLeg.kind,
        airport: currentLeg.airport,
        flight: currentLeg.flight,
        travelers: sortTravelers([currentLeg, ...travelers]),
      }
    })
    .filter((group) => group.travelers.length > 1)
    .sort(compareFlightGroups)
}

function buildAirportGroups(legs: FlightLeg[]): FlightGroup[] {
  const groups = new Map<string, FlightLeg[]>()

  for (const leg of legs) {
    if (!leg.airport) continue
    const key = `${leg.kind}:${leg.airport}`
    groups.set(key, [...(groups.get(key) ?? []), leg])
  }

  return [...groups.entries()]
    .filter(([, travelers]) => travelers.length > 1)
    .map(([key, travelers]) => ({
      key,
      kind: travelers[0].kind,
      airport: travelers[0].airport,
      travelers: sortTravelers(travelers),
    }))
    .sort(compareFlightGroups)
}

function buildPersonalAirportGroups(legs: FlightLeg[], currentUserLegs: FlightLeg[]): FlightGroup[] {
  return currentUserLegs
    .filter((currentLeg) => currentLeg.airport)
    .map((currentLeg) => {
      const travelers = legs.filter((leg) =>
        leg.userId !== currentLeg.userId &&
        leg.kind === currentLeg.kind &&
        leg.airport === currentLeg.airport
      )

      return {
        key: `mine:${currentLeg.kind}:airport:${currentLeg.airport}`,
        kind: currentLeg.kind,
        airport: currentLeg.airport,
        travelers: sortTravelers([currentLeg, ...travelers]),
      }
    })
    .filter((group) => group.travelers.length > 1)
    .sort(compareFlightGroups)
}

function buildCloseAirportWindows(legs: FlightLeg[]): FlightGroup[] {
  return buildAirportGroups(legs)
    .map((group) => ({
      ...group,
      travelers: sortTravelers(group.travelers.filter((leg) => leg.minutes !== null)),
    }))
    .flatMap((group) => {
      const windows: FlightGroup[] = []
      const used = new Set<string>()

      for (let i = 0; i < group.travelers.length; i += 1) {
        const base = group.travelers[i]
        if (base.minutes === null || used.has(base.userId)) continue

        const travelers = group.travelers.filter((leg) => {
          if (leg.minutes === null || used.has(leg.userId)) return false
          return Math.abs(leg.minutes - base.minutes!) <= 60
        })

        if (travelers.length > 1) {
          travelers.forEach((leg) => used.add(leg.userId))
          windows.push({
            key: `${group.key}:${base.minutes}`,
            kind: group.kind,
            airport: group.airport,
            travelers,
          })
        }
      }

      return windows
    })
    .sort(compareFlightGroups)
}

function buildPersonalCloseAirportWindows(legs: FlightLeg[], currentUserLegs: FlightLeg[]): FlightGroup[] {
  return currentUserLegs
    .filter((currentLeg) => currentLeg.airport && currentLeg.minutes !== null)
    .map((currentLeg) => {
      const travelers = legs.filter((leg) => {
        if (leg.userId === currentLeg.userId || leg.minutes === null || currentLeg.minutes === null) {
          return false
        }

        return leg.kind === currentLeg.kind &&
          leg.airport === currentLeg.airport &&
          Math.abs(leg.minutes - currentLeg.minutes) <= 60
      })

      return {
        key: `mine:${currentLeg.kind}:window:${currentLeg.airport}:${currentLeg.minutes}`,
        kind: currentLeg.kind,
        airport: currentLeg.airport,
        travelers: sortTravelers([currentLeg, ...travelers]),
      }
    })
    .filter((group) => group.travelers.length > 1)
    .sort(compareFlightGroups)
}

function compareFlightGroups(a: FlightGroup, b: FlightGroup): number {
  const kindOrder = compareKind(a.kind, b.kind)
  if (kindOrder !== 0) return kindOrder

  const timeOrder = getGroupStartMinutes(a) - getGroupStartMinutes(b)
  if (timeOrder !== 0) return timeOrder

  const airportOrder = a.airport.localeCompare(b.airport)
  if (airportOrder !== 0) return airportOrder

  return (a.flight ?? '').localeCompare(b.flight ?? '')
}

function compareKind(a: FlightKind, b: FlightKind): number {
  const order: Record<FlightKind, number> = { arrival: 0, departure: 1 }
  return order[a] - order[b]
}

function getGroupStartMinutes(group: FlightGroup): number {
  return group.travelers.find((traveler) => traveler.minutes !== null)?.minutes ?? Number.MAX_SAFE_INTEGER
}

function sortTravelers(travelers: FlightLeg[]): FlightLeg[] {
  return [...travelers].sort((a, b) => {
    if (a.minutes !== null && b.minutes !== null) return a.minutes - b.minutes
    if (a.minutes !== null) return -1
    if (b.minutes !== null) return 1
    return a.userName.localeCompare(b.userName)
  })
}
