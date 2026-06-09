'use client'

import { useState } from 'react'
import { AppSettings, COMMITTEE_ROLES } from '@/types/index'

interface Preference {
  user_id: string
  team_preference: string
  committee_rank_1: string
  committee_rank_2: string
  committee_rank_3: string
  submitted_at: string
  users: { name: string; email: string }
}

interface PackageReq {
  id: string
  status: string
  created_at: string
  requester: { name: string }
  requestee: { name: string }
}

interface RankingRow {
  rank: number
  season_label: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  users: any
}

interface UserRow {
  id: string
  name: string
  team: string | null
  committee: string | null
  is_captain: boolean
  avatar_url?: string | null
}

interface Props {
  preferences: Preference[]
  packageRequests: PackageReq[]
  rankings: RankingRow[]
  allUsers: UserRow[]
  settings: AppSettings | null
}

type Tab = 'submissions' | 'packages' | 'rankings' | 'teams' | 'photos'

export default function AdminClient({ preferences, packageRequests, rankings, allUsers, settings }: Props) {
  const [tab, setTab] = useState<Tab>('submissions')
  const [rankedList, setRankedList] = useState(rankings)
  const [seasonLabel, setSeasonLabel] = useState(rankings[0]?.season_label ?? 'Pre-Season')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [teamsRevealed, setTeamsRevealed] = useState(settings?.teams_revealed ?? false)
  const [teamAssignments, setTeamAssignments] = useState<Record<string, string>>(
    Object.fromEntries(allUsers.map((u) => [u.id, u.team ?? '']))
  )
  const [committeeAssignments, setCommitteeAssignments] = useState<Record<string, string>>(
    Object.fromEntries(allUsers.map((u) => [u.id, u.committee ?? '']))
  )
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [avatarUrls, setAvatarUrls] = useState<Record<string, string>>(
    Object.fromEntries(allUsers.filter(u => u.avatar_url).map(u => [u.id, u.avatar_url!]))
  )
  const [savingTeams, setSavingTeams] = useState(false)
  const [teamsSaved, setTeamsSaved] = useState(false)

  const moveRank = (idx: number, dir: -1 | 1) => {
    const next = [...rankedList]
    const swap = idx + dir
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]]
    next.forEach((r, i) => (r.rank = i + 1))
    setRankedList(next)
    setSaved(false)
  }

  const saveRankings = async () => {
    setSaving(true)
    setSaved(false)
    await fetch('/api/rankings/updateRankings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rankings: rankedList.map((r) => ({ user_id: (Array.isArray(r.users) ? r.users[0] : r.users)?.id, rank: r.rank })),
        season_label: seasonLabel,
      }),
    })
    setSaving(false)
    setSaved(true)
  }

  const uploadPhoto = async (userId: string, file: File) => {
    setUploadingId(userId)
    const form = new FormData()
    form.append('file', file)
    form.append('userId', userId)
    const res = await fetch('/api/users/uploadAvatar', { method: 'POST', body: form })
    if (res.ok) {
      const { url } = await res.json()
      setAvatarUrls(prev => ({ ...prev, [userId]: url }))
    }
    setUploadingId(null)
  }

  const toggleTeamsRevealed = async () => {
    const next = !teamsRevealed
    setTeamsRevealed(next)
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teams_revealed: next }),
    })
  }

  const saveTeams = async () => {
    setSavingTeams(true)
    setTeamsSaved(false)
    await Promise.all(
      allUsers.filter((u) => !u.is_captain).map((u) =>
        fetch('/api/users/updateUser', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: u.id,
            team: teamAssignments[u.id] || null,
            committee: committeeAssignments[u.id] || null,
          }),
        })
      )
    )
    setSavingTeams(false)
    setTeamsSaved(true)
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'submissions', label: 'Submissions' },
    { key: 'packages', label: 'Packages' },
    { key: 'rankings', label: 'Rankings' },
    { key: 'teams', label: 'Teams' },
    { key: 'photos', label: 'Photos' },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div>
        <p className="text-bourbon-amber text-xs font-semibold uppercase tracking-widest mb-1">Captains only</p>
        <h1 className="font-serif text-3xl font-bold text-bourbon-dark">Admin</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-stone-100 p-1 rounded-xl">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 text-sm font-medium py-1.5 rounded-lg transition-colors ${
              tab === t.key ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Submissions */}
      {tab === 'submissions' && (
        <div className="space-y-3">
          <p className="text-sm text-stone-500">{preferences.length} of 16 submitted</p>
          {preferences.length === 0 ? (
            <p className="text-stone-400 text-sm">No submissions yet.</p>
          ) : (
            <div className="space-y-2">
              {preferences.map((p) => (
                <div key={p.user_id} className="bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm">
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-stone-800">{p.users.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      p.team_preference === 'lin' ? 'bg-red-100 text-red-700'
                      : p.team_preference === 'ditty' ? 'bg-blue-100 text-blue-700'
                      : p.team_preference === 'none' ? 'bg-stone-100 text-stone-500'
                      : 'bg-yellow-50 text-yellow-600'
                    }`}>
                      {p.team_preference === 'lin' ? 'Team Lin'
                        : p.team_preference === 'ditty' ? 'Team Ditty'
                        : p.team_preference === 'none' ? 'No pref'
                        : 'Cleared'}
                    </span>
                  </div>
                  <p className="text-stone-400 text-xs mt-1">
                    {p.committee_rank_1
                      ? `${p.committee_rank_1} · ${p.committee_rank_2} · ${p.committee_rank_3}`
                      : 'No committee ranking'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Packages */}
      {tab === 'packages' && (() => {
        const groups = packageRequests.reduce<Map<string, PackageReq[]>>((acc, p) => {
          const key = p.requester.name
          if (!acc.has(key)) acc.set(key, [])
          acc.get(key)!.push(p)
          return acc
        }, new Map())

        return (
          <div className="space-y-3">
            {groups.size === 0 ? (
              <p className="text-stone-400 text-sm">No package requests yet.</p>
            ) : (
              [...groups.entries()].map(([requesterName, reqs]) => (
                <div key={requesterName} className="bg-white border border-stone-200 rounded-xl overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-stone-100 bg-stone-50">
                    <p className="text-sm font-semibold text-stone-800">{requesterName}</p>
                    <p className="text-xs text-stone-400">{reqs.length} {reqs.length === 1 ? 'request' : 'requests'}</p>
                  </div>
                  <div className="divide-y divide-stone-100">
                    {reqs.map((p) => (
                      <div key={p.id} className="flex items-center justify-between px-4 py-2.5">
                        <span className="text-sm text-stone-700">{p.requestee.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          p.status === 'accepted' ? 'bg-green-100 text-green-700'
                          : p.status === 'declined' ? 'bg-stone-100 text-stone-500'
                          : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )
      })()}

      {/* Rankings */}
      {tab === 'rankings' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <label className="text-sm text-stone-600 shrink-0">Season label</label>
            <input
              type="text"
              value={seasonLabel}
              onChange={(e) => setSeasonLabel(e.target.value)}
              className="border border-stone-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-bourbon-amber/40"
            />
          </div>
          {rankedList.length === 0 ? (
            <p className="text-stone-400 text-sm">No rankings yet — seed users first.</p>
          ) : (
            <ol className="space-y-1.5">
              {rankedList.map((r, idx) => (
                <li key={r.users.id} className="flex items-center gap-2 bg-white border border-stone-200 rounded-xl px-3 py-2">
                  <span className="text-xs text-stone-400 w-5 text-right shrink-0">{r.rank}</span>
                  <span className="flex-1 text-sm font-medium text-stone-800">{(Array.isArray(r.users) ? r.users[0] : r.users)?.name}</span>
                  <div className="flex gap-1">
                    <button onClick={() => moveRank(idx, -1)} disabled={idx === 0} className="p-1 text-stone-400 hover:text-stone-600 disabled:opacity-20">▲</button>
                    <button onClick={() => moveRank(idx, 1)} disabled={idx === rankedList.length - 1} className="p-1 text-stone-400 hover:text-stone-600 disabled:opacity-20">▼</button>
                  </div>
                </li>
              ))}
            </ol>
          )}
          {saved && <p className="text-green-600 text-sm">✓ Rankings saved</p>}
          <button
            onClick={saveRankings}
            disabled={saving}
            className="w-full bg-bourbon-amber hover:bg-bourbon-rust disabled:opacity-40 text-white font-medium py-2.5 rounded-xl text-sm transition-colors"
          >
            {saving ? 'Saving…' : 'Save rankings'}
          </button>
        </div>
      )}

      {/* Teams */}
      {tab === 'teams' && (
        <div className="space-y-5">
          {/* Reveal toggle */}
          <div className="bg-white border border-stone-200 rounded-xl px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-stone-800">Teams revealed</p>
              <p className="text-xs text-stone-400">Shows team badges on Roster and enables team filter on Spin Wheel</p>
            </div>
            <button
              onClick={toggleTeamsRevealed}
              className={`relative w-11 h-6 rounded-full transition-colors ${teamsRevealed ? 'bg-green-500' : 'bg-stone-300'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${teamsRevealed ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Team + committee assignment */}
          <div>
            <p className="text-sm font-medium text-stone-700 mb-3">Assign teams &amp; committees</p>
            <div className="space-y-1.5">
              {allUsers.filter((u) => !u.is_captain).map((u) => (
                <div key={u.id} className="bg-white border border-stone-200 rounded-xl px-3 py-2 space-y-1.5">
                  <span className="block text-sm font-medium text-stone-800">{u.name}</span>
                  <div className="grid grid-cols-2 gap-2">
                  <select
                    value={teamAssignments[u.id] ?? ''}
                    onChange={(e) => setTeamAssignments((prev) => ({ ...prev, [u.id]: e.target.value }))}
                    className="w-full border border-stone-300 rounded-lg px-2 py-1 text-xs focus:outline-none bg-white"
                  >
                    <option value="">No team</option>
                    <option value="lin">Team Lin</option>
                    <option value="ditty">Team Ditty</option>
                  </select>
                  <select
                    value={committeeAssignments[u.id] ?? ''}
                    onChange={(e) => setCommitteeAssignments((prev) => ({ ...prev, [u.id]: e.target.value }))}
                    className="w-full border border-stone-300 rounded-lg px-2 py-1 text-xs focus:outline-none bg-white"
                  >
                    <option value="">No committee</option>
                    {COMMITTEE_ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {teamsSaved && <p className="text-green-600 text-sm">✓ Teams saved</p>}
          <button
            onClick={saveTeams}
            disabled={savingTeams}
            className="w-full bg-bourbon-amber hover:bg-bourbon-rust disabled:opacity-40 text-white font-medium py-2.5 rounded-xl text-sm transition-colors"
          >
            {savingTeams ? 'Saving…' : 'Save team assignments'}
          </button>
        </div>
      )}

      {/* Photos */}
      {tab === 'photos' && (
        <div className="space-y-2">
          <p className="text-sm text-stone-500">Upload a headshot for each player. Replaces any existing photo.</p>
          {allUsers.map((u) => (
            <div key={u.id} className="bg-white border border-stone-200 rounded-xl px-4 py-3 flex items-center gap-3">
              {/* Thumbnail */}
              <div className="w-12 h-16 rounded-lg bg-stone-100 overflow-hidden shrink-0 flex items-center justify-center">
                {avatarUrls[u.id] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrls[u.id]} alt={u.name} className="w-full h-full object-cover object-top" />
                ) : (
                  <span className="text-stone-400 text-xs font-semibold">{u.name.charAt(0)}</span>
                )}
              </div>

              <span className="flex-1 text-sm font-medium text-stone-800">{u.name}</span>

              {/* Upload button */}
              <label className={`cursor-pointer text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                uploadingId === u.id
                  ? 'bg-stone-100 text-stone-400 border-stone-200'
                  : 'bg-white text-bourbon-amber border-bourbon-amber hover:bg-bourbon-cream'
              }`}>
                {uploadingId === u.id ? 'Uploading…' : avatarUrls[u.id] ? 'Replace' : 'Upload'}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  disabled={uploadingId !== null}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) uploadPhoto(u.id, file)
                    e.target.value = ''
                  }}
                />
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
