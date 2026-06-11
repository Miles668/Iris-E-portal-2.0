-- =====================================================
-- IRIS E-CAMPUS DATABASE SCHEMA FOR SUPABASE
-- =====================================================

-- =====================================================
-- 1. USERS TABLE
-- =====================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) CHECK (role IN ('admin', 'teacher', 'student')) NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. SUBJECTS TABLE
-- =====================================================
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_name VARCHAR(255) NOT NULL,
    description TEXT,
    subject_code VARCHAR(50) UNIQUE,
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    thumbnail_url TEXT,
    color_code VARCHAR(7),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 3. RESOURCES TABLE
-- =====================================================
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50) CHECK (file_type IN ('video', 'pdf', 'pptx', 'docx', 'xlsx')) NOT NULL,
    file_size BIGINT,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    duration INTEGER COMMENT 'Video duration in seconds',
    thumbnail_url TEXT,
    is_published BOOLEAN DEFAULT true,
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 4. VIDEO PROGRESS TABLE (New Feature)
-- =====================================================
CREATE TABLE video_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    last_watched_position INTEGER DEFAULT 0 COMMENT 'Position in seconds',
    total_watch_time INTEGER DEFAULT 0 COMMENT 'Total watch time in seconds',
    is_completed BOOLEAN DEFAULT false,
    completion_date TIMESTAMP,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, resource_id)
);

-- =====================================================
-- 5. VIDEO VIEWS TABLE (Analytics - New Feature)
-- =====================================================
CREATE TABLE video_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    viewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    view_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    watch_duration INTEGER COMMENT 'Duration watched in seconds',
    device_type VARCHAR(50),
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 6. ANNOUNCEMENTS TABLE
-- =====================================================
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    posted_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_role VARCHAR(50) CHECK (target_role IN ('admin', 'teacher', 'student', 'all')) DEFAULT 'all',
    is_pinned BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 7. ENROLLMENTS TABLE
-- =====================================================
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) CHECK (status IN ('active', 'completed', 'dropped')) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, subject_id)
);

-- =====================================================
-- 8. RESOURCE DOWNLOADS TABLE
-- =====================================================
CREATE TABLE resource_downloads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    downloader_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    download_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    device_type VARCHAR(50)
);

-- =====================================================
-- 9. RATINGS TABLE
-- =====================================================
CREATE TABLE resource_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(resource_id, student_id)
);

-- =====================================================
-- 10. AUDIT LOG TABLE
-- =====================================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100),
    resource_id UUID,
    changes JSONB,
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_subjects_teacher_id ON subjects(teacher_id);
CREATE INDEX idx_resources_subject_id ON resources(subject_id);
CREATE INDEX idx_resources_uploaded_by ON resources(uploaded_by);
CREATE INDEX idx_resources_file_type ON resources(file_type);
CREATE INDEX idx_video_progress_student ON video_progress(student_id);
CREATE INDEX idx_video_progress_resource ON video_progress(resource_id);
CREATE INDEX idx_video_views_resource ON video_views(resource_id);
CREATE INDEX idx_video_views_viewer ON video_views(viewer_id);
CREATE INDEX idx_video_views_date ON video_views(view_date);
CREATE INDEX idx_announcements_posted_by ON announcements(posted_by);
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_subject ON enrollments(subject_id);
CREATE INDEX idx_enrollments_status ON enrollments(status);
CREATE INDEX idx_resource_downloads_resource ON resource_downloads(resource_id);
CREATE INDEX idx_resource_downloads_downloader ON resource_downloads(downloader_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View: Student Progress Dashboard
CREATE VIEW student_progress_view AS
SELECT 
    s.id as student_id,
    s.full_name,
    sub.id as subject_id,
    sub.subject_name,
    COUNT(DISTINCT r.id) as total_resources,
    COUNT(DISTINCT CASE WHEN vp.is_completed = true THEN r.id END) as completed_resources,
    ROUND(100.0 * COUNT(DISTINCT CASE WHEN vp.is_completed = true THEN r.id END) / 
        NULLIF(COUNT(DISTINCT r.id), 0)) as overall_progress_percentage,
    MAX(vp.last_accessed) as last_accessed_date
FROM users s
LEFT JOIN enrollments e ON s.id = e.student_id
LEFT JOIN subjects sub ON e.subject_id = sub.id
LEFT JOIN resources r ON sub.id = r.subject_id
LEFT JOIN video_progress vp ON s.id = vp.student_id AND r.id = vp.resource_id
WHERE s.role = 'student'
GROUP BY s.id, s.full_name, sub.id, sub.subject_name;

-- View: Video Analytics
CREATE VIEW video_analytics_view AS
SELECT 
    r.id as resource_id,
    r.title,
    r.file_type,
    COUNT(DISTINCT vv.viewer_id) as total_viewers,
    COUNT(DISTINCT vv.id) as total_views,
    AVG(vv.watch_duration) as avg_watch_duration,
    COUNT(DISTINCT CASE WHEN vp.is_completed = true THEN vp.student_id END) as completion_count,
    ROUND(100.0 * COUNT(DISTINCT CASE WHEN vp.is_completed = true THEN vp.student_id END) / 
        NULLIF(COUNT(DISTINCT vv.viewer_id), 0)) as completion_rate
FROM resources r
LEFT JOIN video_views vv ON r.id = vv.resource_id
LEFT JOIN video_progress vp ON r.id = vp.resource_id
WHERE r.file_type = 'video'
GROUP BY r.id, r.title, r.file_type;

-- View: Teacher Dashboard Statistics
CREATE VIEW teacher_stats_view AS
SELECT 
    t.id as teacher_id,
    t.full_name,
    COUNT(DISTINCT sub.id) as total_subjects,
    COUNT(DISTINCT r.id) as total_resources,
    COUNT(DISTINCT CASE WHEN r.file_type = 'video' THEN r.id END) as video_count,
    COUNT(DISTINCT CASE WHEN r.file_type IN ('pdf', 'docx', 'pptx', 'xlsx') THEN r.id END) as document_count,
    SUM(COALESCE(r.view_count, 0)) as total_views,
    SUM(COALESCE(r.download_count, 0)) as total_downloads
FROM users t
LEFT JOIN subjects sub ON t.id = sub.teacher_id
LEFT JOIN resources r ON sub.id = r.subject_id
WHERE t.role = 'teacher'
GROUP BY t.id, t.full_name;

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users: Users can view all users but can only update their own profile
CREATE POLICY "Allow users to view all profiles" ON users
    FOR SELECT USING (true);

CREATE POLICY "Allow users to update own profile" ON users
    FOR UPDATE USING (auth.uid()::uuid = id)
    WITH CHECK (auth.uid()::uuid = id);

-- Subjects: Teachers can manage their own subjects, students can view enrolled subjects
CREATE POLICY "Teachers can manage their subjects" ON subjects
    FOR ALL USING (auth.uid()::uuid = teacher_id)
    WITH CHECK (auth.uid()::uuid = teacher_id);

CREATE POLICY "Students can view enrolled subjects" ON subjects
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM enrollments e
            WHERE e.subject_id = subjects.id 
            AND e.student_id = auth.uid()::uuid
        )
        OR auth.uid()::text IN (SELECT id::text FROM users WHERE role = 'admin')
    );

-- Resources: Teachers can manage their resources, students can view resources from enrolled subjects
CREATE POLICY "Teachers can manage their resources" ON resources
    FOR ALL USING (auth.uid()::uuid = uploaded_by)
    WITH CHECK (auth.uid()::uuid = uploaded_by);

CREATE POLICY "Students can view resources from enrolled subjects" ON resources
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM enrollments e
            WHERE e.subject_id = resources.subject_id 
            AND e.student_id = auth.uid()::uuid
        )
        OR auth.uid()::text IN (SELECT id::text FROM users WHERE role = 'admin')
    );

-- Video Progress: Students can only manage their own progress
CREATE POLICY "Students can manage their progress" ON video_progress
    FOR ALL USING (auth.uid()::uuid = student_id)
    WITH CHECK (auth.uid()::uuid = student_id);

-- Video Views: Track all views for analytics
CREATE POLICY "Allow recording video views" ON video_views
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Students can view their watch history" ON video_views
    FOR SELECT USING (
        auth.uid()::uuid = viewer_id
        OR auth.uid()::text IN (SELECT id::text FROM users WHERE role = 'admin')
    );

-- Announcements: Everyone can view published announcements
CREATE POLICY "Allow viewing published announcements" ON announcements
    FOR SELECT USING (is_published = true);

-- Enrollments: Students can view their enrollments
CREATE POLICY "Students can view their enrollments" ON enrollments
    FOR SELECT USING (auth.uid()::uuid = student_id);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Update updated_at timestamp on users
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_users_updated_at();

-- Update updated_at timestamp on subjects
CREATE OR REPLACE FUNCTION update_subjects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_subjects_updated_at
BEFORE UPDATE ON subjects
FOR EACH ROW
EXECUTE FUNCTION update_subjects_updated_at();

-- Update updated_at timestamp on resources
CREATE OR REPLACE FUNCTION update_resources_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_resources_updated_at
BEFORE UPDATE ON resources
FOR EACH ROW
EXECUTE FUNCTION update_resources_updated_at();

-- Update video_progress updated_at
CREATE OR REPLACE FUNCTION update_video_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_video_progress_updated_at
BEFORE UPDATE ON video_progress
FOR EACH ROW
EXECUTE FUNCTION update_video_progress_updated_at();

-- Increment view count when video is viewed
CREATE OR REPLACE FUNCTION increment_resource_view_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE resources 
    SET view_count = view_count + 1
    WHERE id = NEW.resource_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_view_count
AFTER INSERT ON video_views
FOR EACH ROW
EXECUTE FUNCTION increment_resource_view_count();

-- Increment download count when resource is downloaded
CREATE OR REPLACE FUNCTION increment_resource_download_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE resources 
    SET download_count = download_count + 1
    WHERE id = NEW.resource_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_download_count
AFTER INSERT ON resource_downloads
FOR EACH ROW
EXECUTE FUNCTION increment_resource_download_count();

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Insert sample admin user
-- INSERT INTO users (full_name, email, role) VALUES 
-- ('Admin User', 'admin@iris-tutors.com', 'admin');

-- Insert sample teacher
-- INSERT INTO users (full_name, email, role) VALUES 
-- ('John Teacher', 'john@iris-tutors.com', 'teacher');

-- Insert sample students
-- INSERT INTO users (full_name, email, role) VALUES 
-- ('Jane Student', 'jane@iris-tutors.com', 'student'),
-- ('Bob Student', 'bob@iris-tutors.com', 'student');

-- =====================================================
-- END OF SCHEMA
-- =====================================================
