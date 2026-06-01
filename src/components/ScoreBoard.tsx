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
  const [linDelta, setLinDelta] = useState(0)
  const [dittyDelta, setDittyDelta] = useState(0)
  const [saving, setSaving] = useState(false)
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

  const applyDelta = async (team: 'lin' | 'ditty', delta: number) => {
    if (delta === 0) return
    await fetch('/api/scores/incrementScore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ team, amount: delta }),
    })
  }

  const handleSave = async () => {
    if (linDelta === 0 && dittyDelta === 0) return
    setSaving(true)
    await Promise.all([
      applyDelta('lin', linDelta),
      applyDelta('ditty', dittyDelta),
    ])
    setLin((v) => v + linDelta)
    setDitty((v) => v + dittyDelta)
    setLinDelta(0)
    setDittyDelta(0)
    setSaving(false)
  }

  const hasPending = linDelta !== 0 || dittyDelta !== 0
  const leading = lin > ditty ? 'lin' : ditty > lin ? 'ditty' : null

  const DeltaControl = ({
    team, delta, setDelta, color,
  }: { team: string; delta: number; setDelta: (v: number) => void; color: string }) => (
    <div className="flex flex-col items-center gap-2">
      <p className={`text-xs font-semibold uppercase tracking-widest ${color}`}>{team}</p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setDelta(delta - 1)}
          className="w-9 h-9 rounded-full border-2 border-stone-300 text-stone-600 hover:border-stone-400 text-lg font-bold flex items-center justify-center transition-colors"
        >
          −
        </button>
        <span className={`w-8 text-center text-lg font-bold tabular-nums ${delta > 0 ? 'text-green-600' : delta < 0 ? 'text-red-500' : 'text-stone-300'}`}>
          {delta > 0 ? `+${delta}` : delta}
        </span>
        <button
          onClick={() => setDelta(delta + 1)}
          className="w-9 h-9 rounded-full border-2 border-stone-300 text-stone-600 hover:border-stone-400 text-lg font-bold flex items-center justify-center transition-colors"
        >
          +
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Scoreboard */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`rounded-2xl p-6 text-center space-y-1 border-2 transition-colors ${leading === 'lin' ? 'border-team-lin bg-blue-50' : 'border-stone-200 bg-white'}`}>
          <p className="text-xs font-semibold uppercase tracking-widest text-team-lin">Team Lin</p>
          <p className="font-serif text-6xl font-bold text-stone-900 tabular-nums">{lin}</p>
          {leading === 'lin' && <p className="text-xs text-team-lin font-medium">Leading</p>}
        </div>
        <div className={`rounded-2xl p-6 text-center space-y-1 border-2 transition-colors ${leading === 'ditty' ? 'border-team-ditty bg-red-50' : 'border-stone-200 bg-white'}`}>
          <p className="text-xs font-semibold uppercase tracking-widest text-team-ditty">Team Ditty</p>
          <p className="font-serif text-6xl font-bold text-stone-900 tabular-nums">{ditty}</p>
          {leading === 'ditty' && <p className="text-xs text-team-ditty font-medium">Leading</p>}
        </div>
      </div>

      {leading === null && lin > 0 && (
        <p className="text-center text-stone-400 text-sm">Tied!</p>
      )}

      {/* Edit controls (captains & team leads only) */}
      {canIncrement && (
        <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-4">
          <p className="text-xs font-medium text-stone-500 uppercase tracking-wide text-center">Adjust scores</p>
          <div className="grid grid-cols-2 gap-6">
            <DeltaControl team="Team Lin" delta={linDelta} setDelta={setLinDelta} color="text-team-lin" />
            <DeltaControl team="Team Ditty" delta={dittyDelta} setDelta={setDittyDelta} color="text-team-ditty" />
          </div>
          <button
            onClick={handleSave}
            disabled={!hasPending || saving}
            className="w-full bg-bourbon-amber hover:bg-bourbon-rust disabled:opacity-40 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      )}

      <p className="text-center text-xs text-stone-300">Updates every 10 seconds</p>
    </div>
  )
}
