class CircularWireConstraint extends Constraint {
    constructor(particle, cx, cy, r) {
        super();
        this.p = particle;
        this.cx = cx;
        this.cy = cy;
        this.r = r;
        this.pc = new Particle(cx, cy);
        this.pc.fixed = true;
        this.feedbackforces = [
            new SpringForce(this.p, this.pc, r, 5000.0, 0.5)
        ];
    }

    // C(q)=0.5[(x−cx)²+(y−cy)²−r²]
    evaluateC() {
        const dx = this.p.position.x - this.cx;
        const dy = this.p.position.y - this.cy;
        return 0.5 * (dx * dx + dy * dy - this.r * this.r);
    }

    // C_dot = J·v = [dx,dy]·[vx,vy]
    evaluateCdot() {
        const dx = this.p.position.x - this.cx;
        const dy = this.p.position.y - this.cy;
        const vx = this.p.velocity.x;
        const vy = this.p.velocity.y;
        return dx * vx + dy * vy;
    }

    computeJacobian() {
        const dx = this.p.position.x - this.cx;
        const dy = this.p.position.y - this.cy;
        // Only one particle, return a single row [dC/dx, dC/dy]
        return [dx, dy];
    }

    computeJacobianDot() {
        const vx = this.p.velocity.x;
        const vy = this.p.velocity.y;
        return [vx, vy];
    }

    affectedParticles() {
        return [this.p];
    }

    applyConstraintForce(lambda) {
        // f̂ = Jᵀ λ → [dx,dy]^T * λ
        const dx = this.p.position.x - this.cx;
        const dy = this.p.position.y - this.cy;
        this.p.applyForce(lambda * dx, lambda * dy);
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.cx, this.cy, this.r, 0, Math.PI * 2);
        ctx.strokeStyle = '#393e46';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
    }
}
