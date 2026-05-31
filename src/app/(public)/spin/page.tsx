import { createClientAnonKey } from '@/utils/supabase/server'
import SpinWheelClient from './SpinWheelClient'

export default async function SpinPage() {
  const supabase = await createClientAnonKey()
  const { data: users } = await supabase
    .from('users')
    .select('id, name, team')
    .order('name')

  const { data: settings } = await supabase
    .from('app_settings')
    .select('teams_revealed')
    .single()

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="mb-6">
        <p className="text-bourbon-amber text-xs font-semibold uppercase tracking-widest mb-1">Who&apos;s up?</p>
        <h1 className="font-serif text-3xl font-bold text-bourbon-dark">Spin the Wheel</h1>
      </div>
      <SpinWheelClient
        allUsers={users ?? []}
        teamsRevealed={settings?.teams_revealed ?? false}
      />
    </div>
  )
}
