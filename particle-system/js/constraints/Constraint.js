class Constraint {
    constructor() {
    }

    // C(q)
    evaluateC() {
        throw new Error("evaluateC() must be implemented");
    }

    // first derivative C_dot(q, q_dot)
    evaluateCdot() {
        throw new Error("evaluateCdot() must be implemented");
    }

    // second derivative C_ddot(q, q_dot, q_ddot)
    evaluateCddot() {
        throw new Error("evaluateCddot() must be implemented");
    }

    // J = ∂C/∂q
    computeJacobian() {
        throw new Error("computeJacobian() must be implemented");
    }

    // J̇ = ∂J/∂t
    computeJacobianDot() {
        return { x: 0, y: 0 };
    }

    affectedParticles() {
        throw new Error("affectedParticles() must be implemented");
    }

    // f̂ = Jᵀ λ
    applyConstraintForce(lambda) {
        throw new Error("applyConstraintForce(lambda) must be implemented");
    }

    applyFeedbackForces() {
        this.feedbackForces.forEach(force => force.apply());
    }
    
    draw(ctx) { }
}