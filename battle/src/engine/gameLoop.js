import { Renderer } from './renderer.js';
import { Ball } from '../entities/Ball.js';
import { AISystem } from '../systems/aiSystem.js';
import { CombatSystem } from '../systems/combatSystem.js';
import { SpawnSystem } from '../systems/spawnSystem.js';
import { CONFIG } from '../constants.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        this.renderer = new Renderer(canvas, this.ctx);
        
        this.balls = [];
        this.spikes = [];
        this.lifePickups = [];

        this.aiSystem = new AISystem(this.renderer);
        this.spawnSystem = new SpawnSystem(this.renderer, this.spikes, this.lifePickups);
        this.combatSystem = new CombatSystem(this.spawnSystem);

        this.lastTime = 0;
        this.isRunning = false;
        this.gameOver = false;
        
        this.ui = {
            hud: document.getElementById('hud'),
            gameOverScreen: document.getElementById('game-over'),
            winnerName: document.getElementById('winner-name'),
        };

        this.init();
    }

    init() {
        // Setup Balls
        this.balls = CONFIG.players.map((pConfig, index) => {
            // Place them in a triangle formation
            const angle = (index / CONFIG.players.length) * Math.PI * 2;
            const dist = this.renderer.arenaRadius * 0.5;
            const x = this.renderer.centerX + Math.cos(angle) * dist;
            const y = this.renderer.centerY + Math.sin(angle) * dist;
            return new Ball(index, pConfig, x, y);
        });

        this.spikes = [];
        this.lifePickups = [];
        // Update references for systems if they held onto the old arrays (SpawnSystem does)
        this.spawnSystem.spikes = this.spikes;
        this.spawnSystem.lifePickups = this.lifePickups;
        
        this.spawnSystem.init();
        
        this.gameOver = false;
        this.ui.gameOverScreen.style.display = 'none';
        
        this.updateHUD();
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    start() {
        this.isRunning = true;
        requestAnimationFrame((t) => this.loop(t));
    }

    resize() {
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight;
        this.renderer.resize();
    }

    loop(timestamp) {
        if (!this.isRunning) return;
        const dt = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update(dt);
        this.draw();

        requestAnimationFrame((t) => this.loop(t));
    }

    update(dt) {
        if (this.gameOver) return;

        // Cleanup inactive entities
        this.spikes = this.spikes.filter(s => s.active);
        this.lifePickups = this.lifePickups.filter(l => l.active);
        
        // Sync arrays back to systems
        this.spawnSystem.spikes = this.spikes;
        this.spawnSystem.lifePickups = this.lifePickups;

        // Update Entities
        this.spikes.forEach(s => s.update());
        this.lifePickups.forEach(l => l.update());
        
        // Systems
        this.aiSystem.update(this.balls, this.spikes, this.lifePickups);
        this.combatSystem.update(this.balls, this.spikes, this.lifePickups);

        // Check Win Condition
        const aliveBalls = this.balls.filter(b => !b.dead);
        if (aliveBalls.length <= 1) {
            this.handleGameOver(aliveBalls[0]);
        }

        this.updateHUD();
    }

    draw() {
        this.renderer.clear();
        this.renderer.drawArena();
        
        this.lifePickups.forEach(l => this.renderer.drawLifePickup(l));
        this.spikes.forEach(s => this.renderer.drawSpike(s));
        
        // Sort balls by Y to fake depth? Not strictly necessary for top-down 2D but ok
        this.balls.forEach(b => this.renderer.drawBall(b));
    }

    updateHUD() {
        // Efficient DOM update? 
        // For this assignment, innerHTML replacement is acceptable as it's simple
        this.ui.hud.innerHTML = this.balls.map(ball => `
            <div class="player-stat">
                <div class="player-name">${ball.name}</div>
                <div class="player-lives ${ball.dead ? 'dead' : ''}">
                    ${'❤️'.repeat(ball.lives)}
                </div>
                ${ball.hasSpike ? '<span>⚔️</span>' : ''}
            </div>
        `).join('');
    }

    handleGameOver(winner) {
        this.gameOver = true;
        this.ui.winnerName.textContent = winner ? winner.name : "Draw";
        this.ui.gameOverScreen.style.display = 'block';
    }
}
