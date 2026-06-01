import { createClientAnonKey, createClientServiceRoleKey } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { CAPTAIN_EMAILS } from '@/types/index'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClientAnonKey()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !CAPTAIN_EMAILS.includes(user.email ?? '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string

    if (!file || !userId) {
      return NextResponse.json({ error: 'Missing file or userId' }, { status: 400 })
    }

    console.log('Upload attempt:', { name: file.name, type: file.type, size: file.size, userId })

    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    const mimeType = file.type || 'image/jpeg'
    const ext = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg'
    const path = `${userId}.${ext}`

    console.log('Uploading to storage:', { path, mimeType, bytes: buffer.byteLength })

    const admin = createClientServiceRoleKey()

    const { data: uploadData, error: uploadErr } = await admin.storage
      .from('avatars')
      .upload(path, buffer, { upsert: true, contentType: mimeType })

    console.log('Storage result:', { uploadData, uploadErr })

    if (uploadErr) {
      return NextResponse.json({ error: uploadErr.message }, { status: 500 })
    }

    const { data: { publicUrl } } = admin.storage.from('avatars').getPublicUrl(path)

    const { error: updateErr } = await admin
      .from('users')
      .update({ avatar_url: publicUrl })
      .eq('id', userId)

    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })

    return NextResponse.json({ url: publicUrl }, { status: 200 })
  } catch (e) {
    console.error('Upload route error:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
