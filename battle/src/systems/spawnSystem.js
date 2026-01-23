import { CONFIG } from '../constants.js';
import { Spike } from '../entities/Spike.js';
import { LifePickup } from '../entities/LifePickup.js';
import { randomRange } from '../engine/utils.js';

export class SpawnSystem {
    constructor(renderer, spikesList, lifeList) {
        this.renderer = renderer;
        this.spikes = spikesList; // Reference to main arrays
        this.lifePickups = lifeList;
    }

    init() {
        // Initial spawns
        this.scheduleSpikeRespawn(0);
        this.scheduleLifeRespawn(randomRange(CONFIG.life.spawnIntervalMin, CONFIG.life.spawnIntervalMax));
    }

    scheduleSpikeRespawn(delay) {
        if (delay === undefined) {
            delay = randomRange(CONFIG.spike.spawnIntervalMin, CONFIG.spike.spawnIntervalMax);
        }
        setTimeout(() => this.spawnSpike(), delay);
    }

    scheduleLifeRespawn(delay) {
        if (delay === undefined) {
            delay = randomRange(CONFIG.life.spawnIntervalMin, CONFIG.life.spawnIntervalMax);
        }
        setTimeout(() => this.spawnLife(), delay);
    }

    getRandomPositionInArena(padding) {
        const r = this.renderer.arenaRadius * 0.8; // Don't spawn too close to wall
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.sqrt(Math.random()) * r; // Uniform distribution
        return {
            x: this.renderer.centerX + Math.cos(angle) * dist,
            y: this.renderer.centerY + Math.sin(angle) * dist
        };
    }

    spawnSpike() {
        // Only spawn if we don't have too many (e.g., max 1 on field usually)
        if (this.spikes.some(s => s.active)) return;

        const pos = this.getRandomPositionInArena();
        const spike = new Spike(pos.x, pos.y);
        this.spikes.push(spike);
    }

    spawnLife() {
        // Limit number of lives on field
        if (this.lifePickups.filter(l => l.active).length >= 1) {
            this.scheduleLifeRespawn(); // Try again later
            return;
        }

        const pos = this.getRandomPositionInArena();
        const life = new LifePickup(pos.x, pos.y);
        this.lifePickups.push(life);
    }

    cleanUp() {
        // Remove inactive entities to keep arrays small
        // Modify array in place or expect main loop to handle filter?
        // Let's modify in place carefully or mark for deletion
        // For simple arrays in JS, filter is easiest, but we need to update the main reference.
        // Actually, let's just let them stay inactive and reuse or filter in GameLoop
        // Ideally, we filter.
    }
}
