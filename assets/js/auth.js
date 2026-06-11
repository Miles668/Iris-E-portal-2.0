// Authentication Module for Iris E-Campus

class AuthManager {
    constructor() {
        this.user = null;
        this.token = null;
        this.isAuthenticated = false;
        this.init();
    }

    init() {
        // Load user from localStorage
        const savedUser = localStorage.getItem(CONFIG.STORAGE_KEYS.USER);
        if (savedUser) {
            this.user = JSON.parse(savedUser);
            this.isAuthenticated = true;
        }
    }

    // Login user
    async login(email, password) {
        try {
            // This would integrate with Supabase Auth
            // For now, using mock authentication
            if (!email || !password) {
                throw new Error('Email and password are required');
            }

            // Mock login - Replace with actual Supabase auth
            const response = await fetch(`${CONFIG.API_BASE}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            }).catch(() => ({
                ok: false,
                json: async () => ({ error: 'Connection failed. Using demo mode.' })
            }));

            if (response.ok) {
                const data = await response.json();
                this.setUser(data.user);
                this.token = data.session.access_token;
                return { success: true, user: this.user };
            } else {
                // Demo mode for testing
                const demoUser = this.getDemoUser(email);
                if (demoUser) {
                    this.setUser(demoUser);
                    return { success: true, user: demoUser };
                }
                throw new Error('Invalid email or password');
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    // Get demo user for testing
    getDemoUser(email) {
        const demoUsers = {
            'admin@iris-tutors.com': { id: '1', email: 'admin@iris-tutors.com', full_name: 'Admin User', role: 'admin' },
            'teacher@iris-tutors.com': { id: '2', email: 'teacher@iris-tutors.com', full_name: 'John Teacher', role: 'teacher' },
            'student@iris-tutors.com': { id: '3', email: 'student@iris-tutors.com', full_name: 'Jane Student', role: 'student' }
        };
        return demoUsers[email];
    }

    // Set user and save to storage
    setUser(user) {
        this.user = user;
        this.isAuthenticated = true;
        localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(user));
    }

    // Logout user
    logout() {
        this.user = null;
        this.token = null;
        this.isAuthenticated = false;
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.TOKEN);
        window.location.href = 'login.html';
    }

    // Get current user
    getCurrentUser() {
        return this.user;
    }

    // Check if user is authenticated
    isLoggedIn() {
        return this.isAuthenticated && this.user !== null;
    }

    // Check user role
    hasRole(role) {
        return this.user && this.user.role === role;
    }

    // Check if user has any of the given roles
    hasAnyRole(roles) {
        return this.user && roles.includes(this.user.role);
    }
}

// Create global auth instance
const auth = new AuthManager();