// --- CONFIGURAÇÕES DO JOGO (FÁCIL ALTERAÇÃO) ---
const GAME_CONFIG = {
    playerName: "CRISTIANO RONALDO",
    images: {
        background: 'person/cr7.jpg',
        logo: 'assets/logo.png'
    },
    sound: {
        hit: 'assets/sound-ball.wav'
    },
    duration: 60000
};

// --- CONFIGURAÇÃO VISUAL E FÍSICA ---
const PHYSICS_CONFIG = {
    enableBlurLayer: true, 
    gridSize: 4,      
    gridGap: 0,
    ballRadius: 2,
    ballSpeed: 2,     
    ballColor: '#ffffff',
    layerCooldown: 400,
    blurAmount: '15px'
};

// --- CONFIGURAÇÃO DOS POWER-UPS ---
const POWERUP_CONFIG = {
    // Flags para ativar/desativar cada tipo
    enableStar: true,
    enableBomb: true,

    // Configuração da Estrela (Independente)
    star: {
        radius: 10,
        color: '#FFD700',
        extraBallsCount: 2,
        extraBallColors: ['#FF5733', '#33FF57', '#3357FF', '#FF33A8', '#33FFF5', '#FF8C00', '#8A2BE2', '#00CED1', '#FF1493', '#7CFC00'],
        
        // Tempos
        initialDelay: 3000,
        minInterval: 8000,  // Mínimo 8s
        maxInterval: 15000  // Máximo 15s
    },

    // Configuração da Bomba (Independente)
    bomb: {
        radius: 15, 
        image: 'assets/bomb.png',
        explosionRadius: 30,

        // Tempos
        initialDelay: 5000, // Começa um pouco depois da estrela
        minInterval: 12000, // Mínimo 12s
        maxInterval: 25000  // Máximo 25s
    }
};

// --- ESTADOS DO JOGO ---
const STATE = {
    MENU: 0,        
    COUNTDOWN: 1,   
    PLAYING: 2,     
    GAMEOVER: 3     
};
