const Storage = {
    // These methods are now user-aware and will use the auth system
    saveProgress(data) {
        if (window.auth && window.auth.currentUser) {
            window.auth.updateUserProgress(data);
            return true;
        }
        return false;
    },

    loadProgress() {
        if (window.auth && window.auth.currentUser) {
            return window.auth.getUserProgress();
        }
        return {
            plantGrowth: 0,
            totalSessions: 0,
            totalTime: 0,
            lastSession: null,
            streak: 0
        };
    },

    saveSettings(settings) {
        if (window.auth && window.auth.currentUser) {
            window.auth.updateUserSettings(settings);
            return true;
        }
        return false;
    },

    loadSettings() {
        if (window.auth && window.auth.currentUser) {
            return window.auth.getUserSettings();
        }
        return {
            focusTime: 25,
            breakTime: 5
        };
    },

    calculateStreak() {
        const data = this.loadProgress();
        if (!data.lastSession) return 0;

        const lastSession = new Date(data.lastSession);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (lastSession.toDateString() === today.toDateString()) {
            return data.streak;
        } else if (lastSession.toDateString() === yesterday.toDateString()) {
            return data.streak + 1;
        } else if (today.getDate() === lastSession.getDate() + 1) {
            return data.streak + 1;
        } else {
            return 1;
        }
    },

    // Clear all data (for testing)
    clearData() {
        localStorage.removeItem('studyzen-users');
        localStorage.removeItem('studyzen-current-user');
    }
};