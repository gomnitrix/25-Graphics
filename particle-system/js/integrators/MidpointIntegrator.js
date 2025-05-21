class MidpointIntegrator extends Integrator {
    constructor(simulation) {
        super(simulation);
    }

    step(particles, dt) {
        const derivInit = this.simulation.update1();

        // mid state
        const midParticles = particles.map((p, i) => {
            const midP = new Particle(p.position.x, p.position.y, p.mass);
            midP.fixed = p.fixed;

            if (!p.fixed) {
                const deriv = derivInit[i];
                midP.position.x = p.position.x + (dt / 2) * deriv.v.x;
                midP.position.y = p.position.y + (dt / 2) * deriv.v.y;
                midP.velocity.x = p.velocity.x + (dt / 2) * deriv.a.x;
                midP.velocity.y = p.velocity.y + (dt / 2) * deriv.a.y;
            } else {
                midP.position.x = p.position.x;
                midP.position.y = p.position.y;
                midP.velocity.x = p.velocity.x;
                midP.velocity.y = p.velocity.y;
            }
            midP.prevPosition = { x: p.prevPosition.x, y: p.prevPosition.y };
            midP.force = { x: 0, y: 0 };

            return midP;
        });

        const origParticles = this.simulation.particles;
        this.simulation.particles = midParticles;
        const derivMid = this.simulation.update1();
        this.simulation.particles = origParticles;

        this.simulation.update2(derivMid, dt);

        return true;
    }

    name() {
        return 'Midpoint';
    }
}