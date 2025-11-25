class DigitalPlant {
    constructor() {
        this.stages = [
            { 
                name: "Seed", 
                growth: 0, 
                emoji: "🌱",
                message: "Your learning journey begins!"
            },
            { 
                name: "Sprout", 
                growth: 20, 
                emoji: "🌿",
                message: "Your plant is sprouting! Keep going!"
            },
            { 
                name: "Budding", 
                growth: 40, 
                emoji: "🍀",
                message: "Look at those buds! You're growing well!"
            },
            { 
                name: "Flowering", 
                growth: 60, 
                emoji: "🌴",
                message: "Beautiful flowers! Your dedication shows!"
            },
            { 
                name: "Mature", 
                growth: 80, 
                emoji: "🌳",
                message: "What a strong plant! You're doing amazing!"
            },
            { 
                name: "Blooming", 
                growth: 100, 
                emoji: "🌺",
                message: "Fully bloomed! You've mastered consistency!"
            }
        ];
        this.currentStage = 0;
        this.currentGrowth = 0;
    }

    grow(amount = 20) {
        const oldStage = this.currentStage;
        this.currentGrowth = Math.min(100, this.currentGrowth + amount);
        this.updateStage();
        
        if (oldStage !== this.currentStage) {
            this.celebrateStageUp();
        }
        
        this.render();
        return this.currentGrowth;
    }

    updateStage() {
        for (let i = this.stages.length - 1; i >= 0; i--) {
            if (this.currentGrowth >= this.stages[i].growth) {
                this.currentStage = i;
                break;
            }
        }
    }

    celebrateStageUp() {
        const stage = this.stages[this.currentStage];
        this.showNotification(`🎉 ${stage.message}`);
        
        const plantEmoji = document.getElementById('plant-emoji');
        plantEmoji.classList.add('growing');
        setTimeout(() => {
            plantEmoji.classList.remove('growing');
        }, 1000);
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

    render() {
        const plantEmoji = document.getElementById('plant-emoji');
        const stageName = document.getElementById('stage-name');
        const growthProgress = document.getElementById('growth-progress');
        const growthPercent = document.getElementById('growth-percent');
        const currentStageElement = document.getElementById('current-stage');

        plantEmoji.textContent = this.stages[this.currentStage].emoji;
        stageName.textContent = this.stages[this.currentStage].name;
        growthProgress.style.width = `${this.currentGrowth}%`;
        growthPercent.textContent = `${Math.round(this.currentGrowth)}%`;
        currentStageElement.textContent = this.stages[this.currentStage].name;
    }

    getGrowthData() {
        return {
            growth: this.currentGrowth,
            stage: this.currentStage,
            stageName: this.stages[this.currentStage].name
        };
    }

    loadProgress(growth) {
        this.currentGrowth = growth;
        this.updateStage();
        this.render();
    }
}