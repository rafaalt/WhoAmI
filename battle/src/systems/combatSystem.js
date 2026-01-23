import { checkCircleCollision, distance, Vector } from '../engine/utils.js';
import { CONFIG } from '../constants.js';

export class CombatSystem {
    constructor(spawnSystem) {
        this.spawnSystem = spawnSystem;
    }

    update(balls, spikes, lifePickups) {
        // Ball vs Ball Collisions
        for (let i = 0; i < balls.length; i++) {
            for (let j = i + 1; j < balls.length; j++) {
                const b1 = balls[i];
                const b2 = balls[j];

                if (b1.dead || b2.dead) continue;

                if (checkCircleCollision(b1, b2)) {
                    this.resolveBallCollision(b1, b2);
                }
            }
        }

        // Ball vs Spike
        spikes.forEach(spike => {
            if (!spike.active) return;
            balls.forEach(ball => {
                if (ball.dead) return;
                if (!ball.hasSpike && checkCircleCollision(ball, spike)) {
                    ball.equipSpike();
                    spike.active = false;
                    this.spawnSystem.scheduleSpikeRespawn();
                }
            });
        });

        // Ball vs Life
        lifePickups.forEach(life => {
            if (!life.active) return;
            balls.forEach(ball => {
                if (ball.dead) return;
                if (checkCircleCollision(ball, life)) {
                    ball.heal(CONFIG.life.healAmount);
                    life.active = false;
                    this.spawnSystem.scheduleLifeRespawn();
                }
            });
        });
    }

    resolveBallCollision(b1, b2) {
        // 1. Separate them to prevent sticking
        const dist = distance(b1.x, b1.y, b2.x, b2.y);
        const overlap = (b1.radius + b2.radius) - dist;
        
        if (overlap > 0) {
            const dx = b2.x - b1.x;
            const dy = b2.y - b1.y;
            // Normalized vector from b1 to b2
            const nx = dx / dist;
            const ny = dy / dist;

            // Push apart proportional to inverse mass (assume mass ~ radius, but let's just do 50/50 for now)
            b1.x -= nx * overlap * 0.5;
            b1.y -= ny * overlap * 0.5;
            b2.x += nx * overlap * 0.5;
            b2.y += ny * overlap * 0.5;

            // Bounce effect (Velocity Exchange)
            // Simplified elastic collision
            const v1n = b1.vx * nx + b1.vy * ny;
            const v2n = b2.vx * nx + b2.vy * ny;

            // Swap normal velocities
            const m1 = b1.radius; // Mass proxy
            const m2 = b2.radius;
            
            // Conservation of momentum formula
            const v1nFinal = (v1n * (m1 - m2) + 2 * m2 * v2n) / (m1 + m2);
            const v2nFinal = (v2n * (m2 - m1) + 2 * m1 * v1n) / (m1 + m2);

            b1.vx += (v1nFinal - v1n) * nx;
            b1.vy += (v1nFinal - v1n) * ny;
            b2.vx += (v2nFinal - v2n) * nx;
            b2.vy += (v2nFinal - v2n) * ny;
        }

        // 2. Combat Logic
        if (b1.hasSpike && !b2.hasSpike) {
            this.applyHit(b1, b2);
        } else if (b2.hasSpike && !b1.hasSpike) {
            this.applyHit(b2, b1);
        } else if (b1.hasSpike && b2.hasSpike) {
            // Clash! Both lose spike? Or bounce hard? 
            // Let's make both lose spike
            b1.removeSpike();
            b2.removeSpike();
            this.spawnSystem.scheduleSpikeRespawn();
            this.spawnSystem.scheduleSpikeRespawn(); // Two spikes lost
            
            // Add extra knockback
            // (Already handled by physics above mostly, but could add shake)
        }
    }

    applyHit(attacker, victim) {
        // Victim takes damage
        const hurt = victim.takeDamage();
        
        if (hurt) {
            // Attacker loses spike
            attacker.removeSpike();
            this.spawnSystem.scheduleSpikeRespawn();
            
            // Knockback logic is partly handled by physics, but we can exaggerate it
            // Vector from attacker to victim
            const dx = victim.x - attacker.x;
            const dy = victim.y - attacker.y;
            const len = Math.sqrt(dx*dx + dy*dy);
            const nx = dx / len;
            const ny = dy / len;
            
            victim.vx += nx * CONFIG.combat.knockback;
            victim.vy += ny * CONFIG.combat.knockback;
        }
    }
}
