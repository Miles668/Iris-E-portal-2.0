// Iris E-Campus Configuration

const CONFIG = {
    // Supabase Configuration - UPDATE WITH YOUR VALUES
    SUPABASE_URL: 'https://your-project.supabase.co',
    SUPABASE_ANON_KEY: 'your-anon-key-here',
    
    // API Endpoints
    API_BASE: '/api',
    
    // Storage Buckets
    STORAGE_BUCKETS: {
        VIDEOS: 'videos',
        DOCUMENTS: 'documents',
        AVATARS: 'avatars'
    },
    
    // File Type Limits (in MB)
    FILE_LIMITS: {
        video: 500,
        pdf: 50,
        pptx: 100,
        docx: 50,
        xlsx: 50
    },
    
    // Allowed File Types
    ALLOWED_TYPES: {
        video: ['video/mp4', 'video/avi', 'video/quicktime'],
        pdf: ['application/pdf'],
        pptx: ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
        docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        xlsx: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
    },
    
    // Role Paths
    ROLE_PATHS: {
        admin: 'admin-dashboard.html',
        teacher: 'teacher-dashboard.html',
        student: 'student-dashboard.html'
    },
    
    // Session Storage Keys
    STORAGE_KEYS: {
        USER: 'iris_user',
        SESSION: 'iris_session',
        TOKEN: 'iris_token',
        PREFERENCES: 'iris_preferences'
    },
    
    // Notifications
    NOTIFICATIONS: {
        TIMEOUT: 3000,
        POSITION: 'top-right'
    },
    
    // Pagination
    PAGINATION: {
        DEFAULT_PAGE_SIZE: 20,
        MAX_PAGE_SIZE: 100
    }
};

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}