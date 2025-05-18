class Particle {
    constructor(x, y, mass = 50) {
        this.position = { x, y };
        this.prevPosition = { x, y };
        this.velocity = { x: 0, y: 0 };
        this.force = { x: 0, y: 0 };
        this.currentForce = { x: 0, y: 0 };
        this.mass = mass;
        this.fixed = false;
    }

    applyForce(fx, fy) {
        if (!this.fixed) {
            this.force.x += fx;
            this.force.y += fy;
        }
    }

    update(dt) {
        this.force.x = 0;
        this.force.y = 0;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = this.fixed ? '#ffd369' : '#ff5722';
        ctx.fill();
        ctx.closePath();
    }
} 