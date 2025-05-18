class DoublePendulumScene {
    static create(simulation) {
        const centerX = simulation.canvas.width / 2;
        const centerY = simulation.canvas.height / 2;

        const anchorPoint = simulation.addParticle(centerX, centerY - 150, 1);
        anchorPoint.fixed = true;

        // first particle
        const pendulumLength = 50;
        const pendulumX = centerX + pendulumLength;;
        const pendulumY = centerY - 150;
        const pendulumParticle = simulation.addParticle(pendulumX, pendulumY, 1);
        simulation.addDistanceConstraint(anchorPoint, pendulumParticle, pendulumLength);

        // second particle
        const rodLength = 50;
        const rod2X = pendulumX;
        const rod2Y = pendulumY - rodLength;
        const secondParticle = simulation.addParticle(rod2X, rod2Y, 1);
        simulation.addDistanceConstraint(pendulumParticle, secondParticle, rodLength);

        //third particle
        const rod3Length = 50;
        const rod3X = rod2X + rod3Length;
        const rod3Y = rod2Y;
        const thirdParticle = simulation.addParticle(rod3X, rod3Y, 1);
        simulation.addDistanceConstraint(secondParticle, thirdParticle, rod3Length);

        simulation.originalDrag = simulation.drag.drag;
        simulation.drag.drag = 0;
  
        // simulation.gravity.g = 30;
        // simulation.drag.drag = 0.1; 
    }
    static cleanup(simulation) {
        if (simulation.hasOwnProperty('originalDrag')) {
            simulation.drag.drag = simulation.originalDrag;
            delete simulation.originalDrag;
        }
    }
}