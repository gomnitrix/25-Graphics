class RodConstraint2 extends Constraint {
    constructor(p1, p2, length) {
        super();
        this.p1 = p1;
        this.p2 = p2;
        this.length = length;
        this.feedbackforces = [
            new SpringForce(p1, p2, length, 20.0, 0.5)
        ];
    }

    // C = sqrt(dx^2 + dy^2) - L
    evaluateC() {
        const dx = this.p1.position.x - this.p2.position.x;
        const dy = this.p1.position.y - this.p2.position.y;
        return Math.hypot(dx, dy) - this.length;
    }

    // Ċ = (dx·dvx + dy·dvy) / distance
    evaluateCdot() {
        const dx = this.p1.position.x - this.p2.position.x;
        const dy = this.p1.position.y - this.p2.position.y;
        const dist = Math.hypot(dx, dy);
        if (dist === 0) return 0;

        const dvx = this.p1.velocity.x - this.p2.velocity.x;
        const dvy = this.p1.velocity.y - this.p2.velocity.y;
        return (dx * dvx + dy * dvy) / dist;
    }

    // J = [dx/dist, dy/dist, -dx/dist, -dy/dist]
    computeJacobian() {
        const dx = this.p1.position.x - this.p2.position.x;
        const dy = this.p1.position.y - this.p2.position.y;
        const dist = Math.hypot(dx, dy);
        if (dist === 0) return [0, 0, 0, 0];

        const inv = 1 / dist;
        return [dx * inv, dy * inv, -dx * inv, -dy * inv];
    }

    computeJacobianDot() {
        const dx = this.p1.position.x - this.p2.position.x;
        const dy = this.p1.position.y - this.p2.position.y;
        const dist = Math.hypot(dx, dy);
        if (dist === 0) return [0, 0, 0, 0];

        const dvx = this.p1.velocity.x - this.p2.velocity.x;
        const dvy = this.p1.velocity.y - this.p2.velocity.y;
        // derivative of (dx/dist) = (dvx*dist - dx*(dx*dvx+dy*dvy)/dist)/dist^2
        const dot = dx * dvx + dy * dvy;
        const inv = 1 / dist;
        const inv2 = inv / (dist * dist);
        const jx1 = (dvx * dist - dx * dot * inv) * inv2;
        const jy1 = (dvy * dist - dy * dot * inv) * inv2;
        return [jx1, jy1, -jx1, -jy1];
    }

    affectedParticles() {
        return [this.p1, this.p2];
    }

    applyConstraintForce(lambda) {
        const jac = this.computeJacobian();
        // f̂ = Jᵀ λ: distribute to p1 and p2
        this.p1.applyForce(lambda * jac[0], lambda * jac[1]);
        this.p2.applyForce(lambda * jac[2], lambda * jac[3]);
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.p1.position.x, this.p1.position.y);
        ctx.lineTo(this.p2.position.x, this.p2.position.y);
        ctx.strokeStyle = '#222831';
        ctx.stroke();
        ctx.closePath();
    }
} 
