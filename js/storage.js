// js/storage.js
const Storage = {
    saveProgress() {
        const data = {
            plantGrowth: plant.currentGrowth,
            totalSessions: this.getTotalSessions() + 1,
            lastSession: new Date().toISOString(),
            streak: this.calculateStreak()
        };
        localStorage.setItem('studyzen-data', JSON.stringify(data));
    },

    loadProgress() {
        const data = JSON.parse(localStorage.getItem('studyzen-data'));
        return data || {
            plantGrowth: 0,
            totalSessions: 0,
            lastSession: null,
            streak: 0
        };
    }
};