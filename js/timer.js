// js/timer.js
class StudyTimer {
    constructor() {
        this.studyTime = 25 * 60; // 25 minutes
        this.breakTime = 5 * 60;  // 5 minutes
        this.isRunning = false;
        this.isStudySession = true;
        this.timeLeft = this.studyTime;
    }

    start() {
        this.isRunning = true;
        this.interval = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            if (this.timeLeft <= 0) {
                this.completeSession();
            }
        }, 1000);
    }

    completeSession() {
        clearInterval(this.interval);
        if (this.isStudySession) {
            this.growPlant(); // Plant grows after study session
            playSuccessSound();
        }
        this.switchMode();
    }
}