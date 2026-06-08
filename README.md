# Iris E-Campus - Added viewer, progress tracking and report card features

This commit adds example viewer pages, client JS, SQL schema and RLS policy templates for:
- Video progress tracking (public/viewer/video-viewer.html + public/js/progress.js)
- PDF progress tracking (public/viewer/pdf-viewer.html + public/js/pdf-progress.js)
- Report card upload (teacher) and student viewer (public/reports/*)
- SQL schema and RLS policies (public/sql/*)

Next steps:
1. Replace SUPABASE_URL and SUPABASE_ANON_KEY in public/js/supabase-client.js.
2. Run public/sql/schema.sql in Supabase SQL editor, then run rls_policies.sql.
3. Create storage buckets: `videos` and `documents` (private), and set CORS/permissions.
4. Test auth flows (teacher/student) and adjust policies if roles differ in your users table.

If you'd like, I can open a pull request instead of committing to main or adjust file locations.
