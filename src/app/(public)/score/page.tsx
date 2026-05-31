import { createClientAnonKey } from '@/utils/supabase/server'
import ScoreBoard from '@/components/ScoreBoard'

export default async function ScorePage() {
  const supabase = await createClientAnonKey()
  const { data: { user } } = await supabase.auth.getUser()

  const [scoresRes, userRes] = await Promise.all([
    supabase.from('scores').select('*').order('team'),
    user
      ? supabase.from('users').select('is_captain, is_team_lead').eq('id', user.id).single()
      : Promise.resolve({ data: null }),
  ])

  const canIncrement = !!(userRes.data?.is_captain || userRes.data?.is_team_lead)
  const scores = scoresRes.data ?? []

  const lin = scores.find((s) => s.team === 'lin')
  const ditty = scores.find((s) => s.team === 'ditty')

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="mb-8">
        <p className="text-bourbon-amber text-xs font-semibold uppercase tracking-widest mb-1">Live</p>
        <h1 className="font-serif text-3xl font-bold text-bourbon-dark">Score</h1>
      </div>
      <ScoreBoard
        initialLin={lin?.points ?? 0}
        initialDitty={ditty?.points ?? 0}
        canIncrement={canIncrement}
      />
    </div>
  )
}
