const Storage = {
    KEY: 'studyzen-data',
    SETTINGS_KEY: 'studyzen-settings',

    saveProgress(data) {
        try {
            const saveData = {
                plantGrowth: data.plantGrowth,
                totalSessions: data.totalSessions,
                totalTime: data.totalTime,
                lastSession: data.lastSession,
                streak: data.streak,
                lastSave: new Date().toISOString()
            };
            localStorage.setItem(this.KEY, JSON.stringify(saveData));
            return true;
        } catch (error) {
            console.error('Failed to save progress:', error);
            return false;
        }
    },

    loadProgress() {
        try {
            const data = JSON.parse(localStorage.getItem(this.KEY));
            if (data) {
                return {
                    plantGrowth: data.plantGrowth || 0,
                    totalSessions: data.totalSessions || 0,
                    totalTime: data.totalTime || 0,
                    lastSession: data.lastSession || null,
                    streak: data.streak || 0
                };
            }
        } catch (error) {
            console.error('Failed to load progress:', error);
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
        try {
            localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('Failed to save settings:', error);
            return false;
        }
    },

    loadSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem(this.SETTINGS_KEY));
            if (settings) {
                return settings;
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
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

    clearData() {
        localStorage.removeItem(this.KEY);
        localStorage.removeItem(this.SETTINGS_KEY);
    }
};