import { CONFIG } from '../constants.js';

export class Ball {
    constructor(id, config, x, y) {
        this.id = id;
        this.name = config.name;
        this.color = config.color;
        
        // Position & Movement
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 5;
        this.vy = (Math.random() - 0.5) * 5;
        this.speed = 3;

        // Stats
        this.lives = CONFIG.game.startLives;
        this.radius = this.calculateRadius();
        this.dead = false;

        // Combat State
        this.hasSpike = false;
        this.invulnerableUntil = 0;

        // Assets
        this.image = new Image();
        this.image.src = config.image;
        this.imageLoaded = false;
        this.image.onload = () => { this.imageLoaded = true; };
    }

    calculateRadius() {
        return CONFIG.game.baseRadius + (this.lives * CONFIG.game.livesToSizeRatio);
    }

    updateRadius() {
        // Smooth transition could be added here, but direct set for now
        this.radius = this.calculateRadius();
    }

    takeDamage() {
        if (Date.now() < this.invulnerableUntil) return false;

        this.lives--;
        this.updateRadius();
        this.invulnerableUntil = Date.now() + CONFIG.combat.invulnerabilityTime;

        if (this.lives <= 0) {
            this.dead = true;
            this.lives = 0;
        }
        return true;
    }

    heal(amount) {
        if (this.dead) return;
        this.lives = Math.min(this.lives + amount, CONFIG.game.maxLives);
        this.updateRadius();
    }

    equipSpike() {
        this.hasSpike = true;
    }

    removeSpike() {
        this.hasSpike = false;
    }
}
