-- RLS policies for resource_progress and report_cards
-- Paste into Supabase SQL editor after creating tables. Adjust role checks to match your users table.

ALTER TABLE IF EXISTS resource_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS report_cards ENABLE ROW LEVEL SECURITY;

-- Allow users to insert/update their own progress
CREATE POLICY resource_progress_self_write ON resource_progress
  FOR INSERT, UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow select for owner, teachers and admins (checks users.role)
CREATE POLICY resource_progress_select ON resource_progress
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('teacher','admin'))
  );

-- Allow only teachers/admins to insert report cards
CREATE POLICY report_cards_teacher_insert ON report_cards
  FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('teacher','admin')));

-- Allow students to see their own reports and teachers/admins to see any
CREATE POLICY report_cards_select ON report_cards
  FOR SELECT
  USING (
    auth.uid() = student_id
    OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('teacher','admin'))
  );
