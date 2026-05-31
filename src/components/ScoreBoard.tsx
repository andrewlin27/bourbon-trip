'use client'

import { useState, useEffect, useRef } from 'react'

interface Props {
  initialLin: number
  initialDitty: number
  canIncrement: boolean
}

export default function ScoreBoard({ initialLin, initialDitty, canIncrement }: Props) {
  const [lin, setLin] = useState(initialLin)
  const [ditty, setDitty] = useState(initialDitty)
  const [amount, setAmount] = useState(1)
  const [loading, setLoading] = useState<'lin' | 'ditty' | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchScores = async () => {
    const res = await fetch('/api/scores/getScores')
    if (!res.ok) return
    const data = await res.json()
    const l = data.find((s: { team: string; points: number }) => s.team === 'lin')
    const d = data.find((s: { team: string; points: number }) => s.team === 'ditty')
    if (l) setLin(l.points)
    if (d) setDitty(d.points)
  }

  useEffect(() => {
    intervalRef.current = setInterval(fetchScores, 10000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  const increment = async (team: 'lin' | 'ditty') => {
    setLoading(team)
    try {
      const res = await fetch('/api/scores/incrementScore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team, amount }),
      })
      if (res.ok) {
        const data = await res.json()
        if (team === 'lin') setLin(data.points)
        else setDitty(data.points)
      }
    } finally {
      setLoading(null)
    }
  }

  const leading = lin > ditty ? 'lin' : ditty > lin ? 'ditty' : null

  return (
    <div className="space-y-6">
      {/* Scoreboard */}
      <div className="grid grid-cols-2 gap-4">
        {/* Team Lin */}
        <div className={`rounded-2xl p-6 text-center space-y-1 border-2 transition-colors ${leading === 'lin' ? 'border-team-lin bg-blue-50' : 'border-stone-200 bg-white'}`}>
          <p className="text-xs font-semibold uppercase tracking-widest text-team-lin">Team Lin</p>
          <p className="font-serif text-6xl font-bold text-stone-900 tabular-nums">{lin}</p>
          {leading === 'lin' && <p className="text-xs text-team-lin font-medium">Leading</p>}
        </div>
        {/* Team Ditty */}
        <div className={`rounded-2xl p-6 text-center space-y-1 border-2 transition-colors ${leading === 'ditty' ? 'border-team-ditty bg-red-50' : 'border-stone-200 bg-white'}`}>
          <p className="text-xs font-semibold uppercase tracking-widest text-team-ditty">Team Ditty</p>
          <p className="font-serif text-6xl font-bold text-stone-900 tabular-nums">{ditty}</p>
          {leading === 'ditty' && <p className="text-xs text-team-ditty font-medium">Leading</p>}
        </div>
      </div>

      {leading === null && lin > 0 && (
        <p className="text-center text-stone-400 text-sm">Tied!</p>
      )}

      {/* Increment controls (captains & team leads only) */}
      {canIncrement && (
        <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3">
          <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">Add points</p>
          <div className="flex items-center gap-2">
            <label className="text-sm text-stone-600 shrink-0">Amount</label>
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-20 border border-stone-300 rounded-lg px-3 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-bourbon-amber/40"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => increment('lin')}
              disabled={loading !== null}
              className="bg-team-lin hover:opacity-90 disabled:opacity-40 text-white font-medium py-2.5 rounded-xl text-sm transition-opacity"
            >
              {loading === 'lin' ? '…' : `+${amount} Team Lin`}
            </button>
            <button
              onClick={() => increment('ditty')}
              disabled={loading !== null}
              className="bg-team-ditty hover:opacity-90 disabled:opacity-40 text-white font-medium py-2.5 rounded-xl text-sm transition-opacity"
            >
              {loading === 'ditty' ? '…' : `+${amount} Team Ditty`}
            </button>
          </div>
        </div>
      )}

      <p className="text-center text-xs text-stone-300">Updates every 10 seconds</p>
    </div>
  )
}
