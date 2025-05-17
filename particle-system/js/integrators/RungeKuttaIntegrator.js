class RungeKuttaIntegrator extends Integrator {
    // Full RK4 method - requires four force evaluations per step
    tempStates = [];
    k1 = [];
    k2 = [];
    k3 = [];

    constructor() {
        super();
        // Track which phase of RK4 we're in (0-3)
        this.rkPhase = 0;
    }

    step(particles, dt) {
        // Phase 0: Initial derivatives (k1)
        if (this.rkPhase === 0) {
            // Store original states
            this.tempStates = [];
            this.k1 = [];

            for (const p of particles) {
                // Store original state
                this.tempStates.push({
                    position: { x: p.position.x, y: p.position.y },
                    velocity: { x: p.velocity.x, y: p.velocity.y }
                });

                // Store k1 derivatives
                this.k1.push({
                    dx: p.velocity.x,
                    dy: p.velocity.y,
                    dvx: p.fixed ? 0 : p.force.x / p.mass,
                    dvy: p.fixed ? 0 : p.force.y / p.mass
                });

                // Move to k2 sampling point
                if (!p.fixed) {
                    const k1 = this.k1[this.k1.length - 1];
                    p.position.x = this.tempStates[this.tempStates.length - 1].position.x + 0.5 * k1.dx * dt;
                    p.position.y = this.tempStates[this.tempStates.length - 1].position.y + 0.5 * k1.dy * dt;
                    p.velocity.x = this.tempStates[this.tempStates.length - 1].velocity.x + 0.5 * k1.dvx * dt;
                    p.velocity.y = this.tempStates[this.tempStates.length - 1].velocity.y + 0.5 * k1.dvy * dt;
                }
            }

            this.rkPhase = 1;
            return false; // Not complete - need more force evaluations
        }
        // Phase 1: Midpoint derivatives (k2)
        else if (this.rkPhase === 1) {
            this.k2 = [];

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                // Store k2 derivatives
                this.k2.push({
                    dx: p.velocity.x,
                    dy: p.velocity.y,
                    dvx: p.fixed ? 0 : p.force.x / p.mass,
                    dvy: p.fixed ? 0 : p.force.y / p.mass
                });

                // Move to k3 sampling point
                if (!p.fixed) {
                    const original = this.tempStates[i];
                    const k2 = this.k2[i];

                    p.position.x = original.position.x + 0.5 * k2.dx * dt;
                    p.position.y = original.position.y + 0.5 * k2.dy * dt;
                    p.velocity.x = original.velocity.x + 0.5 * k2.dvx * dt;
                    p.velocity.y = original.velocity.y + 0.5 * k2.dvy * dt;
                }
            }

            this.rkPhase = 2;
            return false; // Not complete
        }
        // Phase 2: Second midpoint derivatives (k3)
        else if (this.rkPhase === 2) {
            this.k3 = [];

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                // Store k3 derivatives
                this.k3.push({
                    dx: p.velocity.x,
                    dy: p.velocity.y,
                    dvx: p.fixed ? 0 : p.force.x / p.mass,
                    dvy: p.fixed ? 0 : p.force.y / p.mass
                });

                // Move to k4 sampling point
                if (!p.fixed) {
                    const original = this.tempStates[i];
                    const k3 = this.k3[i];

                    p.position.x = original.position.x + k3.dx * dt;
                    p.position.y = original.position.y + k3.dy * dt;
                    p.velocity.x = original.velocity.x + k3.dvx * dt;
                    p.velocity.y = original.velocity.y + k3.dvy * dt;
                }
            }

            this.rkPhase = 3;
            return false; // Not complete
        }
        // Phase 3: Final derivatives (k4) and full step
        else {
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                if (p.fixed) continue;

                // Get k4 derivatives
                const k4_dx = p.velocity.x;
                const k4_dy = p.velocity.y;
                const k4_dvx = p.force.x / p.mass;
                const k4_dvy = p.force.y / p.mass;

                // Get original state
                const original = this.tempStates[i];
                const k1 = this.k1[i];
                const k2 = this.k2[i];
                const k3 = this.k3[i];

                // Combine all derivatives using RK4 formula (1/6 * (k1 + 2*k2 + 2*k3 + k4))
                p.position.x = original.position.x + (dt / 6) * (k1.dx + 2 * k2.dx + 2 * k3.dx + k4_dx);
                p.position.y = original.position.y + (dt / 6) * (k1.dy + 2 * k2.dy + 2 * k3.dy + k4_dy);

                p.velocity.x = original.velocity.x + (dt / 6) * (k1.dvx + 2 * k2.dvx + 2 * k3.dvx + k4_dvx);
                p.velocity.y = original.velocity.y + (dt / 6) * (k1.dvy + 2 * k2.dvy + 2 * k3.dvy + k4_dvy);

                // Update previous position for Verlet compatibility
                p.prevPosition.x = original.position.x;
                p.prevPosition.y = original.position.y;
            }

            // Reset phase for next step
            this.rkPhase = 0;
            return true; // Step is complete
        }
    }

    name() {
        return 'RungeKutta';
    }
}