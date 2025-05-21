class pCollisionForce extends Force {
    constructor(particles, restitution = 1) {
        super();
        this.particles = particles;
        this.restitution = restitution;
        this.margin = 1;
    }

    apply() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                this.resolveCollision(this.particles[i], this.particles[j]);
            }
        }
    }

    resolveCollision(p1, p2) {
        // distance
        const dx = p2.position.x - p1.position.x;
        const dy = p2.position.y - p1.position.y;
        const distSquared = dx * dx + dy * dy;

        // min distance
        const minDist = p1.radius + p2.radius + this.margin;

        if (distSquared <= minDist * minDist) {
            // actual distance
            const dist = Math.sqrt(distSquared);

            const overlap = (minDist - dist) / 2;

            // p1 to p2
            const nx = dx / dist;
            const ny = dy / dist;

            if (!p1.fixed && !p2.fixed) {
                p1.position.x -= overlap * nx;
                p1.position.y -= overlap * ny;
                p2.position.x += overlap * nx;
                p2.position.y += overlap * ny;

                const rvx = p2.velocity.x - p1.velocity.x;
                const rvy = p2.velocity.y - p1.velocity.y;
                const velAlongNormal = rvx * nx + rvy * ny;
                if (velAlongNormal > 0) return;

                // impulse
                const j = -(1 + this.restitution) * velAlongNormal;
                const impulse = j / (1 / p1.mass + 1 / p2.mass);
                p1.velocity.x -= impulse * nx / p1.mass;
                p1.velocity.y -= impulse * ny / p1.mass;
                p2.velocity.x += impulse * nx / p2.mass;
                p2.velocity.y += impulse * ny / p2.mass;
            } else if (p1.fixed) {
                p2.position.x += overlap * 2 * nx;
                p2.position.y += overlap * 2 * ny;
                const dot = p2.velocity.x * nx + p2.velocity.y * ny;
                p2.velocity.x = p2.velocity.x - 2 * dot * nx * this.restitution;
                p2.velocity.y = p2.velocity.y - 2 * dot * ny * this.restitution;
            } else if (p2.fixed) {
                p1.position.x -= overlap * 2 * nx;
                p1.position.y -= overlap * 2 * ny;
                const dot = p1.velocity.x * nx + p1.velocity.y * ny;
                p1.velocity.x = p1.velocity.x - 2 * dot * nx * this.restitution;
                p1.velocity.y = p1.velocity.y - 2 * dot * ny * this.restitution;
            }
        }
    }
}