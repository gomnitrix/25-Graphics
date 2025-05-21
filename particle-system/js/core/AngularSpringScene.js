class AngularSpringScene {
    static create(simulation, x, y, particlesNum, width, height) {
        const particles = [];
        const springs = [];
        const constraints = [];

        let currY = y;
        for (let i = 0; i < particlesNum; i++) {
            const px = (i % 2 === 0) ? x : x + width;
            const py = currY + (i % 2 === 1 ? 0 : 1) * height;
            currY = py;
            const particle = simulation.addParticle(px, py);
            particles.push(particle);
        }

        for (let i = 0; i < particlesNum - 1; i++) {
            const p1 = particles[i];
            const p2 = particles[i + 1];
            const dx = p2.position.x - p1.position.x;
            const dy = p2.position.y - p1.position.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            constraints.push(simulation.addRodConstraint1(p1, p2, dist));
        }

        for (let i = 0; i < particlesNum - 2; i++) {
            const p1 = particles[i];
            const p2 = particles[i + 1];
            const p3 = particles[i + 2];
            const restAngle = AngularSpringScene.getAngle(p1, p2, p3) * 180 / Math.PI;
            springs.push(simulation.addAngularSpring(p1, p2, p3, restAngle, 40, 1));
        }

        simulation.particles = particles;
        simulation.forces = springs;
        simulation.constraints = constraints;
    }

    static getAngle(p1, p2, p3) {
        const v1x = p1.position.x - p2.position.x;
        const v1y = p1.position.y - p2.position.y;
        const v2x = p3.position.x - p2.position.x;
        const v2y = p3.position.y - p2.position.y;
        const dot = v1x * v2x + v1y * v2y;
        const len1 = Math.hypot(v1x, v1y);
        const len2 = Math.hypot(v2x, v2y);
        return Math.acos(dot / (len1 * len2));
    }
}