class Auth {
    constructor() {
        this.currentUser = null;
        this.users = this.loadUsers();
        this.initializeAuth();
    }

    initializeAuth() {
        this.setupEventListeners();
        this.checkExistingSession();
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Form switching
        document.getElementById('show-signup').addEventListener('click', (e) => {
            e.preventDefault();
            this.switchTab('signup');
        });

        document.getElementById('show-login').addEventListener('click', (e) => {
            e.preventDefault();
            this.switchTab('login');
        });

        // Form submissions
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        document.getElementById('signup-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignup();
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.handleLogout();
        });
    }

    switchTab(tab) {
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        // Show active form
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.toggle('active', form.id === `${tab}-form`);
        });

        // Clear form errors
        this.clearFormErrors();
    }

    handleLogin() {
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;

        this.clearFormErrors();

        if (!username || !password) {
            this.showError('login', 'Please fill in all fields');
            return;
        }

        const user = this.authenticateUser(username, password);
        if (user) {
            this.login(user);
        } else {
            this.showError('login', 'Invalid username or password');
        }
    }

    handleSignup() {
        const username = document.getElementById('signup-username').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;

        this.clearFormErrors();

        // Validation
        if (!username || !email || !password || !confirmPassword) {
            this.showError('signup', 'Please fill in all fields');
            return;
        }

        if (username.length < 3) {
            this.showError('signup', 'Username must be at least 3 characters');
            return;
        }

        if (password.length < 6) {
            this.showError('signup', 'Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            this.showError('signup', 'Passwords do not match');
            return;
        }

        if (this.userExists(username)) {
            this.showError('signup', 'Username already exists');
            return;
        }

        // Create new user
        const user = this.createUser(username, email, password);
        this.login(user);
        this.showNotification('🎉 Account created successfully!');
    }

    authenticateUser(username, password) {
        return this.users.find(user => 
            user.username === username && user.password === password
        );
    }

    userExists(username) {
        return this.users.some(user => user.username === username);
    }

    createUser(username, email, password) {
        const newUser = {
            id: this.generateId(),
            username,
            email,
            password, // In a real app, this would be hashed
            createdAt: new Date().toISOString(),
            progress: {
                plantGrowth: 0,
                totalSessions: 0,
                totalTime: 0,
                lastSession: null,
                streak: 0
            },
            settings: {
                focusTime: 25,
                breakTime: 5
            }
        };

        this.users.push(newUser);
        this.saveUsers();
        return newUser;
    }

    login(user) {
        this.currentUser = user;
        this.saveCurrentUser();
        this.hideAuthModal();
        this.showApp();
        this.updateUserGreeting();
        
        // Notify app about user change
        if (window.studyZenApp) {
            window.studyZenApp.onUserLogin(user);
        }
    }

    handleLogout() {
        this.currentUser = null;
        localStorage.removeItem('studyzen-current-user');
        this.showAuthModal();
        this.hideApp();
        this.showNotification('👋 Logged out successfully!');
    }

    checkExistingSession() {
        const savedUser = localStorage.getItem('studyzen-current-user');
        if (savedUser) {
            const user = JSON.parse(savedUser);
            // Verify user still exists
            if (this.userExists(user.username)) {
                this.login(user);
            } else {
                localStorage.removeItem('studyzen-current-user');
            }
        }
    }

    updateUserProgress(progress) {
        if (!this.currentUser) return;

        this.currentUser.progress = progress;
        this.saveCurrentUser();
        this.updateUserInStorage();
    }

    updateUserSettings(settings) {
        if (!this.currentUser) return;

        this.currentUser.settings = settings;
        this.saveCurrentUser();
        this.updateUserInStorage();
    }

    updateUserInStorage() {
        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            this.users[userIndex] = this.currentUser;
            this.saveUsers();
        }
    }

    // Storage methods
    loadUsers() {
        try {
            const users = localStorage.getItem('studyzen-users');
            return users ? JSON.parse(users) : [];
        } catch (error) {
            console.error('Failed to load users:', error);
            return [];
        }
    }

    saveUsers() {
        try {
            localStorage.setItem('studyzen-users', JSON.stringify(this.users));
        } catch (error) {
            console.error('Failed to save users:', error);
        }
    }

    saveCurrentUser() {
        try {
            localStorage.setItem('studyzen-current-user', JSON.stringify(this.currentUser));
        } catch (error) {
            console.error('Failed to save current user:', error);
        }
    }

    // UI methods
    showAuthModal() {
        document.getElementById('auth-modal').classList.remove('hidden');
    }

    hideAuthModal() {
        document.getElementById('auth-modal').classList.add('hidden');
    }

    showApp() {
        document.getElementById('app-container').classList.remove('hidden');
    }

    hideApp() {
        document.getElementById('app-container').classList.add('hidden');
    }

    updateUserGreeting() {
        if (this.currentUser) {
            const greeting = document.getElementById('user-greeting');
            greeting.textContent = `Hello, ${this.currentUser.username}!`;
        }
    }

    showError(formType, message) {
        const form = document.getElementById(`${formType}-form`);
        let errorElement = form.querySelector('.error-message');
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            form.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }

    clearFormErrors() {
        document.querySelectorAll('.error-message').forEach(el => {
            el.classList.remove('show');
        });
    }

    showNotification(message) {
        const notification = document.getElementById('notification');
        const notificationText = document.getElementById('notification-text');
        
        notificationText.textContent = message;
        notification.classList.remove('hidden');
        
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 3000);
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getUserProgress() {
        return this.currentUser ? this.currentUser.progress : null;
    }

    getUserSettings() {
        return this.currentUser ? this.currentUser.settings : null;
    }
}