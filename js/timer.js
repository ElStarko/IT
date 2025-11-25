class StudyTimer {
    constructor(onSessionComplete, onTick) {
        this.settings = Storage.loadSettings();
        this.studyTime = this.settings.focusTime * 60;
        this.breakTime = this.settings.breakTime * 60;
        this.isRunning = false;
        this.isStudySession = true;
        this.timeLeft = this.studyTime;
        this.interval = null;
        
        this.onSessionComplete = onSessionComplete;
        this.onTick = onTick;
        
        this.initializeElements();
    }

    initializeElements() {
        this.timerDisplay = document.getElementById('timer-display');
        this.sessionType = document.getElementById('session-type');
        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.resetBtn = document.getElementById('reset-btn');

        this.updateDisplay();
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
    }

    updateSettings(newSettings) {
        this.settings = newSettings;
        this.studyTime = this.settings.focusTime * 60;
        this.breakTime = this.settings.breakTime * 60;
        
        // Reset timer with new settings if not running
        if (!this.isRunning) {
            this.timeLeft = this.isStudySession ? this.studyTime : this.breakTime;
            this.updateDisplay();
        }
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.interval = setInterval(() => this.tick(), 1000);
            this.updateButtonStates();
            this.timerDisplay.classList.add('pulsing');
        }
    }

    pause() {
        if (this.isRunning) {
            this.isRunning = false;
            clearInterval(this.interval);
            this.updateButtonStates();
            this.timerDisplay.classList.remove('pulsing');
        }
    }

    reset() {
        this.pause();
        this.isStudySession = true;
        this.timeLeft = this.studyTime;
        this.updateDisplay();
        this.updateSessionType();
    }

    tick() {
        this.timeLeft--;
        this.updateDisplay();

        if (this.timeLeft <= 0) {
            this.completeSession();
        }

        if (this.onTick) {
            this.onTick(this.timeLeft);
        }
    }

    completeSession() {
        clearInterval(this.interval);
        this.isRunning = false;
        
        this.playCompletionSound();
        
        if (this.onSessionComplete) {
            this.onSessionComplete(this.isStudySession);
        }

        this.switchMode();
        this.updateButtonStates();
        this.timerDisplay.classList.remove('pulsing');
    }

    switchMode() {
        this.isStudySession = !this.isStudySession;
        this.timeLeft = this.isStudySession ? this.studyTime : this.breakTime;
        this.updateSessionType();
        this.updateDisplay();
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.timerDisplay.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    updateSessionType() {
        this.sessionType.textContent = this.isStudySession ? 'Focus Time' : 'Break Time';
        this.sessionType.className = `session-type ${this.isStudySession ? 'session-study' : 'session-break'}`;
    }

    updateButtonStates() {
        this.startBtn.disabled = this.isRunning;
        this.pauseBtn.disabled = !this.isRunning;
        this.startBtn.textContent = this.isRunning ? 'Running...' : 'Start Focus';
    }

    playCompletionSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.log('Audio not supported:', error);
        }
    }

    getTimeLeft() {
        return this.timeLeft;
    }

    isStudyTime() {
        return this.isStudySession;
    }

    getCurrentSettings() {
        return this.settings;
    }
}