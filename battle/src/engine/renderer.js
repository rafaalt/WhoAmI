import { CONFIG } from '../constants.js';

export class Renderer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.width = canvas.width;
        this.height = canvas.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        // Arena radius is based on the smallest dimension to fit in screen
        this.arenaRadius = (Math.min(this.width, this.height) / 2) * (1 - CONFIG.arena.padding);
    }

    resize() {
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        this.arenaRadius = (Math.min(this.width, this.height) / 2) * (1 - CONFIG.arena.padding);
    }

    clear() {
        this.ctx.fillStyle = CONFIG.arena.backgroundColor;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    drawArena() {
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, this.arenaRadius, 0, Math.PI * 2);
        this.ctx.strokeStyle = CONFIG.arena.borderColor;
        this.ctx.lineWidth = CONFIG.arena.borderWidth;
        this.ctx.stroke();
        this.ctx.closePath();
    }

    drawBall(ball) {
        if (ball.dead) return;

        const ctx = this.ctx;
        ctx.save();
        ctx.translate(ball.x, ball.y);

        // Draw Spike Ring if armed
        if (ball.hasSpike) {
            ctx.beginPath();
            const spikeCount = 8;
            for (let i = 0; i < spikeCount; i++) {
                const angle = (i / spikeCount) * Math.PI * 2;
                const outerR = ball.radius + 8;
                const innerR = ball.radius;
                const sx = Math.cos(angle) * outerR;
                const sy = Math.sin(angle) * outerR;
                ctx.moveTo(Math.cos(angle - 0.2) * innerR, Math.sin(angle - 0.2) * innerR);
                ctx.lineTo(sx, sy);
                ctx.lineTo(Math.cos(angle + 0.2) * innerR, Math.sin(angle + 0.2) * innerR);
            }
            ctx.fillStyle = '#ff0000';
            ctx.fill();
        }

        // Draw Ball Body
        ctx.beginPath();
        ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = ball.color;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#fff';
        ctx.stroke();
        ctx.closePath();

        // Draw Image
        if (ball.imageLoaded) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(ball.image, -ball.radius, -ball.radius, ball.radius * 2, ball.radius * 2);
            ctx.restore();
        } else {
            // Fallback Text
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(ball.name.substring(0, 2).toUpperCase(), 0, 0);
        }

        // Draw Lives Indicator (simple dots above)
        /*
        const dotSize = 3;
        const gap = 2;
        const totalWidth = (ball.lives * dotSize) + ((ball.lives - 1) * gap);
        let startX = -totalWidth / 2 + dotSize/2;
        
        ctx.fillStyle = '#fff';
        for (let i = 0; i < ball.lives; i++) {
            ctx.beginPath();
            ctx.arc(startX + i * (dotSize + gap), -ball.radius - 8, dotSize, 0, Math.PI * 2);
            ctx.fill();
        }
        */

        ctx.restore();
    }

    drawSpike(spike) {
        if (!spike.active) return;
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(spike.x, spike.y);
        ctx.rotate(spike.rotation);

        // Glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = CONFIG.spike.glowColor;

        ctx.fillStyle = CONFIG.spike.color;
        ctx.beginPath();
        // Star shape
        for (let i = 0; i < 5; i++) {
            ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * spike.radius,
                       Math.sin((18 + i * 72) * Math.PI / 180) * spike.radius);
            ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * (spike.radius / 2),
                       Math.sin((54 + i * 72) * Math.PI / 180) * (spike.radius / 2));
        }
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    drawLifePickup(pickup) {
        if (!pickup.active) return;
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(pickup.x, pickup.y);
        
        // Pulse effect
        const scale = 1 + Math.sin(pickup.pulse) * 0.1;
        ctx.scale(scale, scale);

        // Glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = CONFIG.life.glowColor;

        ctx.fillStyle = CONFIG.life.color;
        
        // Cross shape
        const r = pickup.radius;
        const t = r / 3; // thickness
        
        ctx.beginPath();
        ctx.fillRect(-t, -r, t*2, r*2);
        ctx.fillRect(-r, -t, r*2, t*2);
        
        ctx.restore();
    }
}
