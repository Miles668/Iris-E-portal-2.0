// Teacher Dashboard Script

class TeacherDashboard {
    constructor() {
        this.teacher = auth.getCurrentUser();
        this.init();
    }

    init() {
        if (!auth.isLoggedIn() || !auth.hasRole('teacher')) {
            window.location.href = 'login.html';
            return;
        }

        this.setupEventListeners();
        this.loadDashboard();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => this.handleNavigation(e));
        });

        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                document.querySelector('.sidebar').classList.toggle('open');
            });
        }

        // User menu
        const userMenuBtn = document.getElementById('userMenuBtn');
        const userDropdown = document.querySelector('.user-dropdown');
        if (userMenuBtn) {
            userMenuBtn.addEventListener('click', () => {
                userDropdown.classList.toggle('hidden');
            });
        }

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                auth.logout();
            });
        }

        // Upload and announcement buttons
        const uploadBtn = document.getElementById('uploadResourceBtn');
        const announcementBtn = document.getElementById('createAnnouncementBtn');
        if (uploadBtn) uploadBtn.addEventListener('click', () => this.showUploadModal());
        if (announcementBtn) announcementBtn.addEventListener('click', () => this.showAnnouncementModal());
    }

    handleNavigation(e) {
        const pageName = e.currentTarget.dataset.page;
        if (!pageName) return;

        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        e.currentTarget.classList.add('active');

        document.getElementById('pageTitle').textContent = e.currentTarget.textContent.trim();
    }

    async loadDashboard() {
        try {
            // Mock statistics
            document.getElementById('totalSubjects').textContent = '3';
            document.getElementById('totalResources').textContent = '12';
            document.getElementById('videoCount').textContent = '8';
            document.getElementById('totalViews').textContent = '450';

            // Load recent resources
            this.loadRecentResources();
            
            document.getElementById('userName').textContent = this.teacher.full_name || 'Teacher';
        } catch (error) {
            console.error('Error loading dashboard:', error);
            notify.error('Failed to load dashboard');
        }
    }

    async loadRecentResources() {
        const resources = [
            { id: '1', title: 'Algebra Basics', type: 'video', views: 150, date: '2024-01-15' },
            { id: '2', title: 'Geometry Worksheets', type: 'pdf', views: 89, date: '2024-01-14' },
            { id: '3', title: 'Math Formulas', type: 'docx', views: 120, date: '2024-01-13' }
        ];

        const container = document.getElementById('recentResources');
        if (container) {
            container.innerHTML = '';
            resources.forEach(resource => {
                const card = this.createResourceCard(resource);
                container.appendChild(card);
            });
        }
    }

    createResourceCard(resource) {
        const card = createElement('div', 'resource-card');
        const icon = getFileTypeIcon(resource.type);
        
        card.innerHTML = `
            <div class="resource-thumbnail">${icon}</div>
            <div class="resource-info">
                <h4>${resource.title}</h4>
                <div class="resource-meta">
                    <span>${resource.views} views</span>
                    <span>${formatDate(resource.date)}</span>
                </div>
                <div class="resource-actions">
                    <button class="btn btn-secondary btn-small">Edit</button>
                    <button class="btn btn-danger btn-small">Delete</button>
                </div>
            </div>
        `;
        return card;
    }

    showUploadModal() {
        alert('Upload resource modal would appear here. Implement modal for resource upload.');
    }

    showAnnouncementModal() {
        alert('Create announcement modal would appear here. Implement modal for announcements.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TeacherDashboard();
});