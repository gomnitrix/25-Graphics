class EulerIntegrator extends Integrator {
    step(particles, dt) {
        for (const p of particles) {
            if (p.fixed) continue;
            const ax = p.force.x / p.mass;
            const ay = p.force.y / p.mass;
            p.velocity.x += ax * dt;
            p.velocity.y += ay * dt;
            p.position.x += p.velocity.x * dt;
            p.position.y += p.velocity.y * dt;
        }
        return true;
    }
    
    name() {
        return 'Euler';
    }
}