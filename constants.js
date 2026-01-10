// --- CONFIGURAÇÕES DO JOGO (FÁCIL ALTERAÇÃO) ---
const GAME_CONFIG = {
    playerName: "CRISTIANO RONALDO",
    images: {
        background: 'assets/image.jpg',
        logo: 'assets/logo.png'
    },
    sound: {
        hit: 'assets/sound-ball.wav'
    },
    duration: 60000 // 60 segundos
};

// --- CONFIGURAÇÃO VISUAL E FÍSICA ---
const PHYSICS_CONFIG = {
    enableBlurLayer: true, 
    gridSize: 6,      
    gridGap: 1,        
    ballRadius: 3,
    ballSpeed: 2,     
    ballColor: '#ffffff',
    layerCooldown: 400,
    blurAmount: '15px'
};

// --- ESTADOS DO JOGO ---
const STATE = {
    MENU: 0,        
    COUNTDOWN: 1,   
    PLAYING: 2,     
    GAMEOVER: 3     
};
