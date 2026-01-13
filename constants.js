// --- CONFIGURAÇÕES DO JOGO (FÁCIL ALTERAÇÃO) ---
const GAME_CONFIG = {
    playerName: "OS INCRÍVEIS",
    images: {
        background: 'person/incriveis.png',
        logo: 'assets/logo.png'
    },
    sound: {
        hit: 'assets/sounds/sound-ball.wav',
        answerCorrect: 'assets/sounds/answer-correct.mp3',
        taken: 'assets/sounds/taken.mp3'
    },
    texts: {
        title: "Acerte o filme!",
        subtitle: "Em quanto tempo você consegue adivinhar esse filme?",
        victory: "Você acertou?",
        follow: ""
    },
    duration: 60000
};

// --- CONFIGURAÇÃO VISUAL E FÍSICA ---
const PHYSICS_CONFIG = {
    enableBlurLayer: true, 
    gridSize: 6,      
    gridGap: 0,
    ballRadius: 3,
    ballVisualRadius: 8,
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
    enableMegaBall: false,
    enableLaser: false,
    enableCluster: false,

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
        minInterval: 10000,
        maxInterval: 20000
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
        visualMultiplier: 2, 
        revealMultiplier: 4,

        // Tempos
        initialDelay: 3000,
        minInterval: 12000,
        maxInterval: 24000
    },

    // Configuração do Laser (Independente)
    laser: {
        radius: 10,
        color: '#FF0000', // Bolinha vermelha
        thickness: 20, // Espessura da linha do laser

        // Tempos
        initialDelay: 7000,
        minInterval: 12000,
        maxInterval: 28000
    },

    // Configuração do Cluster (Independente)
    cluster: {
        radius: 15,
        image: 'assets/cluster.png',
        particleCount: 6,
        particleLife: 1800,
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
