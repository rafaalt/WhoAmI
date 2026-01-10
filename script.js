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

const answerCorrectSound = new Audio(GAME_CONFIG.sound.answerCorrect); // Novo som



// Imagens para PowerUps

const bombImage = new Image(); 

bombImage.src = POWERUP_CONFIG.bomb.image;



const megaBallImage = new Image();

megaBallImage.src = POWERUP_CONFIG.megaBall.image;



const clusterImage = new Image();

clusterImage.src = POWERUP_CONFIG.cluster.image;



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

let balls = []; // Array para armazenar todas as bolas



// --- GERENCIAMENTO DE POWER-UPS ---

let activePowerUps = []; // Lista de power-ups ativos na tela

let nextStarSpawnTime = 0; 

let nextBombSpawnTime = 0;

let nextMegaBallSpawnTime = 0;

let nextLaserSpawnTime = 0;

let nextClusterSpawnTime = 0;



let hasPlayedGameOverSound = false; // Flag para garantir que o som só toque uma vez no GAMEOVER



// Efeito Mega Ball

let megaBallActive = false;

let megaBallEndTime = 0;



// Tipos de PowerUp

const POWERUP_TYPE = {

    STAR: 'star',

    BOMB: 'bomb',

    MEGABALL: 'megaball',

    LASER: 'laser',

    CLUSTER: 'cluster'

};



// Classe Ball

class Ball {

    constructor(color = PHYSICS_CONFIG.ballColor, isTemporary = false, lifeTime = 0) {

        this.baseRadius = PHYSICS_CONFIG.ballRadius;

        this.radius = this.baseRadius;

        this.color = color;

        this.x = 0;

        this.y = 0;

        this.vx = 0;

        this.vy = 0;

        

        // Propriedades para Cluster (bolas temporárias)

        this.isTemporary = isTemporary;

        this.lifeTime = lifeTime;

        this.creationTime = Date.now();

        this.markedForDeletion = false;



        this.init();

    }

    

    init() {

        // Se for temporária, spawna no powerup (será sobrescrito), senão aleatório

        if (!this.isTemporary) {

            const randomRadius = Math.random() * (containerRadius - this.radius - 20);

            const randomAngle = Math.random() * Math.PI * 2;

            this.x = centerX + Math.cos(randomAngle) * randomRadius;

            this.y = centerY + Math.sin(randomAngle) * randomRadius;

        } else {

             // Posição será definida externamente ao spawnar do cluster

             this.x = centerX;

             this.y = centerY;

        }

        

        const angle = Math.random() * Math.PI * 2;

        const speed = this.isTemporary ? POWERUP_CONFIG.cluster.particleSpeed : PHYSICS_CONFIG.ballSpeed;

        this.vx = Math.cos(angle) * speed;

        this.vy = Math.sin(angle) * speed;

    }



    update() {

        if (currentState !== STATE.PLAYING) return;



        // Verificar tempo de vida para bolas temporárias

        if (this.isTemporary) {

            if (Date.now() - this.creationTime > this.lifeTime) {

                this.markedForDeletion = true;

                return;

            }

        }



        // Lógica Mega Ball (Aumentar raio se ativo)

        if (megaBallActive && !this.isTemporary) {

            this.radius = this.baseRadius * POWERUP_CONFIG.megaBall.multiplier;

        } else {

            this.radius = this.baseRadius;

        }



        this.x += this.vx;

        this.y += this.vy;

        

        const dx = this.x - centerX;

        const dy = this.y - centerY;

        const dist = Math.sqrt(dx * dx + dy * dy);

        const maxDist = containerRadius - this.radius;



        if (dist > maxDist) {

            // Reproduz som com debounce leve

            if (hitSound.paused) {

                 hitSound.play().catch(e => {});

            } else {

                 hitSound.currentTime = 0;

            }



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

    }



    draw(context) {

        if (currentState !== STATE.PLAYING) return;



        context.beginPath();

        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

        context.fillStyle = this.color;

        context.shadowBlur = 10;

        context.shadowColor = 'white';

        context.fill();

        context.shadowBlur = 0; 

        context.closePath();

    }

}

// Classe PowerUp Base
class PowerUp {
    constructor(type) {
        this.type = type;
        this.active = true;
        this.x = 0;
        this.y = 0;
        this.id = Math.random().toString(36).substr(2, 9); // ID único para remoção segura
        
        if (type === POWERUP_TYPE.STAR) {
            this.radius = POWERUP_CONFIG.star.radius;
            this.color = POWERUP_CONFIG.star.color;
        } else if (type === POWERUP_TYPE.BOMB) {
            this.radius = POWERUP_CONFIG.bomb.radius;
            this.color = '#FF4500';
        } else if (type === POWERUP_TYPE.MEGABALL) {
            this.radius = POWERUP_CONFIG.megaBall.radius;
            this.color = '#800080'; // Roxo fallback
        } else if (type === POWERUP_TYPE.LASER) {
            this.radius = POWERUP_CONFIG.laser.radius;
            this.color = POWERUP_CONFIG.laser.color;
        } else if (type === POWERUP_TYPE.CLUSTER) {
            this.radius = POWERUP_CONFIG.cluster.radius;
            this.color = '#00CED1'; // Turquesa fallback
        }

        this.spawn();
    }

    spawn() {
        const randomRadius = Math.random() * (containerRadius - this.radius * 2);
        const randomAngle = Math.random() * Math.PI * 2;
        this.x = centerX + Math.cos(randomAngle) * randomRadius;
        this.y = centerY + Math.sin(randomAngle) * randomRadius;
    }

    draw(ctx) {
        if (!this.active) return;
        
        if (this.type === POWERUP_TYPE.STAR) {
            drawStar(ctx, this.x, this.y, 5, this.radius, this.radius / 2, this.color);
        } 
        else if (this.type === POWERUP_TYPE.BOMB) {
            this.drawImageOrFallback(ctx, bombImage, this.color, '!');
        }
        else if (this.type === POWERUP_TYPE.MEGABALL) {
            this.drawImageOrFallback(ctx, megaBallImage, this.color, 'M');
        }
        else if (this.type === POWERUP_TYPE.CLUSTER) {
            this.drawImageOrFallback(ctx, clusterImage, this.color, 'C');
        }
        else if (this.type === POWERUP_TYPE.LASER) {
            // Desenhar bolinha vermelha para o laser
            ctx.save();
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Ícone de raio simples
            ctx.beginPath();
            ctx.moveTo(this.x - 3, this.y - 5);
            ctx.lineTo(this.x + 3, this.y);
            ctx.lineTo(this.x - 3, this.y);
            ctx.lineTo(this.x + 3, this.y + 5);
            ctx.strokeStyle = '#FFFF00';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            ctx.restore();
        }
    }

    drawImageOrFallback(ctx, img, color, text) {
        if (img.complete && img.naturalWidth > 0) {
            const drawSize = this.radius * 2;
            ctx.drawImage(img, this.x - this.radius, this.y - this.radius, drawSize, drawSize);
        } else {
            ctx.save();
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, this.x, this.y);
            ctx.restore();
        }
    }
}

function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius, color) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    let step = Math.PI / spikes;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#fff'; 
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
}

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

    // Coletar pontos de todas as bolas ativas
    const points = [];
    balls.forEach(ball => {
        points.push({x: ball.x, y: ball.y});
        points.push({x: ball.x + ball.radius/2, y: ball.y});
        points.push({x: ball.x - ball.radius/2, y: ball.y});
    });

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

function explodeBomb(x, y) {
    const radius = POWERUP_CONFIG.bomb.explosionRadius;
    const now = Date.now();

    // Atualiza a grade na área da explosão
    const startCol = Math.floor((x - radius) / PHYSICS_CONFIG.gridSize);
    const endCol = Math.ceil((x + radius) / PHYSICS_CONFIG.gridSize);
    const startRow = Math.floor((y - radius) / PHYSICS_CONFIG.gridSize);
    const endRow = Math.ceil((y + radius) / PHYSICS_CONFIG.gridSize);

    for (let c = startCol; c < endCol; c++) {
        for (let r = startRow; r < endRow; r++) {
            if (gridState[c] && gridState[c][r] !== undefined) {
                // Verificar se está dentro do raio circular
                const rectX = c * PHYSICS_CONFIG.gridSize;
                const rectY = r * PHYSICS_CONFIG.gridSize;
                const dist = Math.sqrt(Math.pow(rectX - x, 2) + Math.pow(rectY - y, 2));
                const size = PHYSICS_CONFIG.gridSize;

                if (dist < radius) {
                    const currentStateVal = gridState[c][r];
                    
                    if (currentStateVal === 0) {
                        // Preto -> Blur
                        gridState[c][r] = 1;
                        // Atualiza cooldown para evitar que a bolinha revele instantaneamente o próximo layer
                        gridCooldown[c][r] = now; 

                        maskBlackCtx.globalCompositeOperation = 'destination-out';
                        maskBlackCtx.fillRect(rectX, rectY, size, size);
                        maskBlackCtx.globalCompositeOperation = 'source-over';
                    } 
                    else if (currentStateVal === 1) {
                        // Blur -> Original
                        gridState[c][r] = 2;
                        
                        if (PHYSICS_CONFIG.enableBlurLayer) {
                            maskBlurCtx.globalCompositeOperation = 'destination-out';
                            maskBlurCtx.fillRect(rectX, rectY, size, size);
                            maskBlurCtx.globalCompositeOperation = 'source-over';
                        }
                    }
                }
            }
        }
    }
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
            
            // Definir timers iniciais para spawn
            nextStarSpawnTime = startTime + POWERUP_CONFIG.star.initialDelay;
            nextBombSpawnTime = startTime + POWERUP_CONFIG.bomb.initialDelay;
            nextMegaBallSpawnTime = startTime + POWERUP_CONFIG.megaBall.initialDelay;
            nextLaserSpawnTime = startTime + POWERUP_CONFIG.laser.initialDelay;
            nextClusterSpawnTime = startTime + POWERUP_CONFIG.cluster.initialDelay;
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
    balls = [new Ball()]; // Reinicia com uma bola
    activePowerUps = [];  // Limpa power-ups
    nextStarSpawnTime = 0;
    nextBombSpawnTime = 0;
    nextMegaBallSpawnTime = 0;
    nextLaserSpawnTime = 0;
    nextClusterSpawnTime = 0;
    
    megaBallActive = false;
    megaBallEndTime = 0;
    
    hasPlayedGameOverSound = false; // Resetar flag
}

// Função auxiliar para tempo aleatório
function getRandomInterval(min, max) {
    return Math.random() * (max - min) + min;
}

function fireLaser(x, y) {
    // Escolher direção aleatória: Horizontal ou Vertical
    const isHorizontal = Math.random() > 0.5;
    const thickness = POWERUP_CONFIG.laser.thickness;
    const halfThick = thickness / 2;

    if (isHorizontal) {
        // Revelar linha horizontal
        const startRow = Math.floor((y - halfThick) / PHYSICS_CONFIG.gridSize);
        const endRow = Math.ceil((y + halfThick) / PHYSICS_CONFIG.gridSize);
        const cols = gridState.length;

        for (let c = 0; c < cols; c++) {
            for (let r = startRow; r < endRow; r++) {
                if (gridState[c] && gridState[c][r] !== undefined) {
                     revealCell(c, r);
                }
            }
        }
    } else {
        // Revelar coluna vertical
        const startCol = Math.floor((x - halfThick) / PHYSICS_CONFIG.gridSize);
        const endCol = Math.ceil((x + halfThick) / PHYSICS_CONFIG.gridSize);
        const rows = gridState[0].length; // Assumindo grade uniforme

        for (let c = startCol; c < endCol; c++) {
            if (!gridState[c]) continue;
            for (let r = 0; r < rows; r++) {
                 revealCell(c, r);
            }
        }
    }
}

function revealCell(c, r) {
    const currentStateVal = gridState[c][r];
    const rectX = c * PHYSICS_CONFIG.gridSize;
    const rectY = r * PHYSICS_CONFIG.gridSize;
    const size = PHYSICS_CONFIG.gridSize;

    // Forçar revelação total (remove preto e blur)
    gridState[c][r] = 2;

    maskBlackCtx.globalCompositeOperation = 'destination-out';
    maskBlackCtx.fillRect(rectX, rectY, size, size);
    maskBlackCtx.globalCompositeOperation = 'source-over';

    if (PHYSICS_CONFIG.enableBlurLayer) {
        maskBlurCtx.globalCompositeOperation = 'destination-out';
        maskBlurCtx.fillRect(rectX, rectY, size, size);
        maskBlurCtx.globalCompositeOperation = 'source-over';
    }
}

function spawnCluster(x, y) {
    const count = POWERUP_CONFIG.cluster.particleCount;
    const life = POWERUP_CONFIG.cluster.particleLife;
    const colors = POWERUP_CONFIG.star.extraBallColors; // Reusar cores

    for (let i = 0; i < count; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const b = new Ball(color, true, life);
        b.x = x;
        b.y = y;
        balls.push(b);
    }
}

function updatePowerUps() {
    const now = Date.now();

    // --- SPAWNERS ---
    
    // 1. Estrela
    if (POWERUP_CONFIG.enableStar && now >= nextStarSpawnTime && nextStarSpawnTime > 0) {
        activePowerUps.push(new PowerUp(POWERUP_TYPE.STAR));
        nextStarSpawnTime = now + getRandomInterval(POWERUP_CONFIG.star.minInterval, POWERUP_CONFIG.star.maxInterval);
    }

    // 2. Bomba
    if (POWERUP_CONFIG.enableBomb && now >= nextBombSpawnTime && nextBombSpawnTime > 0) {
        activePowerUps.push(new PowerUp(POWERUP_TYPE.BOMB));
        nextBombSpawnTime = now + getRandomInterval(POWERUP_CONFIG.bomb.minInterval, POWERUP_CONFIG.bomb.maxInterval);
    }

    // 3. Mega Ball
    if (POWERUP_CONFIG.enableMegaBall && now >= nextMegaBallSpawnTime && nextMegaBallSpawnTime > 0) {
        activePowerUps.push(new PowerUp(POWERUP_TYPE.MEGABALL));
        nextMegaBallSpawnTime = now + getRandomInterval(POWERUP_CONFIG.megaBall.minInterval, POWERUP_CONFIG.megaBall.maxInterval);
    }

    // 4. Laser
    if (POWERUP_CONFIG.enableLaser && now >= nextLaserSpawnTime && nextLaserSpawnTime > 0) {
        activePowerUps.push(new PowerUp(POWERUP_TYPE.LASER));
        nextLaserSpawnTime = now + getRandomInterval(POWERUP_CONFIG.laser.minInterval, POWERUP_CONFIG.laser.maxInterval);
    }

    // 5. Cluster
    if (POWERUP_CONFIG.enableCluster && now >= nextClusterSpawnTime && nextClusterSpawnTime > 0) {
        activePowerUps.push(new PowerUp(POWERUP_TYPE.CLUSTER));
        nextClusterSpawnTime = now + getRandomInterval(POWERUP_CONFIG.cluster.minInterval, POWERUP_CONFIG.cluster.maxInterval);
    }

    // --- MEGA BALL TIMER ---
    if (megaBallActive && now > megaBallEndTime) {
        megaBallActive = false;
    }

    // --- COLISÕES ---
    for (let i = activePowerUps.length - 1; i >= 0; i--) {
        const p = activePowerUps[i];
        if (!p.active) continue;

        let collected = false;
        
        for (let b of balls) {
            const dx = b.x - p.x;
            const dy = b.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < b.radius + p.radius) {
                collected = true;
                break; 
            }
        }

        if (collected) {
            // Aplicar efeito
            if (p.type === POWERUP_TYPE.STAR) {
                const count = POWERUP_CONFIG.star.extraBallsCount;
                const colors = POWERUP_CONFIG.star.extraBallColors;
                for (let k = 0; k < count; k++) {
                    const color = colors[Math.floor(Math.random() * colors.length)];
                    balls.push(new Ball(color));
                }
            } 
            else if (p.type === POWERUP_TYPE.BOMB) {
                explodeBomb(p.x, p.y);
            }
            else if (p.type === POWERUP_TYPE.MEGABALL) {
                megaBallActive = true;
                megaBallEndTime = now + POWERUP_CONFIG.megaBall.duration;
            }
            else if (p.type === POWERUP_TYPE.LASER) {
                fireLaser(p.x, p.y);
            }
            else if (p.type === POWERUP_TYPE.CLUSTER) {
                spawnCluster(p.x, p.y);
            }

            // Remover do array
            activePowerUps.splice(i, 1);
        }
    }

    // Remover bolas temporárias marcadas para deleção
    for (let i = balls.length - 1; i >= 0; i--) {
        if (balls[i].markedForDeletion) {
            balls.splice(i, 1);
        }
    }
}

function render() {
    // Lógica de atualização
    if (currentState === STATE.PLAYING) {
        balls.forEach(b => b.update());
        
        let elapsed = Date.now() - startTime;
        
        updatePowerUps();
        updateGridState();

        if (elapsed >= GAME_CONFIG.duration) {
            if (currentState !== STATE.GAMEOVER) { // Check if just entered GAMEOVER state
                currentState = STATE.GAMEOVER;
                if (!hasPlayedGameOverSound) {
                    answerCorrectSound.play().catch(e => console.log("Audio blocked:", e));
                    hasPlayedGameOverSound = true;
                }
            }
        }
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

    // Desenhar PowerUps Ativos
    if (currentState === STATE.PLAYING) {
        activePowerUps.forEach(p => p.draw(ctx));
    }

    balls.forEach(b => b.draw(ctx));
    
    drawOverlay(); 
    drawScoreboard(currentState === STATE.PLAYING ? Date.now() - startTime : (currentState === STATE.GAMEOVER ? GAME_CONFIG.duration : 0));
    drawBottomText();

    animationId = requestAnimationFrame(render);
}

window.addEventListener('resize', resize);
window.addEventListener('click', startCountdown);
window.addEventListener('touchstart', startCountdown);

bgImage.onload = () => {
    preRenderBlur();
    resize();
    render();
};

if (bgImage.complete) {
    preRenderBlur();
    resize();
    render();
}