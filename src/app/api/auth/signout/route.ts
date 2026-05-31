import { createClientAnonKey } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClientAnonKey()
  await supabase.auth.signOut()
  return NextResponse.redirect(
    new URL('/', process.env.NEXT_PUBLIC_BASE_URL!)
  )
}
