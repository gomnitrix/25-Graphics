class RungeKuttaIntegrator extends Integrator {
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

        // Calculate k1 (initial derivatives)
        const k1 = this.derivEval(particles);

        // Calculate k2 (midpoint derivatives)
        particles.forEach((p, i) => {
            if (p.fixed) return;
            
            const halfDt = dt / 2;
            const original = originalStates[i];
            
            p.position.x = original.position.x + halfDt * k1[i].v.x;
            p.position.y = original.position.y + halfDt * k1[i].v.y;
            p.velocity.x = original.velocity.x + halfDt * k1[i].a.x;
            p.velocity.y = original.velocity.y + halfDt * k1[i].a.y;
        });
        const k2 = this.derivEval(particles);

        // Calculate k3 (another midpoint derivatives)
        particles.forEach((p, i) => {
            if (p.fixed) return;
            
            const halfDt = dt / 2;
            const original = originalStates[i];
            
            p.position.x = original.position.x + halfDt * k2[i].v.x;
            p.position.y = original.position.y + halfDt * k2[i].v.y;
            p.velocity.x = original.velocity.x + halfDt * k2[i].a.x;
            p.velocity.y = original.velocity.y + halfDt * k2[i].a.y;
        });
        const k3 = this.derivEval(particles);

        // Calculate k4 (endpoint derivatives)
        particles.forEach((p, i) => {
            if (p.fixed) return;
            
            const original = originalStates[i];
            
            p.position.x = original.position.x + dt * k3[i].v.x;
            p.position.y = original.position.y + dt * k3[i].v.y;
            p.velocity.x = original.velocity.x + dt * k3[i].a.x;
            p.velocity.y = original.velocity.y + dt * k3[i].a.y;
        });
        const k4 = this.derivEval(particles);

        // Update final state using weighted average
        particles.forEach((p, i) => {
            if (p.fixed) return;

            const original = originalStates[i];
            
            // Calculate final updates using RK4 formula
            const dx = (dt / 6) * (k1[i].v.x + 2 * k2[i].v.x + 2 * k3[i].v.x + k4[i].v.x);
            const dy = (dt / 6) * (k1[i].v.y + 2 * k2[i].v.y + 2 * k3[i].v.y + k4[i].v.y);
            const dvx = (dt / 6) * (k1[i].a.x + 2 * k2[i].a.x + 2 * k3[i].a.x + k4[i].a.x);
            const dvy = (dt / 6) * (k1[i].a.y + 2 * k2[i].a.y + 2 * k3[i].a.y + k4[i].a.y);

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
        return 'Runge-Kutta 4';
    }
}
