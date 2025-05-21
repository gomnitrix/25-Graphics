class CirclePendulumScene {
    static create(simulation) {
        // center point
        const centerX = simulation.canvas.width / 2;
        const centerY = simulation.canvas.height / 2;

       

        // particle 3 of circle
        const angle2 = Math.PI * 3 / 4;
        const radius2 = 80;
        const x3 = centerX + Math.cos(angle2) * (radius2);
        const y3 = centerY - 110 + Math.sin(angle2) * (radius2);
        const particle3 = simulation.addParticle(x3, y3, 1);
        simulation.addCircularWire(particle3, centerX, centerY - 110, radius2);

        // particle 4 of particle 3 (rod)
        const rodLength = 20;
        const x4 = x3;
        const y4 = y3 + rodLength;
        const particle4 = simulation.addParticle(x4, y4, 1);
        simulation.addRodConstraint1(particle3, particle4, rodLength);

        // particle 9 of particle 4 (rod)
        const x9 = x4;
        const y9 = y4 + rodLength;
        const particle9 = simulation.addParticle(x9, y9, 1);
        simulation.addRodConstraint1(particle4, particle9, rodLength);

        
        // particle7 of second circle
        const x7 = centerX + Math.cos(angle2) * radius2;
        const y7 = centerY + 110 + Math.sin(angle2) * radius2;
        const particle7 = simulation.addParticle(x7, y7, 1);
        simulation.addCircularWire(particle7, centerX, centerY + 110, radius2);

        // particle8 of particle7 (rod)
        const x8 = x7;
        const y8 = y7 + rodLength;
        const particle8 = simulation.addParticle(x8, y8, 1);
        simulation.addRodConstraint2(particle7, particle8, rodLength);

        // particle 10 of particle 8 (rod)
        const x10 = x8;
        const y10 = y8 + rodLength;
        const particle10 = simulation.addParticle(x10, y10, 1);
        simulation.addRodConstraint2(particle8, particle10, rodLength);
    }
}