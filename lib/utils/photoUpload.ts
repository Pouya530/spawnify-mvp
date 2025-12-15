import { createClient } from '@/lib/supabase/client'

export async function uploadPhotos(
  photos: File[],
  userId: string
): Promise<string[]> {
  const supabase = createClient()
  const photoUrls: string[] = []
  
  for (const photo of photos) {
    try {
      const timestamp = Date.now()
      const ext = photo.name.split('.').pop()?.toLowerCase() || 'jpg'
      const filename = `${timestamp}-${Math.random().toString(36).substring(7)}.${ext}`
      const path = `${userId}/${filename}`
      
      const { error } = await supabase.storage
        .from('grow-photos')
        .upload(path, photo, {
          cacheControl: '3600',
          upsert: false
        })
      
      if (error) {
        console.error('Upload error:', error)
        continue
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('grow-photos')
        .getPublicUrl(path)
      
      if (publicUrl) {
        photoUrls.push(publicUrl)
      }
    } catch (error) {
      console.error('Error uploading photo:', error)
    }
  }
  
  return photoUrls
}

