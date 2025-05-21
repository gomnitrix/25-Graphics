class FreeFallScene {
    static create(simulation) {
        const centerX = simulation.canvas.width / 2;
        const centerY = simulation.canvas.height / 2;
        const sideLength = 100;
        const halfSide = sideLength / 2;
        const spacing = 150;
        
        
        const square1CenterX = centerX - spacing;

        
        const topLeft1 = simulation.addParticle(square1CenterX - halfSide, centerY - halfSide, 1);
        const topRight1 = simulation.addParticle(square1CenterX + halfSide, centerY - halfSide, 1);

        simulation.addRodConstraint1(topLeft1, topRight1, sideLength);     // Top edge

    }

}