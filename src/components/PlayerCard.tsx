import { UserWithDetails } from '@/types/index'
import Image from 'next/image'

interface Props {
  user: UserWithDetails
  teamsRevealed: boolean
}

export default function PlayerCard({ user, teamsRevealed }: Props) {
  const submitted = !!user.preference_submissions
  const profile = user.profiles

  const teamColor =
    user.team === 'lin' ? 'bg-team-lin text-white' : user.team === 'ditty' ? 'bg-team-ditty text-white' : ''

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 space-y-3">
      {/* Header: avatar + name */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-stone-200 overflow-hidden shrink-0 flex items-center justify-center">
          {user.avatar_url ? (
            <Image src={user.avatar_url} alt={user.name} width={48} height={48} className="object-cover w-full h-full" />
          ) : (
            <span className="text-stone-400 text-lg font-semibold">
              {user.name.charAt(0)}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-stone-900 truncate">{user.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            {user.is_captain && (
              <span className="text-xs bg-bourbon-gold/20 text-bourbon-dark px-1.5 py-0.5 rounded font-medium">
                Captain
              </span>
            )}
            {teamsRevealed && user.team && (
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${teamColor}`}>
                Team {user.team === 'lin' ? 'Lin' : 'Ditty'}
              </span>
            )}
          </div>
        </div>
        {/* Submitted badge */}
        {submitted && (
          <div className="shrink-0" title="Preference submitted">
            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-green-600" viewBox="0 0 12 12" fill="none">
                <path d="M1.5 6L5 9.5L10.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Flight times */}
      {(user.flight_arrival || user.flight_departure) && (
        <div className="text-xs text-stone-500 space-y-0.5 border-t border-stone-100 pt-2">
          {user.flight_arrival && <p>✈ Arrives: {user.flight_arrival}</p>}
          {user.flight_departure && <p>✈ Departs: {user.flight_departure}</p>}
        </div>
      )}

      {/* Prompts */}
      {(profile?.prompt1_question || profile?.prompt2_question) && (
        <div className="space-y-2 border-t border-stone-100 pt-2">
          {profile.prompt1_question && (
            <div>
              <p className="text-xs text-stone-400 uppercase tracking-wide">{profile.prompt1_question}</p>
              <p className="text-sm text-stone-800 font-medium">{profile.prompt1_answer}</p>
            </div>
          )}
          {profile.prompt2_question && (
            <div>
              <p className="text-xs text-stone-400 uppercase tracking-wide">{profile.prompt2_question}</p>
              <p className="text-sm text-stone-800 font-medium">{profile.prompt2_answer}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
