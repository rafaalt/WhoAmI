// Configuração inicial do Canvas e Contexto
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Canvas Offscreen para a máscara
const maskCanvas = document.createElement('canvas');
const maskCtx = maskCanvas.getContext('2d');

// Carregar imagem
const bgImage = new Image();
bgImage.src = 'assets/image.jpg';

// Variáveis Globais
let width, height, centerX, centerY;
let containerRadius;
let animationId;

// Configuração Visual e Física
const CONFIG = {
    gridSize: 20,      // Tamanho do quadrado da grade
    gridGap: 1,        // Espaço entre os quadrados
    ballRadius: 10,
    ballSpeed: 10,     
    ballColor: '#ffffff'
};

// Objeto Bola
const ball = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    radius: CONFIG.ballRadius,
    
    init() {
        const randomRadius = Math.random() * (containerRadius - this.radius - 20);
        const randomAngle = Math.random() * Math.PI * 2;

        this.x = centerX + Math.cos(randomAngle) * randomRadius;
        this.y = centerY + Math.sin(randomAngle) * randomRadius;

        const angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(angle) * CONFIG.ballSpeed;
        this.vy = Math.sin(angle) * CONFIG.ballSpeed;
    },

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // --- COLISÃO CIRCULAR ---
        const dx = this.x - centerX;
        const dy = this.y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = containerRadius - this.radius;

        if (dist > maxDist) {
            const nx = dx / dist;
            const ny = dy / dist;

            this.x = centerX + nx * maxDist;
            this.y = centerY + ny * maxDist;

            const dotProduct = this.vx * nx + this.vy * ny;
            
            const chaos = (Math.random() - 0.5) * 0.2; 

            let rx = this.vx - 2 * dotProduct * nx;
            let ry = this.vy - 2 * dotProduct * ny;

            const cosC = Math.cos(chaos);
            const sinC = Math.sin(chaos);
            
            this.vx = rx * cosC - ry * sinC;
            this.vy = rx * sinC + ry * cosC;
        }
    },

    draw(context) {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.fillStyle = CONFIG.ballColor;
        context.shadowBlur = 10;
        context.shadowColor = 'white';
        context.fill();
        context.shadowBlur = 0; 
        context.closePath();
    }
};

function revealGrid() {
    const col = Math.floor(ball.x / CONFIG.gridSize);
    const row = Math.floor(ball.y / CONFIG.gridSize);

    const rectX = col * CONFIG.gridSize;
    const rectY = row * CONFIG.gridSize;

    const size = CONFIG.gridSize - CONFIG.gridGap;
    
    maskCtx.globalCompositeOperation = 'destination-out';
    maskCtx.fillRect(rectX, rectY, size, size);
    maskCtx.globalCompositeOperation = 'source-over'; 
}

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    
    canvas.width = width;
    canvas.height = height;
    
    maskCanvas.width = width;
    maskCanvas.height = height;

    centerX = width / 2;
    centerY = height / 2;
    containerRadius = Math.min(width, height) * 0.45; // 45% da tela
    
    // --- MÁSCARA INICIAL ---
    maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    maskCtx.fillStyle = '#000';
    
    maskCtx.save();
    maskCtx.beginPath();
    maskCtx.arc(centerX, centerY, containerRadius, 0, Math.PI * 2);
    maskCtx.clip();
    maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
    maskCtx.restore();

    if (animationId) ball.init(); 
}

function render() {
    ball.update();
    revealGrid();

    ctx.clearRect(0, 0, width, height);

    ctx.save();
    
    // Recorte circular
    ctx.beginPath();
    ctx.arc(centerX, centerY, containerRadius, 0, Math.PI * 2);
    ctx.clip(); 

    // --- CORREÇÃO DA IMAGEM ---
    const diameter = containerRadius * 2;
    
    if (bgImage.complete) {
        // Imagem centralizada e encaixada no círculo
        ctx.drawImage(bgImage, centerX - containerRadius, centerY - containerRadius, diameter, diameter);
    }
    
    // Desenha a máscara preta por cima
    ctx.drawImage(maskCanvas, 0, 0);

    ctx.restore(); 

    // Borda
    ctx.beginPath();
    ctx.arc(centerX, centerY, containerRadius, 0, Math.PI * 2);
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 8;
    ctx.stroke();

    ball.draw(ctx);

    animationId = requestAnimationFrame(render);
}

window.addEventListener('resize', resize);
bgImage.onload = () => {
    resize();
    ball.init();
    render();
};
if (bgImage.complete) {
    resize();
    ball.init();
    render();
}
else {
    resize();
    ball.init();
    setTimeout(() => {
        if (!animationId) render();
    }, 1000); 
}