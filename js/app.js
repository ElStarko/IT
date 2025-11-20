// js/app.js
class StudyZenApp {
    constructor() {
        this.plant = new DigitalPlant();
        this.timer = new StudyTimer(
            (isStudySession) => this.handleSessionComplete(isStudySession),
            (timeLeft) => this.handleTick(timeLeft)
        );
        
        this.userData = Storage.loadProgress();
        this.initializeApp();
    }

    initializeApp() {
        // Load saved progress
        this.plant.loadProgress(this.userData.plantGrowth);
        
        // Update UI with saved data
        this.updateProgressUI();
        
        // Set up any additional event listeners
        this.setupAdditionalListeners();
        
        console.log('StudyZen app initialized!');
    }

    handleSessionComplete(isStudySession) {
        if (isStudySession) {
            // Study session completed - grow the plant!
            const newGrowth = this.plant.grow(20);
            
            // Update user data
            this.userData.plantGrowth = newGrowth;
            this.userData.totalSessions += 1;
            this.userData.totalTime += 25; // 25 minutes per session
            this.userData.lastSession = new Date().toISOString();
            this.userData.streak = Storage.calculateStreak();
            
            // Save progress
            Storage.saveProgress(this.userData);
            
            // Update UI
            this.updateProgressUI();
            
            // Show celebration
            this.showCelebration();
        } else {
            // Break session completed
            this.plant.showNotification('💫 Break time over! Ready to focus again?');
        }
    }

    handleTick(timeLeft) {
        // Optional: Add any tick-based animations or updates
        if (timeLeft === 10) {
            // Last 10 seconds pulse effect
            this.timer.timerDisplay.style.color = '#ff6b6b';
        } else if (timeLeft === 0) {
            this.timer.timerDisplay.style.color = '';
        }
    }

    updateProgressUI() {
        // Update stats
        document.getElementById('streak').textContent = `🔥 ${this.userData.streak} days`;
        document.getElementById('total-sessions').textContent = `📚 ${this.userData.totalSessions} sessions`;
        document.getElementById('session-count').textContent = this.userData.totalSessions;
        document.getElementById('total-time').textContent = `${this.userData.totalTime}min`;
        
        // Update growth percentage
        const growthPercent = document.getElementById('growth-percent');
        growthPercent.textContent = `${Math.round(this.userData.plantGrowth)}%`;
    }

    showCelebration() {
        // Add visual celebration effects
        const plantDisplay = document.getElementById('plant-display');
        
        // Create floating emojis
        this.createFloatingEmojis();
        
        // Haptic feedback (if supported)
        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
        }
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
            
            // Remove after animation
            setTimeout(() => {
                floatEmoji.remove();
            }, 2000);
        });

        // Add floating animation to CSS if not already present
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

    setupAdditionalListeners() {
        // Add any additional app-level event listeners here
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                if (this.timer.isRunning) {
                    this.timer.pause();
                } else {
                    this.timer.start();
                }
            }
        });

        // Add service worker for PWA capabilities (optional)
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(console.error);
        }
    }

    // Utility method to reset all data (for testing)
    resetAllData() {
        if (confirm('Are you sure you want to reset all progress? This cannot be undone!')) {
            Storage.clearData();
            this.userData = Storage.loadProgress();
            this.plant.loadProgress(0);
            this.timer.reset();
            this.updateProgressUI();
            this.plant.showNotification('🔄 All progress has been reset.');
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.studyZenApp = new StudyZenApp();
    
    // Add reset functionality for testing (remove in production)
    console.log('StudyZen loaded! Use studyZenApp.resetAllData() to reset progress.');
});

// Add PWA manifest (optional)
const manifest = document.createElement('link');
manifest.rel = 'manifest';
manifest.href = '/app.webmanifest';
document.head.appendChild(manifest);

// Add meta tags for mobile app experience
const viewport = document.querySelector('meta[name="viewport"]');
viewport.setAttribute('content', 'width=device-width, initial-scale=1, user-scalable=no');

const themeColor = document.createElement('meta');
themeColor.name = 'theme-color';
themeColor.content = '#4CAF50';
document.head.appendChild(themeColor);