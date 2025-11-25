class StudyZenApp {
    constructor() {
        // Wait for auth to be initialized
        setTimeout(() => {
            this.initializeApp();
        }, 100);
    }

    initializeApp() {
        // Only initialize if user is logged in
        if (window.auth && window.auth.currentUser) {
            this.plant = new DigitalPlant();
            this.timer = new StudyTimer(
                (isStudySession) => this.handleSessionComplete(isStudySession),
                (timeLeft) => this.handleTick(timeLeft)
            );
            
            this.userData = Storage.loadProgress();
            this.settings = Storage.loadSettings();
            this.setupApp();
        }
    }

    onUserLogin(user) {
        // Re-initialize app when user logs in
        this.initializeApp();
    }

    setupApp() {
        // Load saved progress
        this.plant.loadProgress(this.userData.plantGrowth);
        
        // Update UI with saved data
        this.updateProgressUI();
        
        // Setup settings modal
        this.setupSettingsModal();
        
        console.log('StudyZen app initialized for user:', window.auth.currentUser.username);
    }

    setupSettingsModal() {
        const settingsBtn = document.getElementById('settings-btn');
        const settingsModal = document.getElementById('settings-modal');
        const closeSettings = document.getElementById('close-settings');
        const saveSettings = document.getElementById('save-settings');
        const focusTimeInput = document.getElementById('focus-time');
        const breakTimeInput = document.getElementById('break-time');

        // Load current settings into inputs
        focusTimeInput.value = this.settings.focusTime;
        breakTimeInput.value = this.settings.breakTime;

        // Event listeners for settings modal
        settingsBtn.addEventListener('click', () => {
            settingsModal.classList.remove('hidden');
        });

        closeSettings.addEventListener('click', () => {
            settingsModal.classList.add('hidden');
        });

        saveSettings.addEventListener('click', () => {
            this.saveNewSettings();
            settingsModal.classList.add('hidden');
        });

        // Close modal when clicking outside
        settingsModal.addEventListener('click', (e) => {
            if (e.target === settingsModal) {
                settingsModal.classList.add('hidden');
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !settingsModal.classList.contains('hidden')) {
                settingsModal.classList.add('hidden');
            }
        });
    }

    saveNewSettings() {
        const focusTimeInput = document.getElementById('focus-time');
        const breakTimeInput = document.getElementById('break-time');

        const newSettings = {
            focusTime: parseInt(focusTimeInput.value) || 25,
            breakTime: parseInt(breakTimeInput.value) || 5
        };

        // Validate settings
        if (newSettings.focusTime < 1 || newSettings.focusTime > 60) {
            this.showNotification('❌ Focus time must be between 1-60 minutes');
            return;
        }

        if (newSettings.breakTime < 1 || newSettings.breakTime > 30) {
            this.showNotification('❌ Break time must be between 1-30 minutes');
            return;
        }

        this.settings = newSettings;
        Storage.saveSettings(this.settings);
        this.timer.updateSettings(this.settings);
        
        this.showNotification('✅ Settings saved!');
    }

    handleSessionComplete(isStudySession) {
        if (isStudySession) {
            const newGrowth = this.plant.grow(20);
            
            this.userData.plantGrowth = newGrowth;
            this.userData.totalSessions += 1;
            this.userData.totalTime += this.settings.focusTime;
            this.userData.lastSession = new Date().toISOString();
            this.userData.streak = Storage.calculateStreak();
            
            Storage.saveProgress(this.userData);
            this.updateProgressUI();
            this.showCelebration();
        } else {
            this.showNotification('💫 Break time over! Ready to focus again?');
        }
    }

    handleTick(timeLeft) {
        if (timeLeft === 10) {
            this.timer.timerDisplay.style.color = '#ff6b6b';
        } else if (timeLeft === 0) {
            this.timer.timerDisplay.style.color = '';
        }
    }

    updateProgressUI() {
        document.getElementById('streak').textContent = `🔥 ${this.userData.streak} days`;
        document.getElementById('total-sessions').textContent = `📚 ${this.userData.totalSessions} sessions`;
        document.getElementById('session-count').textContent = this.userData.totalSessions;
        document.getElementById('total-time').textContent = `${this.userData.totalTime}min`;
    }

    showCelebration() {
        this.createFloatingEmojis();
        
        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
        }
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

    createFloatingEmojis() {
        const emojis = ['🎉', '🌟', '💫', '✨', '🌱', '📚'];
        const container = document.querySelector('.plant-container');
        
        emojis.forEach((emoji, index) => {
            const floatEmoji = document.createElement('div');
            floatEmoji.textContent = emoji;
            floatEmoji.style.cssText = `
                position: absolute;
                font-size: 1.5rem;
                pointer-events: none;
                z-index: 10;
                opacity: 0;
                animation: floatUp 2s ease-in forwards;
                left: ${50 + (Math.random() - 0.5) * 100}px;
            `;
            
            container.style.position = 'relative';
            container.appendChild(floatEmoji);
            
            setTimeout(() => {
                floatEmoji.remove();
            }, 2000);
        });

        if (!document.querySelector('#float-animation')) {
            const style = document.createElement('style');
            style.id = 'float-animation';
            style.textContent = `
                @keyframes floatUp {
                    0% {
                        transform: translateY(0) scale(1);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-100px) scale(0.5);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Utility method to reset all data (for testing)
    resetAllData() {
        if (confirm('Are you sure you want to reset all progress? This cannot be undone!')) {
            Storage.clearData();
            this.userData = Storage.loadProgress();
            this.settings = Storage.loadSettings();
            this.plant.loadProgress(0);
            this.timer.reset();
            this.updateProgressUI();
            this.showNotification('🔄 All progress has been reset.');
        }
    }
}

// Initialize auth first, then app
document.addEventListener('DOMContentLoaded', () => {
    window.auth = new Auth();
    window.studyZenApp = new StudyZenApp();
    
    console.log('StudyZen loaded! Users are stored in localStorage.');
});