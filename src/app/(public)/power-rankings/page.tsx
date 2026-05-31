import { createClientAnonKey } from '@/utils/supabase/server'

export const revalidate = 60

export default async function PowerRankingsPage() {
  const supabase = await createClientAnonKey()
  const { data } = await supabase
    .from('power_rankings')
    .select('rank, season_label, users(id, name, avatar_url)')
    .order('rank')

  const rankings = data ?? []
  const seasonLabel = rankings[0]?.season_label ?? 'Pre-Season'

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="mb-6">
        <p className="text-bourbon-amber text-xs font-semibold uppercase tracking-widest mb-1">
          {seasonLabel}
        </p>
        <h1 className="font-serif text-3xl font-bold text-bourbon-dark">Power Rankings</h1>
        <p className="text-stone-400 text-sm mt-1">Determined by the captains</p>
      </div>

      {rankings.length === 0 ? (
        <p className="text-stone-400 text-sm">Rankings coming soon.</p>
      ) : (
        <ol className="space-y-2">
          {rankings.map((entry) => {
            const rank = entry.rank as number
            // Supabase returns joined row as object (many-to-one)
            const user = (Array.isArray(entry.users) ? entry.users[0] : entry.users) as { id: string; name: string; avatar_url: string | null } | null
            const medal =
              rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null
            return (
              <li
                key={rank}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                  rank <= 3
                    ? 'bg-bourbon-cream border-bourbon-amber/30'
                    : 'bg-white border-stone-200'
                }`}
              >
                <span className="w-7 text-center shrink-0">
                  {medal ? (
                    <span className="text-xl">{medal}</span>
                  ) : (
                    <span className="text-sm font-bold text-stone-400">{rank}</span>
                  )}
                </span>
                <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center shrink-0">
                  <span className="text-stone-500 text-sm font-semibold">
                    {user?.name?.charAt(0) ?? '?'}
                  </span>
                </div>
                <span className={`font-medium text-sm ${rank <= 3 ? 'text-bourbon-dark' : 'text-stone-800'}`}>
                  {user?.name ?? 'Unknown'}
                </span>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
