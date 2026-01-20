// --- CONFIGURAÇÕES DO JOGO (FÁCIL ALTERAÇÃO) ---
const GAME_CONFIG = {
    playerName: "ANA PAULA",
    images: {
        background: 'person/ana.png',
        logo: 'assets/logo.png'
    },
    sound: {
        hit: 'assets/sounds/sound-ball.wav',
        answerCorrect: 'assets/sounds/answer-correct.mp3',
        taken: 'assets/sounds/taken.mp3'
    },
    texts: {
        title: "Acerte o famoso!",
        subtitle: "Em quanto tempo você consegue adivinhar esse famoso?",
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
    ballRadius: 2,
    ballVisualRadius: 8,
    ballSpeed: 1.3,     
    ballColor: '#ffffff',
    layerCooldown: 400,
    blurAmount: '15px'
};

// --- CONFIGURAÇÃO DOS POWER-UPS ---
const POWERUP_CONFIG = {
    // Flags para ativar/desativar cada tipo
    enableStar: true,
    enableBomb: true,
    enableMegaBall: true,
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
        initialDelay: 5000,
        minInterval: 10000,
        maxInterval: 35000
    },

    // Configuração da Bomba (Independente)
    bomb: {
        radius: 13, 
        image: 'assets/bomb.png',
        explosionRadius: 30,

        // Tempos
        initialDelay: 9000, 
        minInterval: 14000, 
        maxInterval: 40000  
    },

    // Configuração do Mega Ball (Independente)
    megaBall: {
        radius: 15,
        image: 'assets/megaball.png', // Placeholder
        duration: 2500, // 8 segundos de efeito
        visualMultiplier: 1.5, 
        revealMultiplier: 2,

        // Tempos
        initialDelay: 20000,
        minInterval: 20000,
        maxInterval: 40000
    },

    // Configuração do Laser (Independente)
    laser: {
        radius: 11,
        color: '#FF0000', // Bolinha vermelha
        thickness: 20, // Espessura da linha do laser

        // Tempos
        initialDelay: 9000, 
        minInterval: 14000, 
        maxInterval: 40000  
    },

    // Configuração do Cluster (Independente)
    cluster: {
        radius: 15,
        image: 'assets/cluster.png',
        particleCount: 5,
        particleLife: 1500,
        particleSpeed: 2,

        // Tempos
        initialDelay: 20000,
        minInterval: 30000,
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
