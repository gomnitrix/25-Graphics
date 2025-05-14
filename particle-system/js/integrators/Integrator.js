class Integrator {
    step(particles, dt) {
        throw new Error('step() must be implemented by subclass');
    }
    name() {
        throw new Error('name() must be implemented by subclass');
    }
}
