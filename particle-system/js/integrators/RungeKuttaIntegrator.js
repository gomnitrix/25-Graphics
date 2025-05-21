class RungeKuttaIntegrator extends Integrator {
    constructor(simulation) {
        super(simulation);
    }

    step(particles, dt) {
        const originalStates = particles.map(p => ({
            position: { x: p.position.x, y: p.position.y },
            velocity: { x: p.velocity.x, y: p.velocity.y }
        }));

        const k1 = this.simulation.update1();
        this.simulation.update2(k1, dt / 2);

        const k2 = this.simulation.update1();
        this.restoreStates(particles, originalStates);
        this.simulation.update2(k2, dt / 2);

        const k3 = this.simulation.update1();
        this.restoreStates(particles, originalStates);
        this.simulation.update2(k3, dt);

        const k4 = this.simulation.update1();
        this.restoreStates(particles, originalStates);

        const finalDerivatives = this.computeFinalDerivatives(k1, k2, k3, k4);
        this.simulation.update2(finalDerivatives, dt);

        return true;
    }

    restoreStates(particles, originalStates) {
        particles.forEach((p, i) => {
            if (p.fixed) return;

            const origState = originalStates[i];
            p.position.x = origState.position.x;
            p.position.y = origState.position.y;
            p.velocity.x = origState.velocity.x;
            p.velocity.y = origState.velocity.y;
        });
    }

    computeFinalDerivatives(k1, k2, k3, k4) {
        return k1.map((deriv1, i) => {
            const deriv2 = k2[i];
            const deriv3 = k3[i];
            const deriv4 = k4[i];

            return {
                v: {
                    x: (deriv1.v.x + 2 * deriv2.v.x + 2 * deriv3.v.x + deriv4.v.x) / 6,
                    y: (deriv1.v.y + 2 * deriv2.v.y + 2 * deriv3.v.y + deriv4.v.y) / 6
                },
                a: {
                    x: (deriv1.a.x + 2 * deriv2.a.x + 2 * deriv3.a.x + deriv4.a.x) / 6,
                    y: (deriv1.a.y + 2 * deriv2.a.y + 2 * deriv3.a.y + deriv4.a.y) / 6
                }
            };
        });
    }

    name() {
        return 'RungeKutta';
    }
}