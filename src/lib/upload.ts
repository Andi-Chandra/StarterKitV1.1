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
  const kind: UploadKind = file.type.startsWith('video/') ? 'video' : 'image'
  const ext = getExtFromFilename(file.name, kind === 'video' ? 'mp4' : 'jpg')
  const id = makeId()
  const path = `${kind}s/${id}.${ext}`

  const { error } = await supabase.storage.from('media').upload(path, file, {
    upsert: true,
    contentType: file.type || (kind === 'video' ? 'video/mp4' : 'image/jpeg'),
    cacheControl: '3600',
  })
  if (error) {
    throw new Error(`Upload failed: ${error.message}`)
  }

  const publicUrl = supabase.storage.from('media').getPublicUrl(path).data.publicUrl
  return { url: publicUrl, kind, path }
}

