import { CONFIG } from '../constants.js';

export class Spike {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = CONFIG.spike.radius;
        this.active = true;
        this.rotation = 0;
    }

    update() {
        this.rotation += CONFIG.spike.rotationSpeed;
    }
}
