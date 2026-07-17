import { supabase } from './supabase/client';

export const PROFILE_BUCKET = 'profile-photos';
export const PROGRESS_BUCKET = 'progress-photos';

export function publicUrl(bucket: string, path: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}

export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<{ path: string | null; error: string | null }> {
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
  });
  if (error) return { path: null, error: error.message };
  return { path, error: null };
}
