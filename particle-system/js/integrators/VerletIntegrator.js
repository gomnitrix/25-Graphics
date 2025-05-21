class VerletIntegrator extends Integrator {
    constructor(simulation) {
        super(simulation);
    }
    step(particles, dt) {
        const derivatives = this.simulation.update1();

        for (const p of particles) {
            if (p.fixed) continue;
            const deriv = derivatives[particles.indexOf(p)];
            const ax = deriv.a.x;
            const ay = deriv.a.y;
            const newX = 2 * p.position.x - p.prevPosition.x + ax * dt * dt;
            const newY = 2 * p.position.y - p.prevPosition.y + ay * dt * dt;
            p.velocity.x = (newX - p.prevPosition.x) / (2 * dt);
            p.velocity.y = (newY - p.prevPosition.y) / (2 * dt);
            p.prevPosition = { x: p.position.x, y: p.position.y };
            p.position.x = newX;
            p.position.y = newY;
        }
    }
    
    name() {
        return 'Verlet';
    }
}