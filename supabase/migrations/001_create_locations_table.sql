-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name VARCHAR(255) NOT NULL,
  county VARCHAR(100) NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  type VARCHAR(50) NOT NULL,
  risk VARCHAR(20) NOT NULL,
  description TEXT,
  access TEXT,
  uploaded_by VARCHAR(100),
  date DATE DEFAULT CURRENT_DATE,
  likes INTEGER DEFAULT 0,
  photo TEXT,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_locations_type ON locations(type);
CREATE INDEX IF NOT EXISTS idx_locations_risk ON locations(risk);
CREATE INDEX IF NOT EXISTS idx_locations_county ON locations(county);
CREATE INDEX IF NOT EXISTS idx_locations_name ON locations(name);
CREATE INDEX IF NOT EXISTS idx_locations_date ON locations(date DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Allow all users to view locations
CREATE POLICY "Allow public read" ON locations FOR SELECT USING (true);

-- Allow authenticated users to insert
CREATE POLICY "Allow authenticated insert" ON locations FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update likes (optional)
CREATE POLICY "Allow update likes" ON locations FOR UPDATE USING (true) WITH CHECK (true);
