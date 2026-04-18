-- Add perimeter column to locations
ALTER TABLE locations
  ADD COLUMN IF NOT EXISTS perimeter JSONB DEFAULT NULL;

-- Allow anonymous (unauthenticated) inserts on locations
DROP POLICY IF EXISTS "Allow authenticated insert" ON locations;

CREATE POLICY "Allow anon insert" ON locations
  FOR INSERT WITH CHECK (true);

-- Allow anonymous inserts on comments
DROP POLICY IF EXISTS "Allow authenticated insert comments" ON comments;

CREATE POLICY "Allow anon insert comments" ON comments
  FOR INSERT WITH CHECK (true);

-- Remove user-specific delete/update policies on comments
DROP POLICY IF EXISTS "Allow users update own comments" ON comments;
DROP POLICY IF EXISTS "Allow users delete own comments" ON comments;
