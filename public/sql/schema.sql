-- Iris E-Campus additional schema
-- Run in Supabase SQL editor. Creates resource_progress and report_cards tables.

-- Requires the pgcrypto extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS resource_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id uuid NOT NULL,
  progress_percent numeric(5,2) DEFAULT 0,
  last_position numeric,
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, resource_id)
);

CREATE TABLE IF NOT EXISTS report_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  teacher_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  subject_id uuid REFERENCES subjects(id) ON DELETE SET NULL,
  term text,
  score numeric(6,2),
  grade text,
  comments text,
  attached_file_url text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_progress_user_resource ON resource_progress(user_id, resource_id);
CREATE INDEX IF NOT EXISTS idx_report_student ON report_cards(student_id);
