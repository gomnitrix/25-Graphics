class HairScene {
    static create(simulation) {
        const numRow = 5;
        const numCol = 20;
        const spacing = 10;
        const x = 50;
        const y = 10;

        const springConst = 10;
        const particleMass = 5;
        const damp = 0.5;

        const particles = [];
        const springs = [];

        // Create particles in cloth
        for (let j = 0; j < numRow; j++) {
            for (let i = 0; i < numCol; i++) {
                const px = i * spacing + x;
                const py = j * spacing + y;
                const particle = simulation.addParticle(px, py, particleMass);
                particles.push(particle);
            }
        }

        // Add springs
        for (let i = 0; i < numCol; i++) {
            const spring = new SpringForce(particles[i], new Particle(i * spacing + x, 0, 1), spacing, springConst, damp);
            springs.push(spring);
        }
        for (let j = 0; j < numRow; j++) {
            for (let i = 0; i < numCol; i++) {

                if (j < numRow - 1) {
                    const springDown = new SpringForce(particles[j * numCol + i], particles[(j + 1) * numCol + i], spacing, springConst, damp);
                    springs.push(springDown);
                }
            }
        }

        simulation.particles = particles;
        simulation.forces = springs;
        return;
        /*
    const centerX = simulation.canvas.width / 2;
    const centerY = simulation.canvas.height / 2;
    const sideLength = 100;
    const halfSide = sideLength / 2;
    const spacing = 150;
    
    
    const square1CenterX = centerX - spacing;

    
    const topLeft1 = simulation.addParticle(square1CenterX - halfSide, centerY - halfSide, 1);
    const topRight1 = simulation.addParticle(square1CenterX + halfSide, centerY - halfSide, 1);

    simulation.addRodConstraint1(topLeft1, topRight1, sideLength);     // Top edge
*/
    }

}