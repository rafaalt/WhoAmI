// Global configuration for Battle of Balls

export const CONFIG = {
    arena: {
        backgroundColor: '#111',
        borderColor: '#333',
        borderWidth: 5,
        padding: 0.05 // 5% padding from canvas edge
    },
    game: {
        maxLives: 10,
        startLives: 5,
        livesToSizeRatio: 4, // Radius = 10 + lives * ratio
        baseRadius: 10,
        friction: 0.99, // Air resistance
        elasticity: 0.8 // Bounce factor
    },
    players: [
        { name: "Ana Paula", color: "#FF5733", image: "assets/players/player1.png" },
        { name: "Milena", color: "#33FF57", image: "assets/players/player2.png" },
        { name: "Aline", color: "#3357FF", image: "assets/players/player3.png" }
    ],
    spike: {
        spawnIntervalMin: 5000, // ms
        spawnIntervalMax: 10000,
        radius: 12,
        color: '#ff0000',
        glowColor: '#ff0000',
        rotationSpeed: 0.1
    },
    life: {
        spawnIntervalMin: 8000, // ms
        spawnIntervalMax: 15000,
        radius: 10,
        color: '#00ff00',
        glowColor: '#00ff00',
        healAmount: 1
    },
    combat: {
        knockback: 5,
        invulnerabilityTime: 1000 // ms after getting hit
    }
};
