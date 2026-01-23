import { Vector, distance, randomRange } from '../engine/utils.js';
import { CONFIG } from '../constants.js';

export class AISystem {
    constructor(renderer) {
        this.renderer = renderer;
    }

    update(balls, spikes, lifePickups) {
        const activeSpike = spikes.find(s => s.active);
        const activeLife = lifePickups.find(l => l.active);

        balls.forEach(ball => {
            if (ball.dead) return;

            let target = null;
            let action = 'WANDER'; // WANDER, SEEK_AMMO, ATTACK, SEEK_HEALTH

            // Decision Logic
            if (ball.lives <= 2 && activeLife) {
                action = 'SEEK_HEALTH';
                target = activeLife;
            } else if (!ball.hasSpike && activeSpike) {
                action = 'SEEK_AMMO';
                target = activeSpike;
            } else if (ball.hasSpike) {
                // Find closest living target
                let minDist = Infinity;
                let closestFoe = null;
                balls.forEach(other => {
                    if (other !== ball && !other.dead) {
                        const d = distance(ball.x, ball.y, other.x, other.y);
                        if (d < minDist) {
                            minDist = d;
                            closestFoe = other;
                        }
                    }
                });
                
                if (closestFoe) {
                    action = 'ATTACK';
                    target = closestFoe;
                }
            }

            // Apply Forces
            let desiredVelocity = { x: 0, y: 0 };

            if (target) {
                const diff = Vector.sub(target, ball);
                desiredVelocity = Vector.mult(Vector.normalize(diff), ball.speed);
            } else {
                // Wander: slightly random changes to velocity
                desiredVelocity = {
                    x: ball.vx + (Math.random() - 0.5),
                    y: ball.vy + (Math.random() - 0.5)
                };
                desiredVelocity = Vector.mult(Vector.normalize(desiredVelocity), ball.speed);
            }

            // Smoothing steering
            ball.vx = ball.vx * 0.9 + desiredVelocity.x * 0.1;
            ball.vy = ball.vy * 0.9 + desiredVelocity.y * 0.1;

            // Update Position
            ball.x += ball.vx;
            ball.y += ball.vy;

            // Boundary Constraint (Circular Arena)
            const distFromCenter = distance(ball.x, ball.y, this.renderer.centerX, this.renderer.centerY);
            const maxDist = this.renderer.arenaRadius - ball.radius;

            if (distFromCenter > maxDist) {
                // Bounce off wall
                const angle = Math.atan2(ball.y - this.renderer.centerY, ball.x - this.renderer.centerX);
                
                // Reset position to edge
                ball.x = this.renderer.centerX + Math.cos(angle) * maxDist;
                ball.y = this.renderer.centerY + Math.sin(angle) * maxDist;

                // Reflect velocity
                const normal = { x: Math.cos(angle), y: Math.sin(angle) };
                const dot = Vector.dot({ x: ball.vx, y: ball.vy }, normal);
                
                ball.vx = ball.vx - 2 * dot * normal.x;
                ball.vy = ball.vy - 2 * dot * normal.y;
                
                // Add some damping
                ball.vx *= CONFIG.game.elasticity;
                ball.vy *= CONFIG.game.elasticity;
            }
        });
    }
}
