class SquareScene {
    static create(simulation) {
        const centerX = simulation.canvas.width / 2;
        const centerY = simulation.canvas.height / 2;
        const sideLength = 100;
        const halfSide = sideLength / 2;
        const spacing = 150;

        // first square
        const square1CenterX = centerX - spacing;

        // 4 particles
        const topLeft1 = simulation.addParticle(square1CenterX - halfSide, centerY - halfSide, 1);
        const topRight1 = simulation.addParticle(square1CenterX + halfSide, centerY - halfSide, 1);
        const bottomRight1 = simulation.addParticle(square1CenterX + halfSide, centerY + halfSide, 1);
        const bottomLeft1 = simulation.addParticle(square1CenterX - halfSide, centerY + halfSide, 1);

        // rigid connections
        simulation.addDistanceConstraint(topLeft1, topRight1, sideLength);     // Top edge
        simulation.addDistanceConstraint(topRight1, bottomRight1, sideLength); // Right edge
        simulation.addDistanceConstraint(bottomRight1, bottomLeft1, sideLength); // Bottom edge
        simulation.addDistanceConstraint(bottomLeft1, topLeft1, sideLength);   // Left edge

        // spring connections for the two diagonals
        const diagonalLength = Math.sqrt(2) * sideLength; // √2 * sideLength
        const diagonal1_1 = new SpringForce(topLeft1, bottomRight1, diagonalLength, 30, 0.5);
        const diagonal2_1 = new SpringForce(topRight1, bottomLeft1, diagonalLength, 30, 0.5);
        simulation.forces.push(diagonal1_1);
        simulation.forces.push(diagonal2_1);


        // second squre
        const square2CenterX = centerX + spacing;

        // 4particles
        const topLeft2 = simulation.addParticle(square2CenterX - halfSide, centerY - halfSide, 1);
        const topRight2 = simulation.addParticle(square2CenterX + halfSide, centerY - halfSide, 1);
        const bottomRight2 = simulation.addParticle(square2CenterX + halfSide, centerY + halfSide, 1);
        const bottomLeft2 = simulation.addParticle(square2CenterX - halfSide, centerY + halfSide, 1);

        // spring forces
        const edgeSpring1 = new SpringForce(topLeft2, topRight2, sideLength, 50, 0.5);     // Top edge
        const edgeSpring2 = new SpringForce(topRight2, bottomRight2, sideLength, 50, 0.5); // Right edge
        const edgeSpring3 = new SpringForce(bottomRight2, bottomLeft2, sideLength, 50, 0.5); // Bottom edge
        const edgeSpring4 = new SpringForce(bottomLeft2, topLeft2, sideLength, 50, 0.5);   // Left edge

        simulation.forces.push(edgeSpring1);
        simulation.forces.push(edgeSpring2);
        simulation.forces.push(edgeSpring3);
        simulation.forces.push(edgeSpring4);

        // spring connections
        const diagonal1_2 = new SpringForce(topLeft2, bottomRight2, diagonalLength, 30, 0.5);
        const diagonal2_2 = new SpringForce(topRight2, bottomLeft2, diagonalLength, 30, 0.5);
        simulation.forces.push(diagonal1_2);
        simulation.forces.push(diagonal2_2);
    }
}