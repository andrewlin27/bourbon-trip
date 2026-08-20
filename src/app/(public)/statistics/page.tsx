import type { Metadata } from 'next'
import StatisticsExperience from '@/components/StatisticsExperience'

export const metadata: Metadata = {
  title: 'The Group Chat, Wrapped | ACE Bourbon Trip',
  description: 'Laughs, reactions, reps, and the messages that defined the group chat.',
}

export default function StatisticsPage() {
  return <StatisticsExperience />
}
