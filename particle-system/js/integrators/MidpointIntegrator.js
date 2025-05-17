class MidpointIntegrator extends Integrator {
    tempStates = [];

    constructor() {
        super();
        this.midpointPhase = 0;
    }

    step(particles, dt) {
        if (this.midpointPhase === 0) {
            this.tempStates = [];

            for (const p of particles) {
                // store original state
                this.tempStates.push({
                    position: { x: p.position.x, y: p.position.y },
                    velocity: { x: p.velocity.x, y: p.velocity.y },
                    force: { x: p.force.x, y: p.force.y }
                });

                if (!p.fixed) {
                    const ax = p.force.x / p.mass;
                    const ay = p.force.y / p.mass;

                    p.position.x += p.velocity.x * (dt / 2);
                    p.position.y += p.velocity.y * (dt / 2);
                    p.velocity.x += ax * (dt / 2);
                    p.velocity.y += ay * (dt / 2);
                }
            }

            this.midpointPhase = 1;
            return false;
        } else {
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                if (p.fixed) continue;

                const original = this.tempStates[i];
                const ax_mid = p.force.x / p.mass;
                const ay_mid = p.force.y / p.mass;

                p.position.x = original.position.x + p.velocity.x * dt;
                p.position.y = original.position.y + p.velocity.y * dt;
                p.velocity.x = original.velocity.x + ax_mid * dt;
                p.velocity.y = original.velocity.y + ay_mid * dt;
                p.prevPosition.x = original.position.x;
                p.prevPosition.y = original.position.y;
            }

            // reset phase
            this.midpointPhase = 0;
            return true;
        }
    }

    name() {
        return 'Midpoint';
    }
}