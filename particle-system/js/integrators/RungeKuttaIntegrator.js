class RungeKuttaIntegrator extends Integrator {
    step(particles, dt, forceCalculator) {
        // 1. store original states
        const originalStates = particles.map(p => ({
            position: { x: p.position.x, y: p.position.y },
            velocity: { x: p.velocity.x, y: p.velocity.y },
            mass: p.mass,
            fixed: p.fixed
        }));

        // 2. compute k1
        for (const p of particles) {
            p.force.x = 0;
            p.force.y = 0;
        }
        forceCalculator();

        const k1 = particles.map(p => ({
            dx: p.velocity.x,
            dy: p.velocity.y,
            dvx: p.fixed ? 0 : p.force.x / p.mass,
            dvy: p.fixed ? 0 : p.force.y / p.mass
        }));

        // 3. compute k2
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            if (p.fixed) continue;

            const original = originalStates[i];
            const k1i = k1[i];

            p.position.x = original.position.x + 0.5 * k1i.dx * dt;
            p.position.y = original.position.y + 0.5 * k1i.dy * dt;
            p.velocity.x = original.velocity.x + 0.5 * k1i.dvx * dt;
            p.velocity.y = original.velocity.y + 0.5 * k1i.dvy * dt;
        }

        for (const p of particles) {
            p.force.x = 0;
            p.force.y = 0;
        }
        forceCalculator();

        const k2 = particles.map(p => ({
            dx: p.velocity.x,
            dy: p.velocity.y,
            dvx: p.fixed ? 0 : p.force.x / p.mass,
            dvy: p.fixed ? 0 : p.force.y / p.mass
        }));

        // 4. compute k3
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            if (p.fixed) continue;

            const original = originalStates[i];
            const k2i = k2[i];

            p.position.x = original.position.x + 0.5 * k2i.dx * dt;
            p.position.y = original.position.y + 0.5 * k2i.dy * dt;
            p.velocity.x = original.velocity.x + 0.5 * k2i.dvx * dt;
            p.velocity.y = original.velocity.y + 0.5 * k2i.dvy * dt;
        }

        for (const p of particles) {
            p.force.x = 0;
            p.force.y = 0;
        }
        forceCalculator();

        const k3 = particles.map(p => ({
            dx: p.velocity.x,
            dy: p.velocity.y,
            dvx: p.fixed ? 0 : p.force.x / p.mass,
            dvy: p.fixed ? 0 : p.force.y / p.mass
        }));

        // 5. compute k4
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            if (p.fixed) continue;

            const original = originalStates[i];
            const k3i = k3[i];

            p.position.x = original.position.x + k3i.dx * dt;
            p.position.y = original.position.y + k3i.dy * dt;
            p.velocity.x = original.velocity.x + k3i.dvx * dt;
            p.velocity.y = original.velocity.y + k3i.dvy * dt;
        }

        for (const p of particles) {
            p.force.x = 0;
            p.force.y = 0;
        }
        forceCalculator();

        const k4 = particles.map(p => ({
            dx: p.velocity.x,
            dy: p.velocity.y,
            dvx: p.fixed ? 0 : p.force.x / p.mass,
            dvy: p.fixed ? 0 : p.force.y / p.mass
        }));

        // 6. final update
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            if (p.fixed) continue;

            const original = originalStates[i];
            const k1i = k1[i], k2i = k2[i], k3i = k3[i], k4i = k4[i];

            p.position.x = original.position.x + (dt / 6) * (k1i.dx + 2 * k2i.dx + 2 * k3i.dx + k4i.dx);
            p.position.y = original.position.y + (dt / 6) * (k1i.dy + 2 * k2i.dy + 2 * k3i.dy + k4i.dy);
            p.velocity.x = original.velocity.x + (dt / 6) * (k1i.dvx + 2 * k2i.dvx + 2 * k3i.dvx + k4i.dvx);
            p.velocity.y = original.velocity.y + (dt / 6) * (k1i.dvy + 2 * k2i.dvy + 2 * k3i.dvy + k4i.dvy);

            p.prevPosition = { x: original.position.x, y: original.position.y };
        }

        return true;
    }

    name() {
        return 'RungeKutta';
    }
}