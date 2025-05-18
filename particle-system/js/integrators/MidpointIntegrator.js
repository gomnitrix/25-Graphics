class MidpointIntegrator extends Integrator {
    step(particles, dt, forceCalculator) {
        // 1. store original states
        const originalStates = particles.map(p => ({
            position: { x: p.position.x, y: p.position.y },
            velocity: { x: p.velocity.x, y: p.velocity.y },
            mass: p.mass,
            fixed: p.fixed
        }));

        // 2. compute initial forces and derivatives
        for (const p of particles) {
            p.force.x = 0;
            p.force.y = 0;
        }
        forceCalculator();

        const initialDerivs = particles.map(p => ({
            v: { x: p.velocity.x, y: p.velocity.y },
            a: { x: p.force.x / p.mass, y: p.force.y / p.mass }
        }));

        // 3. advance to midpoint state
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            if (p.fixed) continue;
            const orig = originalStates[i];
            const deriv = initialDerivs[i];

            p.position.x = orig.position.x + deriv.v.x * (dt / 2);
            p.position.y = orig.position.y + deriv.v.y * (dt / 2);
            p.velocity.x = orig.velocity.x + deriv.a.x * (dt / 2);
            p.velocity.y = orig.velocity.y + deriv.a.y * (dt / 2);
        }

        // 4. recompute forces at midpoint
        for (const p of particles) {
            p.force.x = 0;
            p.force.y = 0;
        }
        forceCalculator();

        // 5. final update using midpoint derivatives
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            if (p.fixed) continue;
            const orig = originalStates[i];

            // Store current force at midpoint for velocity update
            const a_mid_x = p.force.x / p.mass;
            const a_mid_y = p.force.y / p.mass;

            // Use midpoint velocity for position update
            const v_mid_x = p.velocity.x;  // this is already at midpoint
            const v_mid_y = p.velocity.y;  // this is already at midpoint

            // Update position using midpoint velocity
            p.position.x = orig.position.x + v_mid_x * dt;
            p.position.y = orig.position.y + v_mid_y * dt;

            // Update velocity using midpoint acceleration
            p.velocity.x = orig.velocity.x + a_mid_x * dt;
            p.velocity.y = orig.velocity.y + a_mid_y * dt;

            // Set previous position for constraints
            p.prevPosition = { x: orig.position.x, y: orig.position.y };
        }

        return true;
    }

    name() {
        return 'Midpoint';
    }
}
