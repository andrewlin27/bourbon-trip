'use client'

import { useState } from 'react'
import { PreferenceSubmission, COMMITTEE_ROLES, CommitteeRole } from '@/types/index'
import Spinner from './Spinner'

interface Props {
  existingPreference: PreferenceSubmission | null
}

export default function CommitteeRankingForm({ existingPreference }: Props) {
  const hasRanks = !!(existingPreference?.committee_rank_1)
  const [view, setView] = useState<'form' | 'summary'>(hasRanks ? 'summary' : 'form')
  const [ranks, setRanks] = useState<[CommitteeRole | '', CommitteeRole | '', CommitteeRole | '']>([
    (existingPreference?.committee_rank_1 as CommitteeRole) ?? '',
    (existingPreference?.committee_rank_2 as CommitteeRole) ?? '',
    (existingPreference?.committee_rank_3 as CommitteeRole) ?? '',
  ])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [savedRanks, setSavedRanks] = useState(ranks)

  const usedRoles = ranks.filter(Boolean) as CommitteeRole[]
  const availableFor = (idx: number) =>
    COMMITTEE_ROLES.filter((r) => !usedRoles.includes(r) || ranks[idx] === r)

  const valid =
    ranks.every((r) => r === '') ||
    (ranks.every((r) => r !== '') && new Set(ranks).size === 3)

  const handleSubmit = async () => {
    if (!valid) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/preferences/upsertPreference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          committee_rank_1: ranks[0],
          committee_rank_2: ranks[1],
          committee_rank_3: ranks[2],
        }),
      })
      if (!res.ok) throw new Error('Failed to save ranking')
      setSavedRanks(ranks)
      setView('summary')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  if (view === 'summary') {
    return (
      <div className="space-y-3">
        {savedRanks[0] ? (
          <>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
              ✓ Submitted
            </div>
            <div className="space-y-2 text-sm">
              {savedRanks.map((r, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-stone-500">#{i + 1} pick</span>
                  <span className="font-medium">{r}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-sm text-stone-400 italic">No ranking submitted.</div>
        )}
        <button onClick={() => setView('form')} className="text-sm text-bourbon-amber underline underline-offset-2">
          Edit
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <p className="text-xs text-stone-400">
          Rank your top 3 committee preferences.{' '}
          <a href="/help" className="underline underline-offset-2 hover:text-stone-600">
            See descriptions on the Help page.
          </a>
        </p>
        {ranks.some(Boolean) && (
          <button
            type="button"
            onClick={() => setRanks(['', '', ''])}
            className="text-xs text-stone-400 hover:text-stone-600 underline underline-offset-2"
          >
            Clear
          </button>
        )}
      </div>
      <div className="space-y-2">
        {([0, 1, 2] as const).map((idx) => (
          <div key={idx} className="flex items-center gap-3">
            <span className="text-xs text-stone-400 w-12 shrink-0">#{idx + 1} pick</span>
            <select
              value={ranks[idx]}
              onChange={(e) => {
                const next = [...ranks] as typeof ranks
                next[idx] = e.target.value as CommitteeRole | ''
                setRanks(next)
              }}
              className="flex-1 border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-bourbon-amber/40 bg-white"
            >
              <option value="">Select a committee…</option>
              {availableFor(idx).map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={!valid || saving}
        className="w-full bg-bourbon-amber hover:bg-bourbon-rust disabled:opacity-40 text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
      >
        {saving ? <span className="flex items-center justify-center gap-2"><Spinner className="w-4 h-4" />Saving…</span> : hasRanks ? 'Update' : 'Submit'}
      </button>
    </div>
  )
}
