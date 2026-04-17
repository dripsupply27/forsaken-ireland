-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  location_id BIGINT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  user_email VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_comments_location ON comments(location_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Allow all users to view comments
CREATE POLICY "Allow public read comments" ON comments FOR SELECT USING (true);

-- Allow authenticated users to insert comments
CREATE POLICY "Allow authenticated insert comments" ON comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update/delete their own comments
CREATE POLICY "Allow users update own comments" ON comments
  FOR UPDATE USING (user_email = auth.jwt() ->> 'email');

CREATE POLICY "Allow users delete own comments" ON comments
  FOR DELETE USING (user_email = auth.jwt() ->> 'email');
