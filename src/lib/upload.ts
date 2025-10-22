import { supabase } from '@/lib/supabase'

export type UploadKind = 'image' | 'video'

function getExtFromFilename(name: string, fallback: string) {
  const idx = name.lastIndexOf('.')
  if (idx === -1) return fallback
  const ext = name.slice(idx + 1).toLowerCase()
  return ext || fallback
}

function makeId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    // @ts-ignore - browser crypto
    return crypto.randomUUID() as string
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

/**
 * Uploads a File to Supabase Storage bucket `media` and returns a public URL.
 * Ensure a public bucket named `media` exists in your Supabase project.
 */
export async function uploadToSupabaseStorage(file: File): Promise<{ url: string; kind: UploadKind; path: string }>{
  // Ensure the storage bucket exists (server will create if missing)
  try {
    await fetch('/api/storage/ensure-bucket', { method: 'POST' })
  } catch {}

  const kind: UploadKind = file.type.startsWith('video/') ? 'video' : 'image'
  const ext = getExtFromFilename(file.name, kind === 'video' ? 'mp4' : 'jpg')

  // Request a signed upload token from the server (avoids Storage RLS violations)
  const signed = await fetch('/api/storage/signed-upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind, ext, contentType: file.type || (kind === 'video' ? 'video/mp4' : 'image/jpeg') }),
  })
  if (!signed.ok) {
    const text = await signed.text().catch(() => '')
    throw new Error(`Failed to prepare upload: ${text || signed.statusText}`)
  }
  const { path, token } = await signed.json()

  const { error } = await supabase.storage.from('media').uploadToSignedUrl(path, token, file)
  if (error) {
    throw new Error(`Upload failed: ${error.message}`)
  }

  const publicUrl = supabase.storage.from('media').getPublicUrl(path).data.publicUrl
  return { url: publicUrl, kind, path }
}
