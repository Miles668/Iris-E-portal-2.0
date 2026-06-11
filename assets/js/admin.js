// Admin Dashboard Script

class AdminDashboard {
    constructor() {
        this.admin = auth.getCurrentUser();
        this.init();
    }

    init() {
        if (!auth.isLoggedIn() || !auth.hasRole('admin')) {
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
            document.getElementById('totalTeachers').textContent = '8';
            document.getElementById('totalStudents').textContent = '127';
            document.getElementById('totalSubjects').textContent = '15';
            document.getElementById('totalResources').textContent = '234';

            // Load recent activity
            this.loadRecentActivity();
            
            document.getElementById('userName').textContent = this.admin.full_name || 'Admin';
        } catch (error) {
            console.error('Error loading dashboard:', error);
            notify.error('Failed to load dashboard');
        }
    }

    async loadRecentActivity() {
        const activities = [
            { action: 'New teacher registered', date: '2024-01-20', time: '10:30 AM' },
            { action: '5 new students enrolled', date: '2024-01-20', time: '09:15 AM' },
            { action: 'New subject created: Biology', date: '2024-01-19', time: '02:45 PM' },
            { action: '20 resources uploaded', date: '2024-01-19', time: '11:20 AM' }
        ];

        const container = document.getElementById('recentActivity');
        if (container) {
            container.innerHTML = '';
            activities.forEach(activity => {
                const item = createElement('div', 'activity-item');
                item.innerHTML = `
                    <div class="activity-content">
                        <p class="activity-action">${activity.action}</p>
                        <span class="activity-time">${formatDate(activity.date)} at ${activity.time}</span>
                    </div>
                `;
                container.appendChild(item);
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AdminDashboard();
});