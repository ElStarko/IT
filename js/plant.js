// js/plant.js
class DigitalPlant {
    constructor() {
        this.stages = [
            { name: "Seed", growth: 0, image: "seed.svg" },
            { name: "Sprout", growth: 20, image: "sprout.svg" },
            { name: "Budding", growth: 40, image: "budding.svg" },
            { name: "Flowering", growth: 60, image: "flowering.svg" },
            { name: "Mature", growth: 80, image: "mature.svg" },
            { name: "Blooming", growth: 100, image: "blooming.svg" }
        ];
        this.currentStage = 0;
        this.currentGrowth = 0;
    }

    grow(amount = 20) {
        this.currentGrowth += amount;
        this.updateStage();
        this.saveProgress();
        this.render();
    }

    updateStage() {
        for (let i = this.stages.length - 1; i >= 0; i--) {
            if (this.currentGrowth >= this.stages[i].growth) {
                this.currentStage = i;
                break;
            }
        }
    }
}