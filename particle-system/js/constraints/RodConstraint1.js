class RodConstraint1 extends Constraint {
    constructor(p1, p2, length) {
        super();
        this.p1 = p1;
        this.p2 = p2;
        this.length = length;
        this.feedbackforces = [
            new SpringForce(p1, p2, length, 50.0, 0.5)
        ];
    }

    evaluateC() {
        const dx = this.p1.position.x - this.p2.position.x;
        const dy = this.p1.position.y - this.p2.position.y;
        return dx * dx + dy * dy - this.length * this.length;
    }

    evaluateCdot() {
        const dx = this.p1.position.x - this.p2.position.x;
        const dy = this.p1.position.y - this.p2.position.y;
        const dvx = this.p1.velocity.x - this.p2.velocity.x;
        const dvy = this.p1.velocity.y - this.p2.velocity.y;
        return 2 * (dx * dvx + dy * dvy);
    }

    computeJacobian() {
        const dx = this.p1.position.x - this.p2.position.x;
        const dy = this.p1.position.y - this.p2.position.y;
        // J row: [∂C/∂x1,∂C/∂y1, ∂C/∂x2,∂C/∂y2]
        return [2 * dx, 2 * dy, -2 * dx, -2 * dy];
    }

    computeJacobianDot() {
        const dvx = this.p1.velocity.x - this.p2.velocity.x;
        const dvy = this.p1.velocity.y - this.p2.velocity.y;
        return [2 * dvx, 2 * dvy, -2 * dvx, -2 * dvy];
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
