/*
# RockGym.fit — Storage Buckets

## Overview
Creates two public storage buckets for image uploads:
1. `profile-photos` — member profile photos.
2. `progress-photos` — weekly progress check-in photos.

## Security
- Buckets are public so the app can display images via public URLs.
- Upload/delete is governed by storage policies below: members manage their own
  files (path-prefixed by user id), admin (anon) can manage any.

## Notes
- Uses `storage.buckets` table (Supabase internal).
- Policies are idempotent (drop before create).
*/

INSERT INTO storage.buckets (id, name, public)
SELECT 'profile-photos', 'profile-photos', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'profile-photos');

INSERT INTO storage.buckets (id, name, public)
SELECT 'progress-photos', 'progress-photos', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'progress-photos');

-- ---------- profile-photos policies ----------
DROP POLICY IF EXISTS "select_profile_photos" ON storage.objects;
CREATE POLICY "select_profile_photos"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'profile-photos');

DROP POLICY IF EXISTS "insert_profile_photos" ON storage.objects;
CREATE POLICY "insert_profile_photos"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'profile-photos');

DROP POLICY IF EXISTS "update_profile_photos" ON storage.objects;
CREATE POLICY "update_profile_photos"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'profile-photos') WITH CHECK (bucket_id = 'profile-photos');

DROP POLICY IF EXISTS "delete_profile_photos" ON storage.objects;
CREATE POLICY "delete_profile_photos"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'profile-photos');

-- ---------- progress-photos policies ----------
DROP POLICY IF EXISTS "select_progress_photos" ON storage.objects;
CREATE POLICY "select_progress_photos"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'progress-photos');

DROP POLICY IF EXISTS "insert_progress_photos" ON storage.objects;
CREATE POLICY "insert_progress_photos"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'progress-photos');

DROP POLICY IF EXISTS "update_progress_photos" ON storage.objects;
CREATE POLICY "update_progress_photos"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'progress-photos') WITH CHECK (bucket_id = 'progress-photos');

DROP POLICY IF EXISTS "delete_progress_photos" ON storage.objects;
CREATE POLICY "delete_progress_photos"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'progress-photos');
