import { Game } from './engine/gameLoop.js';

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    if (!canvas) {
        console.error("Canvas element not found!");
        return;
    }

    const game = new Game(canvas);
    game.start();
});
