'use client'

import { useState } from 'react'
import { User, Profile, PreferenceSubmission, PackageRequest } from '@/types/index'
import PreferenceForm from '@/components/PreferenceForm'
import PromptAnswerForm from '@/components/PromptAnswerForm'
import FlightTimesForm from '@/components/FlightTimesForm'
import PackageRequestCard from '@/components/PackageRequestCard'

interface PendingPackage extends PackageRequest {
  requester: { id: string; name: string }
}

interface Props {
  currentUser: User | null
  profile: Profile | null
  existingPreference: PreferenceSubmission | null
  pendingPackages: PendingPackage[]
  allUsers: { id: string; name: string; is_captain: boolean }[]
}

export default function ProfileClient({
  currentUser,
  profile,
  existingPreference,
  pendingPackages,
  allUsers,
}: Props) {
  const [packages, setPackages] = useState(pendingPackages)

  if (!currentUser) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center text-stone-500">
        Profile not found.
      </div>
    )
  }

  const handlePackageRespond = (id: string) => {
    setPackages((prev) => prev.filter((p) => p.id !== id))
  }

  const nonCaptains = allUsers.filter(
    (u) => !u.is_captain && u.id !== currentUser.id
  )

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <p className="text-bourbon-amber text-xs font-semibold uppercase tracking-widest mb-1">
          My Profile
        </p>
        <h1 className="font-serif text-3xl font-bold text-bourbon-dark">
          {currentUser.name}
        </h1>
        <p className="text-stone-400 text-sm mt-0.5">{currentUser.email}</p>
      </div>

      {/* Pending package invites */}
      {packages.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold text-stone-700 text-sm uppercase tracking-wide">
            Package Invites
          </h2>
          {packages.map((pkg) => (
            <PackageRequestCard
              key={pkg.id}
              request={pkg}
              onRespond={handlePackageRespond}
            />
          ))}
        </section>
      )}

      {/* Flight times */}
      <section className="bg-white rounded-xl border border-stone-200 p-5">
        <h2 className="font-semibold text-stone-800 mb-4">Flight Times</h2>
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

      {/* Team preference form (not shown to captains) */}
      {!currentUser.is_captain && (
        <section className="bg-white rounded-xl border border-stone-200 p-5">
          <h2 className="font-semibold text-stone-800 mb-1">Team Preference</h2>
          <p className="text-stone-500 text-sm mb-4">
            These answers are submitted to the captains — only they can see your full submission.
          </p>
          <PreferenceForm
            existingPreference={existingPreference}
            nonCaptainUsers={nonCaptains}
            currentUserId={currentUser.id}
          />
        </section>
      )}

      {/* Sign out */}
      <div className="pt-2">
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="text-sm text-stone-400 hover:text-stone-600 underline underline-offset-2"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  )
}
