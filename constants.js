// --- CONFIGURAÇÕES DO JOGO (FÁCIL ALTERAÇÃO) ---
const GAME_CONFIG = {
    playerName: "CRISTIANO RONALDO",
    images: {
        background: 'person/cr7.jpg',
        logo: 'assets/logo.png'
    },
    sound: {
        hit: 'assets/sound-ball.wav',
        answerCorrect: 'assets/answer-correct.mp3'
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
    enableBomb: false,
    enableMegaBall: false,
    enableLaser: false,
    enableCluster: true,

    // Configurações Gerais de Spawn
    initialSpawnDelay: 4000,
    subsequentSpawnDelay: 12000,

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
        explosionRadius: 60,

        // Tempos
        initialDelay: 5000, 
        minInterval: 12000, 
        maxInterval: 25000  
    },

    // Configuração do Mega Ball (Independente)
    megaBall: {
        radius: 15,
        image: 'assets/megaball.png', // Placeholder
        duration: 5000, // 8 segundos de efeito
        multiplier: 5, // 4x o tamanho

        // Tempos
        initialDelay: 3000,
        minInterval: 12000,
        maxInterval: 24000
    },

    // Configuração do Laser (Independente)
    laser: {
        radius: 5,
        color: '#FF0000', // Bolinha vermelha
        thickness: 20, // Espessura da linha do laser

        // Tempos
        initialDelay: 6000,
        minInterval: 12000,
        maxInterval: 28000
    },

    // Configuração do Cluster (Independente)
    cluster: {
        radius: 15,
        image: 'assets/cluster.png',
        particleCount: 8,
        particleLife: 1500,
        particleSpeed: 2,

        // Tempos
        initialDelay: 12000,
        minInterval: 16000,
        maxInterval: 40000
    }
};

// --- ESTADOS DO JOGO ---
const STATE = {
    MENU: 0,        
    COUNTDOWN: 1,   
    PLAYING: 2,     
    GAMEOVER: 3     
};
