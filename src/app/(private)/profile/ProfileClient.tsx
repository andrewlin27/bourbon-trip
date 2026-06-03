'use client'

import { useState } from 'react'
import { User, Profile, PreferenceSubmission, PackageRequest } from '@/types/index'
import TeamPreferenceForm from '@/components/TeamPreferenceForm'
import CommitteeRankingForm from '@/components/CommitteeRankingForm'
import PromptAnswerForm from '@/components/PromptAnswerForm'
import FlightTimesForm from '@/components/FlightTimesForm'
import PackageRequestCard from '@/components/PackageRequestCard'

interface PendingPackage extends PackageRequest {
  requester: { id: string; name: string }
  groupMembers: { id: string; name: string; status: string }[]
}

interface OutgoingPackage {
  id: string
  status: 'pending' | 'accepted' | 'declined'
  requestee: { id: string; name: string } | { id: string; name: string }[]
}

interface AcceptedGroup {
  requester: { id: string; name: string }
  members: { id: string; name: string; status: string }[]
}

interface Props {
  currentUser: User | null
  profile: Profile | null
  existingPreference: PreferenceSubmission | null
  pendingPackages: PendingPackage[]
  hasAcceptedGroup: boolean
  acceptedGroup: AcceptedGroup | null
  outgoingPackages: OutgoingPackage[]
  allUsers: { id: string; name: string; is_captain: boolean }[]
}

export default function ProfileClient({
  currentUser,
  profile,
  existingPreference,
  pendingPackages,
  hasAcceptedGroup,
  acceptedGroup: initialAcceptedGroup,
  outgoingPackages,
  allUsers,
}: Props) {
  const [packages, setPackages] = useState(pendingPackages)
  const [acceptedGroup, setAcceptedGroup] = useState(hasAcceptedGroup)
  const [shownAcceptedGroup, setShownAcceptedGroup] = useState(initialAcceptedGroup)
  const [acceptedGroupRequesterName, setAcceptedGroupRequesterName] = useState<string | null>(
    initialAcceptedGroup?.requester.name ?? null
  )
  const [outgoing, setOutgoing] = useState(outgoingPackages)
  const [confirmRescindId, setConfirmRescindId] = useState<string | null>(null)
  const [rescinding, setRescinding] = useState(false)
  const [previewForm, setPreviewForm] = useState(false)

  if (!currentUser) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center text-stone-500">
        Profile not found.
      </div>
    )
  }

  const handlePackageRespond = (id: string, status: 'accepted' | 'declined') => {
    if (status === 'accepted') {
      const pkg = packages.find((p) => p.id === id)
      if (pkg) {
        setAcceptedGroupRequesterName(pkg.requester.name)
        setShownAcceptedGroup({ requester: pkg.requester, members: pkg.groupMembers })
      }
      setAcceptedGroup(true)
      setOutgoing([])
    }
    setPackages((prev) => prev.filter((p) => p.id !== id))
  }

  const handlePackagesCreated = (created: OutgoingPackage[]) => {
    setOutgoing((prev) => {
      const existingIds = new Set(prev.map((p) => p.id))
      const newOnes = created.filter((p) => !existingIds.has(p.id))
      return [...prev, ...newOnes]
    })
  }

  const handleRescind = async () => {
    if (!confirmRescindId) return
    setRescinding(true)
    try {
      await fetch('/api/packages/rescindPackage', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: confirmRescindId }),
      })
      setOutgoing((prev) => prev.filter((p) => p.id !== confirmRescindId))
      setConfirmRescindId(null)
    } finally {
      setRescinding(false)
    }
  }

  const nonCaptains = allUsers.filter(
    (u) => !u.is_captain && u.id !== currentUser.id
  )

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-bourbon-amber text-xs font-semibold uppercase tracking-widest mb-1">
            My Profile
          </p>
          <h1 className="font-serif text-3xl font-bold text-bourbon-dark leading-tight">
            {currentUser.name}
          </h1>
          <p className="text-stone-400 text-sm mt-0.5 break-words">{currentUser.email}</p>
        </div>
        <form action="/api/auth/signout" method="POST" className="shrink-0 pt-1">
          <button
            type="submit"
            className="border border-stone-300 text-stone-500 hover:text-stone-700 hover:bg-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>

      {/* Pending package invites */}
      {packages.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold text-stone-700 text-sm uppercase tracking-wide">
            Pending Invites
          </h2>
          {packages.map((pkg) => (
            <PackageRequestCard
              key={pkg.id}
              request={pkg}
              groupMembers={pkg.groupMembers}
              alreadyInGroup={acceptedGroup || outgoing.some((p) => p.status === 'accepted')}
              onRespond={handlePackageRespond}
            />
          ))}
        </section>
      )}

      {/* Accepted group (group the user joined as a requestee) */}
      {shownAcceptedGroup && (
        <section className="space-y-3">
          <h2 className="font-semibold text-stone-700 text-sm uppercase tracking-wide">
            Group You Joined
          </h2>
          <div className="bg-white border border-stone-200 rounded-xl divide-y divide-stone-100">
            <div className="flex items-center justify-between px-4 py-3 gap-3">
              <span className="text-sm text-stone-800 flex-1">{shownAcceptedGroup.requester.name}</span>
              <span className="text-xs text-bourbon-amber font-medium">Requester</span>
            </div>
            {shownAcceptedGroup.members.map((m) => (
              <div key={m.id} className="flex items-center justify-between px-4 py-3 gap-3">
                <span className="text-sm text-stone-800 flex-1">{m.name}</span>
                <span className={`text-xs font-medium ${m.status === 'accepted' ? 'text-green-600' : 'text-amber-600'}`}>
                  {m.status === 'accepted' ? 'Accepted' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Outgoing package group */}
      {outgoing.length > 0 && (
        <section className="space-y-3">
          <div>
            <h2 className="font-semibold text-stone-700 text-sm uppercase tracking-wide">
              Your Package Group
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              These people will see each other in the group invite.
            </p>
          </div>
          <div className="bg-white border border-stone-200 rounded-xl divide-y divide-stone-100">
            {outgoing.map((pkg) => {
              const requestee = Array.isArray(pkg.requestee) ? pkg.requestee[0] : pkg.requestee
              const statusConfig = {
                pending:  { label: 'Pending',  classes: 'bg-amber-50 text-amber-700 border-amber-200' },
                accepted: { label: 'Accepted', classes: 'bg-green-50 text-green-700 border-green-200' },
                declined: { label: 'Declined', classes: 'bg-stone-100 text-stone-400 border-stone-200' },
              }[pkg.status]
              return (
                <div key={pkg.id} className="flex items-center justify-between px-4 py-3 gap-3">
                  <span className={`text-sm flex-1 ${pkg.status === 'declined' ? 'text-stone-400 line-through' : 'text-stone-800'}`}>
                    {requestee?.name ?? 'Unknown'}
                  </span>
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border shrink-0 ${statusConfig.classes}`}>
                    {statusConfig.label}
                  </span>
                  {pkg.status === 'pending' && (
                    <button
                      onClick={() => setConfirmRescindId(pkg.id)}
                      className="text-xs text-stone-400 hover:text-red-500 underline underline-offset-2 shrink-0"
                    >
                      Rescind
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Flight times */}
      <section className="bg-white rounded-xl border border-stone-200 p-5">
        <h2 className="font-semibold text-stone-800 mb-2">Flight Times</h2>
        <p className="text-stone-500 text-sm mb-4">
          Use the Kentucky-side airport for both legs: where you land Friday, and where you fly out Sunday.
        </p>
        <FlightTimesForm
          initialArrival={currentUser.flight_arrival ?? ''}
          initialDeparture={currentUser.flight_departure ?? ''}
        />
      </section>

      {/* Prompt answers */}
      <section className="bg-white rounded-xl border border-stone-200 p-5">
        <h2 className="font-semibold text-stone-800 mb-4">Player Card Prompts</h2>
        <p className="text-stone-500 text-sm mb-4">
          Choose 2 prompts — your answers will appear on the Roster page.
        </p>
        <PromptAnswerForm initialProfile={profile} />
      </section>

      {/* Team preference form (non-captains) */}
      {!currentUser.is_captain && (
        <section className="bg-white rounded-xl border border-stone-200 p-5">
          <h2 className="font-semibold text-stone-800 mb-1">Team Preference</h2>
          <p className="text-stone-500 text-sm mb-4">
            These answers are submitted to the captains — only they can see your full submission.
          </p>
          <TeamPreferenceForm
            existingPreference={existingPreference}
            nonCaptainUsers={nonCaptains}
            currentUserId={currentUser.id}
            acceptedGroup={acceptedGroup}
            outgoingPackages={outgoing}
            acceptedGroupRequesterName={acceptedGroup ? acceptedGroupRequesterName : null}
            onPackagesCreated={handlePackagesCreated}
          />
        </section>
      )}

      {/* Committee ranking (non-captains) */}
      {!currentUser.is_captain && (
        <section className="bg-white rounded-xl border border-stone-200 p-5">
          <h2 className="font-semibold text-stone-800 mb-1">Committee Ranking</h2>
          <p className="text-stone-500 text-sm mb-4">
            Rank your top 3 committee preferences — only the captains can see this.
          </p>
          <CommitteeRankingForm existingPreference={existingPreference} />
        </section>
      )}

      {/* Captain preview of the preference forms (testing only) */}
      {currentUser.is_captain && (
        <section className="border border-dashed border-stone-300 rounded-xl p-5">
          <button
            onClick={() => setPreviewForm((v) => !v)}
            className="w-full flex items-center justify-between text-sm text-stone-400 hover:text-stone-600"
          >
            <span>🔍 Preview preference forms <span className="text-xs">(captain testing only)</span></span>
            <span>{previewForm ? '▲' : '▼'}</span>
          </button>
          {previewForm && (
            <div className="mt-4 space-y-6">
              <TeamPreferenceForm
                existingPreference={existingPreference}
                nonCaptainUsers={nonCaptains}
                currentUserId={currentUser.id}
                acceptedGroup={acceptedGroup}
                outgoingPackages={outgoing}
                acceptedGroupRequesterName={acceptedGroup ? acceptedGroupRequesterName : null}
                onPackagesCreated={handlePackagesCreated}
              />
              <hr className="border-stone-200" />
              <CommitteeRankingForm existingPreference={existingPreference} />
            </div>
          )}
        </section>
      )}

      {/* Rescind confirmation modal */}
      {confirmRescindId && (() => {
        const pkg = outgoing.find((p) => p.id === confirmRescindId)
        const requestee = pkg ? (Array.isArray(pkg.requestee) ? pkg.requestee[0] : pkg.requestee) : null
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            onClick={() => !rescinding && setConfirmRescindId(null)}
          >
            <div
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="font-serif text-xl font-bold text-bourbon-dark">Rescind request?</h2>
              <p className="text-sm text-stone-600">
                This will cancel your package request with <span className="font-semibold">{requestee?.name ?? 'this person'}</span>. They won&apos;t be notified.
              </p>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setConfirmRescindId(null)}
                  disabled={rescinding}
                  className="flex-1 border border-stone-300 text-stone-600 text-sm font-medium py-2.5 rounded-xl hover:bg-stone-50 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRescind}
                  disabled={rescinding}
                  className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
                >
                  {rescinding ? 'Rescinding…' : 'Yes, rescind'}
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
