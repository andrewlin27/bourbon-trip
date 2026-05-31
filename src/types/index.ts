export type Team = 'lin' | 'ditty'
export type TeamPreference = 'lin' | 'ditty' | 'none'
export type PackageStatus = 'pending' | 'accepted' | 'declined'

export type CommitteeRole =
  | 'Team Lead'
  | 'Food'
  | 'Instagram/Pics'
  | 'Venmo Logging'
  | 'Uber/Lyft'
  | 'Navigation & Crowd Control'

export const COMMITTEE_ROLES: CommitteeRole[] = [
  'Team Lead',
  'Food',
  'Instagram/Pics',
  'Venmo Logging',
  'Uber/Lyft',
  'Navigation & Crowd Control',
]

export const PROMPT_BANK = [
  'Favorite bourbon',
  'Nickname',
  'Shotgun time',
  'Rookie or Veteran?',
  'Bench PR',
  'Golf handicap',
  'Predicted trip MVP?',
  'Favorite bar',
  'Celebrity lookalike',
  'Hidden talent',
] as const

export type PromptQuestion = (typeof PROMPT_BANK)[number]

export const ALL_PLAYERS = [
  'Andrew Lin',
  'Nick Dittemore',
  'Alan Marini',
  'Brandon Turnage',
  'Calvin Turrell',
  'Eric McGonagle',
  'Jackson David',
  'Jacob Technik',
  'Jess Holbert',
  'Joseph Valenta',
  'Juan Nerio',
  'Juan Ardila',
  'Kyle Dessens',
  'Lucas Giammona',
  'Nafi Islam',
  'Nate Mathews',
  'Nick Caso',
  'Scott Trouy',
] as const

export const CAPTAIN_EMAILS = [
  'andrew.mlin27@gmail.com',
  'nickdittemo@gmail.com',
]

export interface User {
  id: string
  email: string
  name: string
  team: Team | null
  is_captain: boolean
  is_team_lead: boolean
  avatar_url: string | null
  flight_arrival: string | null
  flight_departure: string | null
  created_at: string
}

export interface Profile {
  user_id: string
  prompt1_question: PromptQuestion | null
  prompt1_answer: string | null
  prompt2_question: PromptQuestion | null
  prompt2_answer: string | null
  updated_at: string
}

export interface PreferenceSubmission {
  user_id: string
  team_preference: TeamPreference
  committee_rank_1: CommitteeRole
  committee_rank_2: CommitteeRole
  committee_rank_3: CommitteeRole
  submitted_at: string
  updated_at: string
}

export interface PackageRequest {
  id: string
  requester_id: string
  requestee_id: string
  status: PackageStatus
  created_at: string
}

export interface PowerRanking {
  user_id: string
  rank: number
  season_label: string
  updated_at: string
  users: Pick<User, 'name' | 'avatar_url'>
}

export interface Score {
  id: string
  team: Team
  points: number
  updated_by: string | null
  updated_at: string
}

export interface AppSettings {
  id: number
  teams_revealed: boolean
}

export interface UserWithDetails extends User {
  profiles: Profile | null
  preference_submissions: { submitted_at: string } | null
}
