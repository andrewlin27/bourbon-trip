'use client'

import { useState } from 'react'
import { PreferenceSubmission, TeamPreference } from '@/types/index'

interface CreatedPackage {
  id: string
  status: 'pending' | 'accepted' | 'declined'
  requestee: { id: string; name: string } | { id: string; name: string }[]
}

interface OutgoingPackage {
  id: string
  status: 'pending' | 'accepted' | 'declined'
  requestee: { id: string; name: string } | { id: string; name: string }[]
}

interface Props {
  existingPreference: PreferenceSubmission | null
  nonCaptainUsers: { id: string; name: string }[]
  currentUserId: string
  acceptedGroup?: boolean
  acceptedGroupRequesterName?: string | null
  outgoingPackages?: OutgoingPackage[]
  onPackagesCreated?: (packages: CreatedPackage[]) => void
}

function requesteeName(r: OutgoingPackage['requestee']): string {
  return Array.isArray(r) ? r.map((x) => x.name).join(', ') : r.name
}

export default function TeamPreferenceForm({ existingPreference, nonCaptainUsers, currentUserId, acceptedGroup, acceptedGroupRequesterName, outgoingPackages = [], onPackagesCreated }: Props) {
  const [view, setView] = useState<'form' | 'summary'>(existingPreference ? 'summary' : 'form')
  const [teamPref, setTeamPref] = useState<TeamPreference>(existingPreference?.team_preference ?? '')
  const [selectedPartners, setSelectedPartners] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [savedPref, setSavedPref] = useState<TeamPreference | null>(existingPreference?.team_preference ?? null)

  const togglePartner = (id: string) =>
    setSelectedPartners((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id])

  const handleSubmit = async () => {
    setSaving(true)
    setError('')
    try {
      const [prefRes, pkgRes] = await Promise.all([
        fetch('/api/preferences/upsertPreference', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ team_preference: teamPref }),
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

      setSavedPref(teamPref)
      setSelectedPartners([])
      setView('summary')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  if (view === 'summary') {
    const teamLabel =
      savedPref === 'lin' ? 'Team Lin' :
      savedPref === 'ditty' ? 'Team Ditty' :
      savedPref === 'none' ? 'No Preference' : null
    return (
      <div className="space-y-3">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
          ✓ Submitted
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-stone-500">Team preference</span>
          {teamLabel
            ? <span className="font-medium">{teamLabel}</span>
            : <span className="text-stone-400 italic">No preference submitted</span>
          }
        </div>
        {outgoingPackages.length > 0 ? (
          <div className="flex justify-between text-sm gap-4">
            <span className="text-stone-500 shrink-0">Package requests</span>
            <div className="space-y-0.5 text-right">
              {outgoingPackages.map((pkg) => {
                const statusColor =
                  pkg.status === 'accepted' ? 'text-green-600' :
                  pkg.status === 'declined' ? 'text-stone-400' :
                  'text-amber-600'
                const statusLabel =
                  pkg.status === 'accepted' ? 'Accepted' :
                  pkg.status === 'declined' ? 'Declined' :
                  'Pending'
                return (
                  <div key={pkg.id} className="flex gap-3 justify-end">
                    <span className="font-medium">{requesteeName(pkg.requestee)}</span>
                    <span className={`font-medium w-14 text-right ${statusColor}`}>{statusLabel}</span>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="flex justify-between text-sm">
            <span className="text-stone-500">Package requests</span>
            {acceptedGroup ? (
              <span className="font-medium">Joined {acceptedGroupRequesterName ? `${acceptedGroupRequesterName}'s` : 'a'} group</span>
            ) : (
              <span className="text-stone-400 italic">None</span>
            )}
          </div>
        )}
        <button onClick={() => setView('form')} className="text-sm text-bourbon-amber underline underline-offset-2">
          Edit
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Team preference */}
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <label className="block text-sm font-medium text-stone-700">Team preference</label>
          {teamPref !== '' && (
            <button type="button" onClick={() => setTeamPref('')} className="text-xs text-stone-400 hover:text-stone-600 underline underline-offset-2">
              Clear
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {(['lin', 'ditty', 'none'] as const).map((opt) => {
            const label = opt === 'lin' ? 'Team Lin' : opt === 'ditty' ? 'Team Ditty' : 'No preference'
            const active =
              opt === 'lin' ? 'bg-team-lin text-white border-team-lin' :
              opt === 'ditty' ? 'bg-team-ditty text-white border-team-ditty' :
              'bg-stone-700 text-white border-stone-700'
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
        {acceptedGroup ? (
          <p className="text-xs text-stone-400 italic">
            You&apos;ve already joined a group — you can&apos;t send new package requests.
          </p>
        ) : (
          <>
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
          </>
        )}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={saving}
        className="w-full bg-bourbon-amber hover:bg-bourbon-rust disabled:opacity-40 text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
      >
        {saving ? 'Saving…' : existingPreference ? 'Update' : 'Submit'}
      </button>
    </div>
  )
}
