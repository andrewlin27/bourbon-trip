import FlightCoordinationBoard from '@/components/FlightCoordinationBoard'
import { User } from '@/types/index'
import { createClientAnonKey } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

export default async function FlightsPage() {
  const supabase = await createClientAnonKey()
  const [{ data }, { data: authData }] = await Promise.all([
    supabase
      .from('users')
      .select('id, name, flight_arrival, flight_departure')
      .order('name'),
    supabase.auth.getUser(),
  ])

  const users = (data ?? []) as Pick<User, 'id' | 'name' | 'flight_arrival' | 'flight_departure'>[]
  const currentUserId = authData.user?.id ?? null

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <p className="text-bourbon-amber text-xs font-semibold uppercase tracking-widest mb-1">
          Travel Coordination
        </p>
        <h1 className="font-serif text-3xl font-bold text-bourbon-dark">
          Flight Groups
        </h1>
        <p className="text-stone-400 text-sm mt-1">
          Same flights and nearby arrival or departure times.
        </p>
      </div>
      <FlightCoordinationBoard users={users} currentUserId={currentUserId} />
    </div>
  )
}
