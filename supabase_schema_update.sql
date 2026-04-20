-- SQL to update site_visits table for the new Site Visit Module
-- Run this in your Supabase SQL Editor

-- Add status to clients
ALTER TABLE clients ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Lead';

-- Add new columns to site_visits
ALTER TABLE site_visits 
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id),
ADD COLUMN IF NOT EXISTS in_time TIME,
ADD COLUMN IF NOT EXISTS out_time TIME,
ADD COLUMN IF NOT EXISTS engineer TEXT,
ADD COLUMN IF NOT EXISTS visited_by TEXT,
ADD COLUMN IF NOT EXISTS purpose TEXT,
ADD COLUMN IF NOT EXISTS site_address TEXT,
ADD COLUMN IF NOT EXISTS location_url TEXT,
ADD COLUMN IF NOT EXISTS measurements TEXT,
ADD COLUMN IF NOT EXISTS discussion TEXT,
ADD COLUMN IF NOT EXISTS follow_up_date DATE,
ADD COLUMN IF NOT EXISTS next_step TEXT,
ADD COLUMN IF NOT EXISTS created_by TEXT,
ADD COLUMN IF NOT EXISTS photos TEXT[],
ADD COLUMN IF NOT EXISTS documents TEXT[];

-- Make project_id optional since we can now schedule visits directly for clients
ALTER TABLE site_visits ALTER COLUMN project_id DROP NOT NULL;

-- Update status check to include 'pending' and 'postponed'
ALTER TABLE site_visits DROP CONSTRAINT IF EXISTS site_visits_status_check;
ALTER TABLE site_visits ADD CONSTRAINT site_visits_status_check CHECK (status IN ('pending', 'scheduled', 'completed', 'cancelled', 'postponed'));
ALTER TABLE site_visits ADD COLUMN IF NOT EXISTS postponed_reason TEXT;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_site_visits_visit_date ON site_visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_site_visits_client_id ON site_visits(client_id);
CREATE INDEX IF NOT EXISTS idx_site_visits_status ON site_visits(status);

-- Create visit_purposes table
CREATE TABLE IF NOT EXISTS visit_purposes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default purposes
INSERT INTO visit_purposes (name) VALUES 
  ('Measurement'),
  ('Complaint'),
  ('Friendly Call'),
  ('Bill Submission'),
  ('Meeting')
ON CONFLICT (name) DO NOTHING;
