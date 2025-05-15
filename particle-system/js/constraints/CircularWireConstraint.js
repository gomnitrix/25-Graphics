class CircularWireConstraint {
    constructor(particle, centerX, centerY, radius) {
        this.particle = particle;
        this.centerX = centerX;
        this.centerY = centerY;
        this.radius = radius;
    }

    solve() {
        if (this.particle.fixed) return;

        // distance from particle to center
        const dx = this.particle.position.x - this.centerX;
        const dy = this.particle.position.y - this.centerY;
        const currentDistance = Math.sqrt(dx * dx + dy * dy);

        if (currentDistance === 0) {
            // edge case where particle is at center
            this.particle.position.x = this.centerX + this.radius;
            this.particle.position.y = this.centerY;
            return;
        }

        const dirX = dx / currentDistance;
        const dirY = dy / currentDistance;
        this.particle.position.x = this.centerX + dirX * this.radius;
        this.particle.position.y = this.centerY + dirY * this.radius;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = '#393e46';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
    }
}