import { UserWithDetails, COMMITTEE_SHORT_NAMES, CommitteeRole } from '@/types/index'
import Image from 'next/image'

interface Props {
  user: UserWithDetails
  teamsRevealed: boolean
}

export default function PlayerCard({ user, teamsRevealed }: Props) {
  const submitted = !!user.preference_submissions
  const profile = user.profiles

  const teamColor =
    user.team === 'lin'
      ? 'bg-team-lin text-white'
      : user.team === 'ditty'
      ? 'bg-team-ditty text-white'
      : ''

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
      {/* Portrait photo — 3:4 aspect ratio for iPhone vertical shots */}
      <div className="relative w-full" style={{ aspectRatio: '3/4' }}>
        {user.avatar_url ? (
          <Image
            src={user.avatar_url}
            alt={user.name}
            fill
            className="object-cover object-top"
            sizes="(max-width: 640px) 100vw, 50vw"
          />
        ) : (
          <div className="w-full h-full bg-stone-100 flex flex-col items-center justify-center gap-2">
            <span className="text-5xl font-serif font-bold text-stone-300">
              {user.name.charAt(0)}
            </span>
            <span className="text-xs text-stone-400">No photo yet</span>
          </div>
        )}

        {/* Submitted badge — top right corner */}
        {submitted && (
          <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-green-500 flex items-center justify-center shadow" title="Preference submitted">
            <svg className="w-4 h-4 text-white" viewBox="0 0 12 12" fill="none">
              <path d="M1.5 6L5 9.5L10.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 space-y-3">
        {/* Name + badges */}
        <div>
          <p className="font-serif font-bold text-lg text-stone-900 leading-tight">{user.name}</p>
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            {teamsRevealed && user.team && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${teamColor}`}>
                Team {user.team === 'lin' ? 'Lin' : 'Ditty'}
              </span>
            )}
            {user.is_captain ? (
              <span className="text-xs bg-bourbon-gold/20 text-bourbon-dark px-2 py-0.5 rounded-full font-medium">
                Captain
              </span>
            ) : (
              teamsRevealed && user.committee && (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-stone-100 text-stone-600">
                  {COMMITTEE_SHORT_NAMES[user.committee as CommitteeRole] ?? user.committee}
                </span>
              )
            )}
          </div>
        </div>

        {/* Flight times */}
        {(user.flight_arrival || user.flight_departure) && (
          <div className="text-xs text-stone-500 space-y-0.5 border-t border-stone-100 pt-3">
            {user.flight_arrival && (
              <p>✈ <span className="font-medium">Arrives</span> {user.flight_arrival}</p>
            )}
            {user.flight_departure && (
              <p>✈ <span className="font-medium">Departs</span> {user.flight_departure}</p>
            )}
          </div>
        )}

        {/* Prompts */}
        {(profile?.prompt1_question || profile?.prompt2_question) && (
          <div className="space-y-2.5 border-t border-stone-100 pt-3">
            {profile.prompt1_question && (
              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wide">{profile.prompt1_question}</p>
                <p className="text-sm text-stone-800 font-medium mt-0.5">{profile.prompt1_answer}</p>
              </div>
            )}
            {profile.prompt2_question && (
              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wide">{profile.prompt2_question}</p>
                <p className="text-sm text-stone-800 font-medium mt-0.5">{profile.prompt2_answer}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
