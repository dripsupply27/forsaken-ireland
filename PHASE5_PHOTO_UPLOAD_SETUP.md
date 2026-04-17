# Phase 5: Photo Upload System Setup

## Overview
Users can now upload photos with locations. Photos are stored in Supabase Storage and displayed in location details.

## Supabase Storage Setup

Go to Supabase Dashboard → Storage:

### 1. Create "location-photos" Bucket
- Click "New bucket"
- Name: `location-photos`
- Public: **Yes** (allow public access to read photos)
- Click "Create bucket"

### 2. Set Storage Policies
Go to Policies tab for `location-photos` bucket:

```sql
-- Allow public read access
CREATE POLICY "Allow public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'location-photos');

-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'location-photos' AND auth.role() = 'authenticated'
  );
```

### 3. Update Locations Table
The `photo` column already exists but was null. It now stores the public URL:
```sql
ALTER TABLE locations 
  ALTER COLUMN photo TYPE VARCHAR(500);
```

## Changes Made
- `usePhotoUpload()` hook - handles upload/delete to Supabase Storage
- SubmitModal now has file input for photos (JPG, PNG, WebP)
- Photos displayed in LocationDetail with 200px height
- Photo upload shows "UPLOADING..." state
- File naming: `{locationId}_{userId}_{timestamp}.jpg`

## Testing Photo Upload

1. Sign in (Phase 4)
2. Click "SUBMIT A LOCATION"
3. Fill required fields
4. Add optional photo via file picker
4. Click "SUBMIT LOCATION"
5. Photo uploads to Storage and displays in detail view

## Photo Storage Path
```
location-photos/
  locations/
    {locationId}_{userId}_{timestamp}.jpg
```

## Image Size Considerations
- Max file size: typically 50MB per Supabase tier
- Recommended: compress images to <5MB
- Supported formats: JPEG, PNG, WebP
- Display size: 200px height, full width

## File Cleanup
Currently photos are not deleted when locations are deleted. Consider adding:
- Delete storage file when location is removed
- Automatic cleanup of orphaned photos (cron job)

## Next Steps
- Phase 6: Content moderation with OpenAI API
- Phase 7: Comment threads with real-time updates
