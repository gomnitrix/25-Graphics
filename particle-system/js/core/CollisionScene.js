class CollisionScene {
    static create(simulation, particleCount = 2) {
        const width = simulation.canvas.width;
        const height = simulation.canvas.height;

        // create 2 particles
        const particle1 = simulation.addParticle(width / 3, height / 2, 5);
        const particle2 = simulation.addParticle(2 * width / 3, height / 2, 8);
        particle1.radius = 20;
        particle2.radius = 30;
        particle1.velocity.x = 20;
        particle1.velocity.y = -10;
        particle2.velocity.x = -15;
        particle2.velocity.y = 5;
        const particles = [particle1, particle2];

        // collision force
        const pcollisionForce = new pCollisionForce(particles);
        simulation.forces.push(pcollisionForce);

        const originalUpdate = simulation.update;
        simulation.update = function (dt) {
            originalUpdate.call(this, dt);
            pcollisionForce.apply();
        };
    }
}