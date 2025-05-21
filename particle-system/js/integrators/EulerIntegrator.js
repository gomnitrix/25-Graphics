class EulerIntegrator extends Integrator {
    step(particles, dt) {
        const derivatives = this.simulation.update1();
        this.simulation.update2(derivatives, dt);
    }
    
    name() {
        return 'Euler';
    }
}