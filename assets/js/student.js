// Student Dashboard Script

class StudentDashboard {
    constructor() {
        this.student = auth.getCurrentUser();
        this.init();
    }

    init() {
        if (!auth.isLoggedIn() || !auth.hasRole('student')) {
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

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').classList.add('hidden');
            });
        });
    }

    handleNavigation(e) {
        const pageName = e.currentTarget.dataset.page;
        if (!pageName) return;

        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        e.currentTarget.classList.add('active');

        // Update page title
        const title = e.currentTarget.textContent.trim();
        document.getElementById('pageTitle').textContent = title;

        // Show selected page
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        const pageElement = document.getElementById(pageName + 'Page');
        if (pageElement) {
            pageElement.classList.add('active');
        }
    }

    async loadDashboard() {
        try {
            // Load student data
            this.loadProgressData();
            this.loadSubjects();
            this.loadResources();
            this.loadAnnouncements();
            
            // Update user info
            document.getElementById('userName').textContent = this.student.full_name || 'Student';
        } catch (error) {
            console.error('Error loading dashboard:', error);
            notify.error('Failed to load dashboard');
        }
    }

    async loadProgressData() {
        // Mock data for progress
        const overallProgress = 45;
        document.getElementById('overallProgressPercent').textContent = overallProgress + '%';
        
        // Update progress circle
        const circumference = 2 * Math.PI * 45;
        const offset = circumference - (overallProgress / 100) * circumference;
        const progressFill = document.getElementById('overallProgressFill');
        if (progressFill) {
            progressFill.style.strokeDasharray = circumference;
            progressFill.style.strokeDashoffset = offset;
        }
    }

    async loadSubjects() {
        // Mock subject data
        const subjects = [
            { id: '1', name: 'Mathematics', teacher: 'John Teacher', progress: 65 },
            { id: '2', name: 'English', teacher: 'Sarah Smith', progress: 45 },
            { id: '3', name: 'Science', teacher: 'Mike Johnson', progress: 30 }
        ];

        const subjectCards = document.getElementById('subjectProgressCards');
        if (subjectCards) {
            subjectCards.innerHTML = '';
            subjects.forEach(subject => {
                const card = this.createSubjectCard(subject);
                subjectCards.appendChild(card);
            });
        }
    }

    createSubjectCard(subject) {
        const card = createElement('div', 'subject-card');
        card.innerHTML = `
            <h4>${subject.name}</h4>
            <p>Teacher: ${subject.teacher}</p>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${subject.progress}%"></div>
            </div>
            <p>${subject.progress}% Complete</p>
        `;
        return card;
    }

    async loadResources() {
        // Mock resource data
        const resources = [
            { id: '1', title: 'Algebra Basics', type: 'video', subject: 'Mathematics', views: 150, uploaded: '2024-01-15' },
            { id: '2', title: 'Shakespeare Guide', type: 'pdf', subject: 'English', views: 89, uploaded: '2024-01-14' },
            { id: '3', title: 'Biology Lab', type: 'video', subject: 'Science', views: 120, uploaded: '2024-01-13' }
        ];

        const resourcesList = document.getElementById('resourcesList');
        if (resourcesList) {
            resourcesList.innerHTML = '';
            resources.forEach(resource => {
                const card = this.createResourceCard(resource);
                resourcesList.appendChild(card);
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
                    <span>${resource.subject}</span>
                    <span>${resource.views} views</span>
                </div>
                <div class="resource-actions">
                    <button class="btn btn-primary btn-small">View</button>
                    <button class="btn btn-secondary btn-small">Download</button>
                </div>
            </div>
        `;

        card.querySelector('[class*="btn-primary"]').addEventListener('click', () => {
            if (resource.type === 'video') {
                this.openVideoPlayer(resource);
            }
        });

        return card;
    }

    openVideoPlayer(resource) {
        const modal = document.getElementById('videoModal');
        document.getElementById('videoTitle').textContent = resource.title;
        document.getElementById('videoDescription').textContent = 'Quality educational content for ' + resource.subject;
        document.getElementById('viewerCount').textContent = resource.views;
        
        // Show modal
        modal.classList.remove('hidden');
    }

    async loadAnnouncements() {
        // Mock announcement data
        const announcements = [
            { id: '1', title: 'Welcome to E-Campus', message: 'Welcome to Iris E-Campus! Start exploring our learning resources.', date: '2024-01-20' },
            { id: '2', title: 'New Course Available', message: 'Advanced Mathematics course is now available for enrollment.', date: '2024-01-19' }
        ];

        const announcementsList = document.getElementById('latestAnnouncements') || document.getElementById('announcementsList');
        if (announcementsList) {
            announcementsList.innerHTML = '';
            announcements.forEach(announcement => {
                const card = this.createAnnouncementCard(announcement);
                announcementsList.appendChild(card);
            });
        }
    }

    createAnnouncementCard(announcement) {
        const card = createElement('div', 'announcement-card');
        card.innerHTML = `
            <h4>${announcement.title}</h4>
            <p>${announcement.message}</p>
            <div class="announcement-meta">${formatDate(announcement.date)}</div>
        `;
        return card;
    }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new StudentDashboard();
});