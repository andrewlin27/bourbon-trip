'use client'

import { useState } from 'react'
import { PreferenceSubmission, COMMITTEE_ROLES, CommitteeRole, TeamPreference } from '@/types/index'

interface CreatedPackage {
  id: string
  status: 'pending' | 'accepted' | 'declined'
  requestee: { id: string; name: string } | { id: string; name: string }[]
}

interface Props {
  existingPreference: PreferenceSubmission | null
  nonCaptainUsers: { id: string; name: string }[]
  currentUserId: string
  onPackagesCreated?: (packages: CreatedPackage[]) => void
}

type ViewMode = 'form' | 'summary'

export default function PreferenceForm({ existingPreference, nonCaptainUsers, currentUserId, onPackagesCreated }: Props) {
  const [view, setView] = useState<ViewMode>(existingPreference ? 'summary' : 'form')
  const [teamPref, setTeamPref] = useState<TeamPreference>(existingPreference?.team_preference ?? '')
  const [selectedPartners, setSelectedPartners] = useState<string[]>([])
  const [ranks, setRanks] = useState<[CommitteeRole | '', CommitteeRole | '', CommitteeRole | '']>([
    (existingPreference?.committee_rank_1 as CommitteeRole) ?? '',
    (existingPreference?.committee_rank_2 as CommitteeRole) ?? '',
    (existingPreference?.committee_rank_3 as CommitteeRole) ?? '',
  ])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [pref, setPref] = useState(existingPreference)

  const togglePartner = (id: string) => {
    setSelectedPartners((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  const usedRoles = ranks.filter(Boolean) as CommitteeRole[]
  const availableFor = (idx: number) =>
    COMMITTEE_ROLES.filter((r) => !usedRoles.includes(r) || ranks[idx] === r)

  const ranksValid =
    ranks.every((r) => r === '') ||
    (ranks.every((r) => r !== '') && new Set(ranks).size === 3)

  const valid = ranksValid

  const handleSubmit = async () => {
    if (!valid) return
    setSaving(true)
    setError('')
    try {
      const [prefRes, pkgRes] = await Promise.all([
        fetch('/api/preferences/upsertPreference', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            team_preference: teamPref,
            committee_rank_1: ranks[0],
            committee_rank_2: ranks[1],
            committee_rank_3: ranks[2],
          }),
        }),
        selectedPartners.length > 0
          ? fetch('/api/packages/createPackage', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ requestee_ids: selectedPartners }),
            })
          : Promise.resolve({ ok: true }),
      ])

      if (!prefRes.ok) throw new Error('Failed to save preference')

      if (pkgRes && 'json' in pkgRes && pkgRes.ok && onPackagesCreated) {
        const pkgData = await (pkgRes as Response).json()
        if (pkgData.packages?.length) onPackagesCreated(pkgData.packages)
      }

      const saved: PreferenceSubmission = {
        user_id: currentUserId,
        team_preference: teamPref,
        committee_rank_1: ranks[0] as CommitteeRole,
        committee_rank_2: ranks[1] as CommitteeRole,
        committee_rank_3: ranks[2] as CommitteeRole,
        submitted_at: pref?.submitted_at ?? new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setPref(saved)
      setView('summary')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  if (view === 'summary' && pref) {
    const teamLabel =
      pref.team_preference === 'lin' ? 'Team Lin' :
      pref.team_preference === 'ditty' ? 'Team Ditty' :
      pref.team_preference === 'none' ? 'No Preference' : null
    return (
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
          ✓ Preference submitted
        </div>
        <div className="space-y-2 text-sm text-stone-700">
          <div className="flex justify-between">
            <span className="text-stone-500">Team preference</span>
            {teamLabel
              ? <span className="font-medium">{teamLabel}</span>
              : <span className="text-stone-400 italic">Not submitted</span>
            }
          </div>
          {pref.committee_rank_1 ? (
            <>
              <div className="flex justify-between">
                <span className="text-stone-500">Committee rank 1</span>
                <span className="font-medium">{pref.committee_rank_1}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Committee rank 2</span>
                <span className="font-medium">{pref.committee_rank_2}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Committee rank 3</span>
                <span className="font-medium">{pref.committee_rank_3}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between">
              <span className="text-stone-500">Committee ranking</span>
              <span className="text-stone-400 italic">Not submitted</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setView('form')}
          className="text-sm text-bourbon-amber underline underline-offset-2"
        >
          Edit submission
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Team preference */}
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <label className="block text-sm font-medium text-stone-700">
            Team preference
          </label>
          {teamPref !== '' && (
            <button
              type="button"
              onClick={() => setTeamPref('')}
              className="text-xs text-stone-400 hover:text-stone-600 underline underline-offset-2"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {(['lin', 'ditty', 'none'] as const).map((opt) => {
            const label = opt === 'lin' ? 'Team Lin' : opt === 'ditty' ? 'Team Ditty' : 'No preference'
            const active =
              opt === 'lin'
                ? 'bg-team-lin text-white border-team-lin'
                : opt === 'ditty'
                ? 'bg-team-ditty text-white border-team-ditty'
                : 'bg-stone-700 text-white border-stone-700'
            return (
              <button
                key={opt}
                onClick={() => setTeamPref(teamPref === opt ? '' : opt)}
                className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${
                  teamPref === opt ? active : 'border-stone-300 text-stone-600 hover:border-stone-400'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Package request */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Package request <span className="text-stone-400 font-normal">(optional)</span>
        </label>
        <p className="text-xs text-stone-400 mb-3">
          Select friends you want on the same team — only one person in the group needs to submit this. They&apos;ll receive an invite to accept or decline.
        </p>
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
          {nonCaptainUsers.map((u) => (
            <label
              key={u.id}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-colors ${
                selectedPartners.includes(u.id)
                  ? 'bg-bourbon-cream border-bourbon-amber text-bourbon-dark'
                  : 'border-stone-200 text-stone-700 hover:border-stone-300'
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={selectedPartners.includes(u.id)}
                onChange={() => togglePartner(u.id)}
              />
              <span
                className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                  selectedPartners.includes(u.id)
                    ? 'bg-bourbon-amber border-bourbon-amber text-white'
                    : 'border-stone-300'
                }`}
              >
                {selectedPartners.includes(u.id) && (
                  <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="none">
                    <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              {u.name}
            </label>
          ))}
        </div>
      </div>

      {/* Committee ranking */}
      <div>
        <div className="flex items-baseline justify-between mb-1">
          <label className="block text-sm font-medium text-stone-700">
            Committee ranking
          </label>
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
        <p className="text-xs text-stone-400 mb-3">Rank your top 3 committee preferences.</p>
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
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={!valid || saving}
        className="w-full bg-bourbon-amber hover:bg-bourbon-rust disabled:opacity-40 text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
      >
        {saving ? 'Saving…' : pref ? 'Update submission' : 'Submit preference'}
      </button>
    </div>
  )
}
