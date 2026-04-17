# Phase 4: User Authentication Setup

## Overview
Email/password authentication with Supabase Auth is now integrated. Users must authenticate before uploading locations.

## Supabase Auth Configuration

Go to Supabase Dashboard → Authentication → Providers:

### 1. Enable Email Provider
- Provider should be enabled by default
- Email confirmations are **disabled** by default (good for testing)
- Optional: Enable email confirmations in production

### 2. Update Auth Policies
Already set in Phase 3 migration:
```sql
-- Only authenticated users can insert new locations
CREATE POLICY "Allow authenticated insert" ON locations 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- All users can read locations
CREATE POLICY "Allow public read" ON locations 
  FOR SELECT USING (true);
```

## Changes Made
- `useAuth()` hook - manages signup/signin/signout
- `AuthModal` component - login/signup form
- Updated `handleUpload()` to require authentication
- Sidebar shows user email and sign out button
- Auth state persists on page reload

## Testing Authentication

1. Click "SIGN IN" button in sidebar
2. Create account or sign in with test email (e.g., `test@example.com`)
3. Password requirements from Supabase (usually 6+ chars)
4. User email appears in sidebar
5. Try uploading a location - should now work
6. Sign out to test the flow again

## Column Mapping
The `uploaded_by` field now stores the user's email instead of "you":
```javascript
uploaded_by: user.email // e.g., "user@example.com"
```

## Security Notes
- Never share the anon key in production secrets
- Email confirmations should be enabled in production
- Consider implementing custom claims for admin roles

## Next Steps
- Phase 5: Photo upload to Supabase Storage
- Phase 6: Content moderation with OpenAI
