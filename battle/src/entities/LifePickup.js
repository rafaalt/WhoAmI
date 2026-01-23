import { CONFIG } from '../constants.js';

export class LifePickup {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = CONFIG.life.radius;
        this.active = true;
        this.pulse = 0;
    }

    update() {
        this.pulse += 0.05;
    }
}
