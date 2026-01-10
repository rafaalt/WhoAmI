// Configuração inicial do Canvas e Contexto
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const frame = document.getElementById('tiktok-frame'); // Referência ao container

// --- MÁSCARAS E CAMADAS AUXILIARES ---
const tempLayerCanvas = document.createElement('canvas');
const tempLayerCtx = tempLayerCanvas.getContext('2d');

const maskBlackCanvas = document.createElement('canvas');
const maskBlackCtx = maskBlackCanvas.getContext('2d');

const maskBlurCanvas = document.createElement('canvas');
const maskBlurCtx = maskBlurCanvas.getContext('2d');

const blurredImageCanvas = document.createElement('canvas');
const blurredCtx = blurredImageCanvas.getContext('2d');

// Carregar imagem
const bgImage = new Image();
bgImage.crossOrigin = "Anonymous"; 
bgImage.src = GAME_CONFIG.images.background;

// Carregar logo
const logoImage = new Image();
logoImage.src = GAME_CONFIG.images.logo;

// Carregar som
const hitSound = new Audio(GAME_CONFIG.sound.hit);

// Variáveis Globais
let width, height, centerX, centerY;
let containerRadius;
let animationId;

let gridState = []; 
let gridCooldown = []; 

// --- ESTADOS DO JOGO ---
let currentState = STATE.MENU;
let countdownValue = 3;

// --- VARIÁVEIS DO JOGO ---
let startTime; 

// Configuração Visual e Física
const ball = {
    x: 0, y: 0, vx: 0, vy: 0, radius: PHYSICS_CONFIG.ballRadius,
    
    init() {
        const randomRadius = Math.random() * (containerRadius - this.radius - 20);
        const randomAngle = Math.random() * Math.PI * 2;
        this.x = centerX + Math.cos(randomAngle) * randomRadius;
        this.y = centerY + Math.sin(randomAngle) * randomRadius;
        
        const angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(angle) * PHYSICS_CONFIG.ballSpeed;
        this.vy = Math.sin(angle) * PHYSICS_CONFIG.ballSpeed;
    },

    update() {
        if (currentState !== STATE.PLAYING) return;

        this.x += this.vx;
        this.y += this.vy;
        
        const dx = this.x - centerX;
        const dy = this.y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = containerRadius - this.radius;

        if (dist > maxDist) {
            hitSound.currentTime = 0;
            hitSound.play().catch(e => console.log("Audio blocked:", e));

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
        if (currentState !== STATE.PLAYING) return;

        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.fillStyle = PHYSICS_CONFIG.ballColor;
        context.shadowBlur = 10;
        context.shadowColor = 'white';
        context.fill();
        context.shadowBlur = 0; 
        context.closePath();
    }
};

function initGrid() {
    const cols = Math.ceil(width / PHYSICS_CONFIG.gridSize);
    const rows = Math.ceil(height / PHYSICS_CONFIG.gridSize);
    gridState = [];
    gridCooldown = [];
    for (let c = 0; c < cols; c++) {
        gridState[c] = [];
        gridCooldown[c] = [];
        for (let r = 0; r < rows; r++) {
            gridState[c][r] = 0; 
            gridCooldown[c][r] = 0;
        }
    }
}

function updateGridState() {
    if (currentState !== STATE.PLAYING) return;

    const points = [
        {x: ball.x, y: ball.y},
        {x: ball.x + ball.radius/2, y: ball.y}, {x: ball.x - ball.radius/2, y: ball.y}
    ];
    const now = Date.now();

    points.forEach(p => {
        const col = Math.floor(p.x / PHYSICS_CONFIG.gridSize);
        const row = Math.floor(p.y / PHYSICS_CONFIG.gridSize);

        if (!gridState[col] || gridState[col][row] === undefined) return;

        const currentStateVal = gridState[col][row];
        const rectX = col * PHYSICS_CONFIG.gridSize;
        const rectY = row * PHYSICS_CONFIG.gridSize;
        const size = PHYSICS_CONFIG.gridSize - PHYSICS_CONFIG.gridGap;

        if (currentStateVal === 0) {
            gridState[col][row] = 1;
            gridCooldown[col][row] = now;
            
            maskBlackCtx.globalCompositeOperation = 'destination-out';
            maskBlackCtx.fillRect(rectX, rectY, size, size);
            maskBlackCtx.globalCompositeOperation = 'source-over';
        }
        else if (currentStateVal === 1 && PHYSICS_CONFIG.enableBlurLayer) {
            if (now - gridCooldown[col][row] > PHYSICS_CONFIG.layerCooldown) {
                gridState[col][row] = 2;
                
                maskBlurCtx.globalCompositeOperation = 'destination-out';
                maskBlurCtx.fillRect(rectX, rectY, size, size);
                maskBlurCtx.globalCompositeOperation = 'source-over';
            }
        }
    });
}

function preRenderBlur() {
    if (!bgImage.complete || bgImage.naturalWidth === 0) return;
    blurredImageCanvas.width = bgImage.width;
    blurredImageCanvas.height = bgImage.height;
    blurredCtx.filter = `blur(${PHYSICS_CONFIG.blurAmount})`;
    blurredCtx.drawImage(bgImage, -20, -20, bgImage.width + 40, bgImage.height + 40);
    blurredCtx.filter = 'none';
}

function drawScoreboard(elapsedTime) {
    const displayTime = Math.min(elapsedTime, GAME_CONFIG.duration); 
    const minutes = Math.floor(displayTime / 60000);
    const seconds = Math.floor((displayTime % 60000) / 1000);
    const text = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    const boxWidth = 200;
    const boxHeight = 70;
    const boxX = centerX - boxWidth / 2;
    const boxY = centerY - containerRadius - boxHeight - 30; 

    // --- DESENHAR LOGO ACIMA DO PLACAR ---
    if (logoImage.complete && logoImage.naturalWidth > 0) {
        const logoWidth = 200; // Largura pequena
        const scale = logoWidth / logoImage.naturalWidth;
        const logoHeight = logoImage.naturalHeight * scale;
        
        // Posiciona 10px acima do placar
        const logoX = centerX - logoWidth / 2;
        const logoY = boxY - logoHeight;
        
        ctx.drawImage(logoImage, logoX, logoY, logoWidth, logoHeight);
    }

    ctx.save();
    
    const grad = ctx.createLinearGradient(boxX, boxY, boxX, boxY + boxHeight);
    grad.addColorStop(0, '#333');
    grad.addColorStop(1, '#111');
    ctx.fillStyle = grad;
    
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 4;
    
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 10);
    ctx.fill();
    ctx.stroke();

    ctx.font = "bold 40px 'Orbitron', monospace";
    ctx.fillStyle = '#ff3300';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#ff3300';
    ctx.shadowBlur = 15;
    ctx.fillText(text, centerX, boxY + boxHeight / 2 + 3);

    ctx.restore();
}

function getLines(ctx, text, maxWidth) {
    const words = text.split(" ");
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}

function drawBottomText() {
    const startY = centerY + containerRadius + 50; 
    const maxWidth = width * 0.9; 

    ctx.save();
    ctx.textAlign = 'center';
    
    if (currentState !== STATE.GAMEOVER) {
        const fontSize = 20;
        const lineHeight = fontSize * 1.4;
        ctx.font = `${fontSize}px 'Orbitron', sans-serif`; 
        ctx.fillStyle = "#aaa";

        const text = "Em quanto tempo você consegue adivinhar esse famoso?";
        const lines = getLines(ctx, text, maxWidth);

        lines.forEach((line, i) => {
            ctx.fillText(line, centerX, startY + (i * lineHeight));
        });
    } 
    else {
        const fontSize = 40;
        ctx.font = `bold ${fontSize}px 'Orbitron', sans-serif`;
        ctx.fillStyle = "#fff";
        ctx.shadowColor = 'white';
        ctx.shadowBlur = 10;

        const lines = getLines(ctx, GAME_CONFIG.playerName, maxWidth);
        const lineHeight = fontSize * 1.2;

        lines.forEach((line, i) => {
            ctx.fillText(line, centerX, startY + (i * lineHeight));
        });

        const lastLineY = startY + (lines.length * lineHeight);
        
        ctx.font = "24px sans-serif";
        ctx.fillStyle = "#4caf50"; 
        ctx.shadowBlur = 0;
        ctx.fillText("Você acertou?", centerX, lastLineY + 10);
    }
    
    ctx.restore();
}

function startCountdown() {
    if (currentState !== STATE.MENU) return;
    
    hitSound.play().then(() => hitSound.pause()).catch(() => {});

    currentState = STATE.COUNTDOWN;
    countdownValue = 3;

    const timer = setInterval(() => {
        countdownValue--;
        if (countdownValue <= 0) {
            clearInterval(timer);
            currentState = STATE.PLAYING;
            startTime = Date.now();
        }
    }, 1000);
}

function drawOverlay() {
    if (currentState === STATE.MENU) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, containerRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = "bold 30px 'Orbitron', sans-serif";
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        // --- TEXTO QUEBRADO (TOQUE / PARA INICIAR) ---
        ctx.fillText("TOQUE", centerX, centerY - 25);
        ctx.fillText("PARA INICIAR", centerX, centerY + 25);
        
        ctx.restore();
    }
    else if (currentState === STATE.COUNTDOWN) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, containerRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = "bold 100px 'Orbitron', sans-serif";
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(countdownValue, centerX, centerY);
        ctx.restore();
    }
}

// --- AJUSTE CRÍTICO: RESIZE AGORA PEGA O TAMANHO DO CONTAINER, NÃO DA JANELA ---
function resize() {
    // Usamos clientWidth/clientHeight do frame
    width = frame.clientWidth;
    height = frame.clientHeight;
    
    // Atualiza tamanho interno do canvas
    canvas.width = width; 
    canvas.height = height;
    
    tempLayerCanvas.width = width; tempLayerCanvas.height = height;
    maskBlackCanvas.width = width; maskBlackCanvas.height = height;
    maskBlurCanvas.width = width; maskBlurCanvas.height = height;

    centerX = width / 2;
    centerY = height / 2;
    containerRadius = Math.min(width, height) * 0.35; 

    initGrid();

    [maskBlackCtx, maskBlurCtx].forEach(ctx => {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#000';
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, containerRadius, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
    });
    
    currentState = STATE.MENU;
    ball.init(); 
}

function render() {
    ball.update();
    updateGridState();

    let elapsed = 0;
    if (currentState === STATE.PLAYING) {
        elapsed = Date.now() - startTime;
        if (elapsed >= GAME_CONFIG.duration) {
            currentState = STATE.GAMEOVER;
        }
    } else if (currentState === STATE.GAMEOVER) {
        elapsed = GAME_CONFIG.duration; 
    }

    ctx.clearRect(0, 0, width, height);

    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, containerRadius, 0, Math.PI * 2);
    ctx.clip();

    const diameter = containerRadius * 2;
    const drawX = centerX - containerRadius;
    const drawY = centerY - containerRadius;

    if (bgImage.complete && bgImage.naturalWidth > 0) {
        
        ctx.drawImage(bgImage, drawX, drawY, diameter, diameter);

        if (currentState !== STATE.GAMEOVER) {
            if (PHYSICS_CONFIG.enableBlurLayer) {
                tempLayerCtx.clearRect(0, 0, width, height);
                tempLayerCtx.drawImage(blurredImageCanvas, 0, 0, blurredImageCanvas.width, blurredImageCanvas.height, drawX, drawY, diameter, diameter);
                
                tempLayerCtx.globalCompositeOperation = 'destination-in';
                tempLayerCtx.drawImage(maskBlurCanvas, 0, 0);
                tempLayerCtx.globalCompositeOperation = 'source-over';

                ctx.drawImage(tempLayerCanvas, 0, 0);
            }

            tempLayerCtx.clearRect(0, 0, width, height);
            tempLayerCtx.fillStyle = '#000';
            tempLayerCtx.fillRect(0, 0, width, height);

            tempLayerCtx.globalCompositeOperation = 'destination-in';
            tempLayerCtx.drawImage(maskBlackCanvas, 0, 0);
            tempLayerCtx.globalCompositeOperation = 'source-over';

            ctx.drawImage(tempLayerCanvas, 0, 0);
        }
    }

    ctx.restore(); 

    ctx.beginPath();
    ctx.arc(centerX, centerY, containerRadius, 0, Math.PI * 2);
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 8;
    ctx.stroke();

    ball.draw(ctx);
    drawOverlay(); 
    drawScoreboard(elapsed);
    drawBottomText();

    animationId = requestAnimationFrame(render);
}

window.addEventListener('resize', resize);
window.addEventListener('click', startCountdown);
window.addEventListener('touchstart', startCountdown);

bgImage.onload = () => {
    preRenderBlur();
    resize();
    ball.init();
    render();
};

if (bgImage.complete) {
    preRenderBlur();
    resize();
    ball.init();
    render();
}
