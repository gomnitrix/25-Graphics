class MidpointIntegrator extends Integrator {
    constructor(simulation) {
        super(simulation);
    }

    step(particles, dt) {
        // Store original particle states
        const originalStates = particles.map(p => ({
            position: { x: p.position.x, y: p.position.y },
            velocity: { x: p.velocity.x, y: p.velocity.y },
            force: { x: p.force.x, y: p.force.y }
        }));

        // First calculate initial derivatives
        const deriv = this.derivEval(particles);
        
        // Move particles to midpoint state
        particles.forEach((p, i) => {
            if (p.fixed) return;
            
            const halfDt = dt / 2;
            const original = originalStates[i];
            
            // Calculate midpoint state (using original state to avoid accumulation)
            p.position.x = original.position.x + halfDt * deriv[i].v.x;
            p.position.y = original.position.y + halfDt * deriv[i].v.y;
            p.velocity.x = original.velocity.x + halfDt * deriv[i].a.x;
            p.velocity.y = original.velocity.y + halfDt * deriv[i].a.y;
        });
        
        // Calculate derivatives at midpoint
        const midpointDeriv = this.derivEval(particles);

        // Restore original positions and update with full step
        particles.forEach((p, i) => {
            if (p.fixed) return;

            const original = originalStates[i];
            
            // Calculate final updates
            const dx = dt * midpointDeriv[i].v.x;
            const dy = dt * midpointDeriv[i].v.y;
            const dvx = dt * midpointDeriv[i].a.x;
            const dvy = dt * midpointDeriv[i].a.y;

            // Check for NaN or very large values
            if (isNaN(dx) || isNaN(dy) || isNaN(dvx) || isNaN(dvy)) {
                console.warn('NaN detected in integration step');
                return;
            }

            // Apply position update (from original position)
            p.position.x = original.position.x + dx;
            p.position.y = original.position.y + dy;

            // Apply velocity update (from original velocity)
            p.velocity.x = original.velocity.x + dvx;
            p.velocity.y = original.velocity.y + dvy;

            // Restore original force
            p.force.x = original.force.x;
            p.force.y = original.force.y;

            // Apply velocity damping to reduce numerical instability
            const DAMPING = 0.999;  // Very slight damping
            p.velocity.x *= DAMPING;
            p.velocity.y *= DAMPING;
        });
    }

    derivEval(particles) {
        // Clear forces first
        for (const p of particles) {
            p.force.x = 0;
            p.force.y = 0;
        }

        // Apply all forces
        this.simulation.gravity.apply(particles);
        this.simulation.drag.apply(particles);
        this.simulation.ground.apply(particles);
        for (const force of this.simulation.forces) {
            force.apply();
        }

        // Update mouse particle if exists
        if (this.simulation.mouseParticle) {
            this.simulation.mouseParticle.position.x = this.simulation.mouseX;
            this.simulation.mouseParticle.position.y = this.simulation.mouseY;
        }

        // Apply constraints
        if (this.simulation.constraintSolver) {
            this.simulation.constraintSolver.step();
        }

        // Calculate derivatives
        const derivatives = [];
        for (const p of particles) {
            // Add small numerical stability factor to mass
            const effectiveMass = p.mass + 1e-6;  // Avoid division by very small numbers
            derivatives.push({
                v: { x: p.velocity.x, y: p.velocity.y },
                a: {
                    x: p.force.x / effectiveMass,
                    y: p.force.y / effectiveMass
                }
            });
        }

        return derivatives;
    }

    name() {
        return 'Midpoint';
    }
}