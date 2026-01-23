// Math and Helper Utils

export function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

export function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// Vector operations
export const Vector = {
    add: (v1, v2) => ({ x: v1.x + v2.x, y: v1.y + v2.y }),
    sub: (v1, v2) => ({ x: v1.x - v2.x, y: v1.y - v2.y }),
    mult: (v, n) => ({ x: v.x * n, y: v.y * n }),
    mag: (v) => Math.sqrt(v.x * v.x + v.y * v.y),
    normalize: (v) => {
        const m = Math.sqrt(v.x * v.x + v.y * v.y);
        return m === 0 ? { x: 0, y: 0 } : { x: v.x / m, y: v.y / m };
    },
    dot: (v1, v2) => v1.x * v2.x + v1.y * v2.y
};

export function checkCircleCollision(c1, c2) {
    const dist = distance(c1.x, c1.y, c2.x, c2.y);
    return dist < c1.radius + c2.radius;
}
