class ImplicitEulerIntegrator extends Integrator {
    step(particles, dt) {
        const originalStates = particles.map(p => ({
            position: { x: p.position.x, y: p.position.y },
            velocity: { x: p.velocity.x, y: p.velocity.y }
        }));

        particles.forEach(p => {
            if (p.fixed) return;
            p.position.x += p.velocity.x * dt;
            p.position.y += p.velocity.y * dt;
        });

        const deriv = this.simulation.update1();

        // Restore original state before applying implicit update
        particles.forEach((p, i) => {
            if (p.fixed) return;
            p.position.x = originalStates[i].position.x;
            p.position.y = originalStates[i].position.y;
            p.velocity.x = originalStates[i].velocity.x;
            p.velocity.y = originalStates[i].velocity.y;
        });

        // x_{n+1} = x_n + v_{n+1} * dt;  v_{n+1} = v_n + a_{n+1} * dt
        this.simulation.update2(deriv, dt);
    }

    name() {
        return 'Implicit Euler';
    }
}
