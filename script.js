// Configuração inicial do Canvas e Contexto
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// --- MÁSCARAS E CAMADAS AUXILIARES ---
// Canvas temporário para montar as camadas isoladamente antes de desenhar na tela
const tempLayerCanvas = document.createElement('canvas');
const tempLayerCtx = tempLayerCanvas.getContext('2d');

// Máscara para o PRETO (Camada Topo)
const maskBlackCanvas = document.createElement('canvas');
const maskBlackCtx = maskBlackCanvas.getContext('2d');

// Máscara para o BLUR (Camada Meio)
const maskBlurCanvas = document.createElement('canvas');
const maskBlurCtx = maskBlurCanvas.getContext('2d');

// Cache da Imagem Borrada
const blurredImageCanvas = document.createElement('canvas');
const blurredCtx = blurredImageCanvas.getContext('2d');

// Carregar imagem
const bgImage = new Image();
bgImage.crossOrigin = "Anonymous"; 
bgImage.src = 'assets/image.jpg';

// Variáveis Globais
let width, height, centerX, centerY;
let containerRadius;
let animationId;

// Matrizes de Estado
// 0 = Preto, 1 = Blur, 2 = Original
let gridState = []; 
let gridCooldown = []; 

// Configuração
const CONFIG = {
    gridSize: 20,      
    gridGap: 1,        
    ballRadius: 10,
    ballSpeed: 10,     
    ballColor: '#ffffff',
    layerCooldown: 400, // Tempo de espera para cavar a próxima camada
    blurAmount: '15px'
};

const ball = {
    x: 0, y: 0, vx: 0, vy: 0, radius: CONFIG.ballRadius,
    
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

function initGrid() {
    const cols = Math.ceil(width / CONFIG.gridSize);
    const rows = Math.ceil(height / CONFIG.gridSize);
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
    const points = [
        {x: ball.x, y: ball.y},
        {x: ball.x + ball.radius/2, y: ball.y}, {x: ball.x - ball.radius/2, y: ball.y}
    ];
    const now = Date.now();

    points.forEach(p => {
        const col = Math.floor(p.x / CONFIG.gridSize);
        const row = Math.floor(p.y / CONFIG.gridSize);

        if (!gridState[col] || gridState[col][row] === undefined) return;

        const currentState = gridState[col][row];
        const rectX = col * CONFIG.gridSize;
        const rectY = row * CONFIG.gridSize;
        const size = CONFIG.gridSize - CONFIG.gridGap;

        // ESTADO 0 -> 1: Preto -> Blur
        if (currentState === 0) {
            gridState[col][row] = 1;
            gridCooldown[col][row] = now;
            
            // Fura a máscara PRETA (destination-out apaga pixels)
            maskBlackCtx.globalCompositeOperation = 'destination-out';
            maskBlackCtx.fillRect(rectX, rectY, size, size);
            maskBlackCtx.globalCompositeOperation = 'source-over';
        }
        // ESTADO 1 -> 2: Blur -> Original
        else if (currentState === 1) {
            if (now - gridCooldown[col][row] > CONFIG.layerCooldown) {
                gridState[col][row] = 2;
                
                // Fura a máscara BLUR
                maskBlurCtx.globalCompositeOperation = 'destination-out';
                maskBlurCtx.fillRect(rectX, rectY, size, size);
                maskBlurCtx.globalCompositeOperation = 'source-over';
            }
        }
    });
}

function preRenderBlur() {
    blurredImageCanvas.width = bgImage.width;
    blurredImageCanvas.height = bgImage.height;
    
    // Desenha imagem com filtro de blur
    blurredCtx.filter = `blur(${CONFIG.blurAmount})`;
    // Margem extra para evitar bordas brancas
    blurredCtx.drawImage(bgImage, -20, -20, bgImage.width + 40, bgImage.height + 40);
    blurredCtx.filter = 'none';
}

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    
    // Redimensionar todos os canvas
    canvas.width = width; canvas.height = height;
    tempLayerCanvas.width = width; tempLayerCanvas.height = height;
    maskBlackCanvas.width = width; maskBlackCanvas.height = height;
    maskBlurCanvas.width = width; maskBlurCanvas.height = height;

    centerX = width / 2;
    centerY = height / 2;
    containerRadius = Math.min(width, height) * 0.45;

    initGrid();

    // Resetar Máscaras (Começam pretas/opacas cobrindo tudo)
    [maskBlackCtx, maskBlurCtx].forEach(ctx => {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#000'; // Cor opaca
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, containerRadius, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
    });

    if (animationId) ball.init(); 
}

function render() {
    ball.update();
    updateGridState();

    // Limpar Canvas Principal
    ctx.clearRect(0, 0, width, height);

    // Definir área de recorte circular principal
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, containerRadius, 0, Math.PI * 2);
    ctx.clip();

    const diameter = containerRadius * 2;
    const drawX = centerX - containerRadius;
    const drawY = centerY - containerRadius;

    if (bgImage.complete && bgImage.naturalWidth > 0) {
        
        // --- 1. CAMADA BASE: IMAGEM ORIGINAL (Sempre desenhada no fundo) ---
        ctx.drawImage(bgImage, drawX, drawY, diameter, diameter);


        // --- 2. CAMADA MEIO: IMAGEM COM BLUR ---
        // Montamos no tempLayerCanvas para aplicar a máscara sem apagar o fundo
        tempLayerCtx.clearRect(0, 0, width, height);
        
        // A. Desenha imagem borrada
        tempLayerCtx.drawImage(blurredImageCanvas, 0, 0, blurredImageCanvas.width, blurredImageCanvas.height, drawX, drawY, diameter, diameter);
        
        // B. Aplica máscara BLUR (destination-in: mantém imagem onde a máscara existe)
        tempLayerCtx.globalCompositeOperation = 'destination-in';
        tempLayerCtx.drawImage(maskBlurCanvas, 0, 0);
        tempLayerCtx.globalCompositeOperation = 'source-over';

        // C. Desenha resultado no canvas principal
        ctx.drawImage(tempLayerCanvas, 0, 0);


        // --- 3. CAMADA TOPO: PRETO ---
        // Mesmo processo de composição
        tempLayerCtx.clearRect(0, 0, width, height);

        // A. Desenha retângulo preto
        tempLayerCtx.fillStyle = '#000';
        tempLayerCtx.fillRect(0, 0, width, height);

        // B. Aplica máscara PRETA (destination-in: mantém preto onde máscara existe)
        tempLayerCtx.globalCompositeOperation = 'destination-in';
        tempLayerCtx.drawImage(maskBlackCanvas, 0, 0);
        tempLayerCtx.globalCompositeOperation = 'source-over';

        // C. Desenha resultado no canvas principal
        ctx.drawImage(tempLayerCanvas, 0, 0);
    }

    ctx.restore(); // Fim do Clip

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
