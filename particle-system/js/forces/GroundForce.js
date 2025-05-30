class GroundForce {
    constructor(canvas, restitution = 0.5, friction = 0.8) {
        this.canvas = canvas;
        this.restitution = restitution;
        this.friction = friction;
        this.margin = 5; // margin for the ground and walls
    }

    apply(particles) {
        const w = this.canvas.width, h = this.canvas.height;
        for (const p of particles) {
            // ground
            if (p.position.y + p.radius > h - this.margin) {
                p.position.y = h - this.margin - p.radius;
                const vy = p.position.y - p.prevPosition.y;
                p.prevPosition.y = p.position.y + vy * this.restitution;
                p.velocity.y *= -this.restitution;
                p.velocity.x *= this.friction;
            }
            // ceiling
            if (p.position.y - p.radius < this.margin) {
                p.position.y = this.margin + p.radius;
                const vy = p.position.y - p.prevPosition.y;
                p.prevPosition.y = p.position.y + vy * this.restitution;
                p.velocity.y *= -this.restitution;
                p.velocity.x *= this.friction;
            }
            // left wall
            if (p.position.x - p.radius < this.margin) {
                p.position.x = this.margin + p.radius;
                const vx = p.position.x - p.prevPosition.x;
                p.prevPosition.x = p.position.x + vx * this.restitution;
                p.velocity.x *= -this.restitution;
                p.velocity.y *= this.friction;
            }
            // right wall
            if (p.position.x + p.radius > w - this.margin) {
                p.position.x = w - this.margin - p.radius;
                const vx = p.position.x - p.prevPosition.x;
                p.prevPosition.x = p.position.x + vx * this.restitution;
                p.velocity.x *= -this.restitution;
                p.velocity.y *= this.friction;
            }
        }
    }
} 