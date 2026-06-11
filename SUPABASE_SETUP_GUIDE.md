# Iris E-Campus - Supabase Setup Guide

## Complete SQL Schema & Setup Instructions

This guide provides step-by-step instructions for setting up the Iris E-Campus database on Supabase.

---

## 📋 Table of Contents

1. [Database Tables](#database-tables)
2. [Views](#views)
3. [Storage Buckets](#storage-buckets)
4. [Row Level Security (RLS)](#row-level-security)
5. [Setup Steps](#setup-steps)
6. [API Configuration](#api-configuration)
7. [Testing](#testing)

---

## 🗄️ Database Tables

### 1. **USERS Table**
Stores information about all platform users (Admin, Teacher, Student)

```sql
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
```

**Fields:**
- `id`: Unique user identifier (UUID)
- `full_name`: User's full name
- `email`: User's email (unique)
- `phone`: Contact number
- `role`: One of admin, teacher, student
- `avatar_url`: Profile picture URL
- `bio`: User biography
- `is_active`: Account status
- `last_login`: Last login timestamp
- `created_at`: Account creation date
- `updated_at`: Last update date

---

### 2. **SUBJECTS Table**
Stores course/subject information created by teachers

```sql
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
```

**Fields:**
- `id`: Subject identifier (UUID)
- `subject_name`: Name of the subject
- `description`: Subject description
- `subject_code`: Unique subject code (e.g., MATH101)
- `teacher_id`: Reference to teacher user
- `thumbnail_url`: Subject image
- `color_code`: Hex color for UI
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

---

### 3. **RESOURCES Table**
Stores all learning materials (videos, PDFs, presentations, documents)

```sql
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50) CHECK (file_type IN ('video', 'pdf', 'pptx', 'docx', 'xlsx')) NOT NULL,
    file_size BIGINT,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    duration INTEGER,
    thumbnail_url TEXT,
    is_published BOOLEAN DEFAULT true,
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Fields:**
- `id`: Resource identifier
- `title`: Resource title
- `description`: Content description
- `file_url`: Storage URL for the file
- `file_type`: Type of resource (video, pdf, pptx, docx, xlsx)
- `file_size`: File size in bytes
- `subject_id`: Associated subject
- `uploaded_by`: Teacher who uploaded
- `duration`: Video duration in seconds
- `thumbnail_url`: Preview image
- `is_published`: Visibility status
- `view_count`: Number of views (auto-updated)
- `download_count`: Number of downloads (auto-updated)

---

### 4. **VIDEO_PROGRESS Table** ⭐ NEW FEATURE
Tracks student progress on video content with percentage and viewer analytics

```sql
CREATE TABLE video_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    last_watched_position INTEGER DEFAULT 0,
    total_watch_time INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    completion_date TIMESTAMP,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, resource_id)
);
```

**Features:**
- ✅ Track progress as percentage (0-100%)
- ✅ Remember last watched position
- ✅ Track total watch time
- ✅ Mark as completed with completion date
- ✅ Unique constraint prevents duplicate entries

---

### 5. **VIDEO_VIEWS Table** ⭐ NEW FEATURE
Tracks each view event for analytics and viewer count display

```sql
CREATE TABLE video_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    viewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    view_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    watch_duration INTEGER,
    device_type VARCHAR(50),
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Features:**
- ✅ Track individual view events
- ✅ Record device type (mobile, desktop, tablet)
- ✅ Store IP address for analytics
- ✅ Track watch duration per session
- ✅ Automatically increment resource view count via trigger

---

### 6. **ANNOUNCEMENTS Table**
System-wide announcements and notifications

```sql
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
```

---

### 7. **ENROLLMENTS Table**
Student enrollment in subjects

```sql
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) CHECK (status IN ('active', 'completed', 'dropped')) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, subject_id)
);
```

---

### 8. **RESOURCE_DOWNLOADS Table**
Track resource downloads for analytics

```sql
CREATE TABLE resource_downloads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    downloader_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    download_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    device_type VARCHAR(50)
);
```

---

### 9. **RESOURCE_RATINGS Table**
Student ratings and reviews

```sql
CREATE TABLE resource_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(resource_id, student_id)
);
```

---

### 10. **AUDIT_LOGS Table**
System audit trail

```sql
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
```

---

## 📊 Views

### 1. **student_progress_view**
Shows overall progress for each student per subject

```sql
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
```

---

### 2. **video_analytics_view**
Video performance metrics

```sql
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
```

---

### 3. **teacher_stats_view**
Teacher dashboard statistics

```sql
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
```

---

## 💾 Storage Buckets

Create these storage buckets in Supabase:

### 1. **videos** Bucket
```
Size Limit: 500 MB per file
Allowed Types: mp4, avi, mov, webm, mkv
```

### 2. **documents** Bucket
```
Size Limit: 100 MB per file
Allowed Types: pdf, docx, pptx, xlsx, txt
```

### 3. **avatars** Bucket
```
Size Limit: 10 MB per file
Allowed Types: jpg, jpeg, png, gif, webp
```

---

## 🔒 Row Level Security (RLS)

### Enable RLS
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
```

### Security Policies

#### Users Table
```sql
-- Anyone can view all user profiles
CREATE POLICY "Allow users to view all profiles" ON users
    FOR SELECT USING (true);

-- Users can only update their own profile
CREATE POLICY "Allow users to update own profile" ON users
    FOR UPDATE USING (auth.uid()::uuid = id)
    WITH CHECK (auth.uid()::uuid = id);
```

#### Subjects Table
```sql
-- Teachers can manage their own subjects
CREATE POLICY "Teachers can manage their subjects" ON subjects
    FOR ALL USING (auth.uid()::uuid = teacher_id)
    WITH CHECK (auth.uid()::uuid = teacher_id);

-- Students can view subjects they're enrolled in
CREATE POLICY "Students can view enrolled subjects" ON subjects
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM enrollments e
                WHERE e.subject_id = subjects.id 
                AND e.student_id = auth.uid()::uuid)
    );
```

#### Resources Table
```sql
-- Teachers can manage their resources
CREATE POLICY "Teachers can manage their resources" ON resources
    FOR ALL USING (auth.uid()::uuid = uploaded_by)
    WITH CHECK (auth.uid()::uuid = uploaded_by);

-- Students can view resources from enrolled subjects
CREATE POLICY "Students can view resources" ON resources
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM enrollments e
                WHERE e.subject_id = resources.subject_id 
                AND e.student_id = auth.uid()::uuid)
    );
```

#### Video Progress Table
```sql
-- Students can only manage their own progress
CREATE POLICY "Students can manage their progress" ON video_progress
    FOR ALL USING (auth.uid()::uuid = student_id)
    WITH CHECK (auth.uid()::uuid = student_id);
```

#### Video Views Table
```sql
-- Anyone can record a view
CREATE POLICY "Allow recording video views" ON video_views
    FOR INSERT WITH CHECK (true);

-- Students can view their own watch history
CREATE POLICY "Students can view their history" ON video_views
    FOR SELECT USING (auth.uid()::uuid = viewer_id);
```

---

## 🚀 Setup Steps

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details
4. Wait for project initialization

### Step 2: Execute SQL Schema
1. Open Supabase Dashboard
2. Go to "SQL Editor"
3. Click "New Query"
4. Copy the entire SQL schema from `database/supabase-schema.sql`
5. Paste into the query editor
6. Click "Run"

### Step 3: Create Storage Buckets
1. Go to "Storage" section
2. Create three public buckets:
   - `videos`
   - `documents`
   - `avatars`

### Step 4: Get API Credentials
1. Go to "Settings" → "API"
2. Copy:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
3. Update `assets/js/config.js`:

```javascript
const CONFIG = {
    SUPABASE_URL: 'YOUR_URL_HERE',
    SUPABASE_ANON_KEY: 'YOUR_KEY_HERE',
    // ... rest of config
};
```

### Step 5: Set Up Authentication
1. Go to "Authentication" → "Providers"
2. Enable "Email" provider
3. Configure email settings

### Step 6: Create Sample Data
Execute these INSERT statements in SQL Editor:

```sql
-- Add admin user
INSERT INTO users (full_name, email, role) 
VALUES ('Admin User', 'admin@iris-tutors.com', 'admin');

-- Add teachers
INSERT INTO users (full_name, email, role) 
VALUES 
  ('John Teacher', 'john@iris-tutors.com', 'teacher'),
  ('Sarah Smith', 'sarah@iris-tutors.com', 'teacher');

-- Add students
INSERT INTO users (full_name, email, role) 
VALUES 
  ('Jane Student', 'jane@iris-tutors.com', 'student'),
  ('Bob Johnson', 'bob@iris-tutors.com', 'student');
```

---

## 🔌 API Configuration

### Update config.js

```javascript
// assets/js/config.js

const CONFIG = {
    // Supabase Configuration
    SUPABASE_URL: 'https://your-project.supabase.co',
    SUPABASE_ANON_KEY: 'your-anon-key-here',
    
    // Storage Buckets
    STORAGE_BUCKETS: {
        VIDEOS: 'videos',
        DOCUMENTS: 'documents',
        AVATARS: 'avatars'
    },
    
    // File Size Limits
    FILE_LIMITS: {
        video: 500,    // MB
        pdf: 50,       // MB
        pptx: 100,     // MB
        docx: 50,      // MB
        xlsx: 50       // MB
    }
};
```

---

## ✅ Testing

### Test Queries

#### Get all students with progress
```sql
SELECT * FROM student_progress_view 
WHERE student_id = 'user-id';
```

#### Get video analytics
```sql
SELECT * FROM video_analytics_view;
```

#### Get video views count
```sql
SELECT resource_id, COUNT(*) as viewer_count
FROM video_views
WHERE resource_id = 'resource-id'
GROUP BY resource_id;
```

#### Get student progress on specific video
```sql
SELECT progress_percentage, is_completed, total_watch_time
FROM video_progress
WHERE student_id = 'student-id' 
AND resource_id = 'video-id';
```

---

## 📱 Frontend Integration

### Initialize Supabase in JavaScript

```javascript
// Import Supabase client library
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

// Get user progress
async function getUserProgress(userId) {
    const { data, error } = await supabase
        .from('video_progress')
        .select('*')
        .eq('student_id', userId);
    
    return data;
}

// Update video progress
async function updateVideoProgress(studentId, resourceId, progressPercentage) {
    const { data, error } = await supabase
        .from('video_progress')
        .upsert({
            student_id: studentId,
            resource_id: resourceId,
            progress_percentage: progressPercentage
        });
    
    return data;
}

// Get video viewers count
async function getVideoViewers(resourceId) {
    const { data, error } = await supabase
        .from('video_views')
        .select('id')
        .eq('resource_id', resourceId);
    
    return data ? data.length : 0;
}
```

---

## 🔄 Triggers & Automation

The schema includes automated triggers for:

- ✅ Auto-update `updated_at` timestamps
- ✅ Auto-increment view count when video is viewed
- ✅ Auto-increment download count when resource is downloaded

---

## 📞 Support & Troubleshooting

### Common Issues

**Issue**: "permission denied for schema public"
- **Solution**: Ensure RLS policies are properly configured

**Issue**: "duplicate key value violates unique constraint"
- **Solution**: Check for duplicate entries in unique fields (email, subject_code, student_subject_id)

**Issue**: Views not working
- **Solution**: Ensure all referenced tables exist before creating views

---

## 📄 License

Iris E-Campus © 2026 Iris Tutors. All rights reserved.
