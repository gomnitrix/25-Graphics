class DistanceConstraint {
    constructor(particle1, particle2, distance) {
        this.particle1 = particle1;
        this.particle2 = particle2;
        this.distance = distance;
    }

    solve() {
        const dx = this.particle2.position.x - this.particle1.position.x;
        const dy = this.particle2.position.y - this.particle1.position.y;
        const currentDistance = Math.sqrt(dx * dx + dy * dy);
        
        if (currentDistance === 0) {
            console.error('DistanceConstraint: error, currentDistance is 0');
            return;
        }

        const diff = (currentDistance - this.distance) / currentDistance;
        const correctionX = dx * 0.5 * diff;
        const correctionY = dy * 0.5 * diff;

        if (!this.particle1.fixed) {
            this.particle1.position.x += correctionX;
            this.particle1.position.y += correctionY;
        }
        if (!this.particle2.fixed) {
            this.particle2.position.x -= correctionX;
            this.particle2.position.y -= correctionY;
        }
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.particle1.position.x, this.particle1.position.y);
        ctx.lineTo(this.particle2.position.x, this.particle2.position.y);
        ctx.strokeStyle = '#222831';
        ctx.stroke();
        ctx.closePath();
    }
} 