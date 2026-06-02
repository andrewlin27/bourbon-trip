import { createClientAnonKey, createClientServiceRoleKey } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { CAPTAIN_EMAILS } from '@/types/index'
import sharp from 'sharp'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const heicConvert = require('heic-convert') as (opts: { buffer: Buffer; format: 'JPEG'; quality: number }) => Promise<Uint8Array>

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
    let inputBuffer = Buffer.from(arrayBuffer)

    const isHeic = file.type === 'image/heic' || file.type === 'image/heif' ||
      file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')

    if (isHeic) {
      const result = await heicConvert({ buffer: inputBuffer, format: 'JPEG', quality: 0.9 })
      inputBuffer = Buffer.from(result)
    }

    const converted = await sharp(inputBuffer).rotate().jpeg({ quality: 90 }).toBuffer()

    const path = `${userId}.jpg`

    console.log('Uploading to storage:', { path, bytes: converted.byteLength })

    const admin = createClientServiceRoleKey()

    const { data: uploadData, error: uploadErr } = await admin.storage
      .from('avatars')
      .upload(path, converted, { upsert: true, contentType: 'image/jpeg' })

    console.log('Storage result:', { uploadData, uploadErr })

    if (uploadErr) {
      return NextResponse.json({ error: uploadErr.message }, { status: 500 })
    }

    const { data: { publicUrl } } = admin.storage.from('avatars').getPublicUrl(path)
    const urlWithBust = `${publicUrl}?t=${Date.now()}`

    const { error: updateErr } = await admin
      .from('users')
      .update({ avatar_url: urlWithBust })
      .eq('id', userId)

    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })

    return NextResponse.json({ url: urlWithBust }, { status: 200 })
  } catch (e) {
    console.error('Upload route error:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
