# Phase 7: Comment Threads with Real-Time Updates

## Overview
Users can now comment on locations. Comments are moderated and updated in real-time using Supabase Realtime subscriptions.

## Supabase Setup

### 1. Create Comments Table
Go to Supabase Dashboard → SQL Editor and run:

```sql
CREATE TABLE IF NOT EXISTS comments (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  location_id BIGINT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  user_email VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_comments_location ON comments(location_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- Row Level Security
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert comments" ON comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow users update own comments" ON comments FOR UPDATE USING (user_email = auth.jwt() ->> 'email');
CREATE POLICY "Allow users delete own comments" ON comments FOR DELETE USING (user_email = auth.jwt() ->> 'email');
```

### 2. Enable Realtime
In Supabase Dashboard:
- Go to Realtime → Replication
- Enable `comments` table for real-time updates

## Changes Made
- `useComments()` hook - manages comments with real-time subscriptions
- `CommentThread` component - displays comments and comment form
- Comments are auto-moderated using OpenAI
- Real-time updates via Supabase Realtime Postgres Changes

## Features
- View all comments for a location
- Add comments (requires authentication)
- Delete own comments
- Real-time updates when others add/delete comments
- Content moderation on new comments
- Timestamps for each comment

## Testing Comments

1. Sign in (Phase 4)
2. Open a location detail
3. Scroll to comments section
4. Type a comment and press Enter or click POST
5. Comment appears instantly
6. Open same location in another window
7. See real-time updates across windows

## Real-Time How It Works
1. Comment is added to database
2. Supabase Realtime detects change
3. All connected clients receive update
4. UI updates instantly without page refresh

## Moderation
Comments are checked with OpenAI Moderation API before posting:
- Flagged comments are rejected
- User sees detailed error message
- Only safe comments are stored

## Cost Considerations
- Realtime subscriptions have limits per tier
- Each comment adds one connection
- Consider cleanup for inactive connections

## Limitations
- Comments don't support nested replies (flat thread)
- No edit history tracking
- No comment reactions/voting

## Next Steps
- Phase 8: Satellite map style toggle
- Phase 9: Polish and deployment
