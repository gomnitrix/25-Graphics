class GravityForce extends Force {
    constructor(g = 9.8) {
        super();
        this.g = g;
    }

    apply(particles) {
        for (const p of particles) {
            if (!p.fixed) {
                p.applyForce(0, p.mass * this.g);
            }
        }
    }
} 