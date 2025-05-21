class DoublePendulumScene {
    static create(simulation) {
        const centerX = simulation.canvas.width / 2;
        const centerY = simulation.canvas.height / 2;

        const anchorPoint = simulation.addParticle(centerX, centerY - 150, 1);
        anchorPoint.fixed = true;

        // first particle
        const pendulumLength = 50;
        const pendulumX = centerX + pendulumLength;
        const pendulumY = centerY - 150;
        const pendulumParticle = simulation.addParticle(pendulumX, pendulumY, 1);
        simulation.addRodConstraint1(anchorPoint, pendulumParticle, pendulumLength);

        // second particle
        const rodLength = 50;
        const rod2X = pendulumX;
        const rod2Y = pendulumY - rodLength;
        const secondParticle = simulation.addParticle(rod2X, rod2Y, 1);
        simulation.addRodConstraint1(pendulumParticle, secondParticle, rodLength);

        // third particle
        const rod3Length = 50;
        const rod3X = rod2X + rod3Length;
        const rod3Y = rod2Y;
        const thirdParticle = simulation.addParticle(rod3X, rod3Y, 1);
        simulation.addRodConstraint1(secondParticle, thirdParticle, rod3Length);

        // prepare trails for three moving particles
        simulation.trails = [[], [], []];

        // override update to record positions
        simulation.update = (function (originalUpdate) {
            return function (dt) {
                originalUpdate(dt);
                const particlesList = [pendulumParticle, secondParticle, thirdParticle];
                particlesList.forEach((p, i) => {
                    simulation.trails[i].push({ x: p.position.x, y: p.position.y });
                    if (simulation.trails[i].length > 200) simulation.trails[i].shift();
                });
            };
        })(simulation.update.bind(simulation));

        // override draw: first draw scene, then trails on top
        simulation.draw = (function (originalDraw) {
            return function () {
                // draw base scene (particles, rods, etc.)
                originalDraw();

                // draw trails on top
                const particlesList = [pendulumParticle, secondParticle, thirdParticle];
                const colors = ['blue', 'green', 'purple'];
                simulation.ctx.save();
                simulation.ctx.setLineDash([5, 5]);
                particlesList.forEach((_, i) => {
                    const trail = simulation.trails[i];
                    if (trail.length < 2) return;
                    simulation.ctx.beginPath();
                    simulation.ctx.strokeStyle = colors[i];
                    simulation.ctx.moveTo(trail[0].x, trail[0].y);
                    trail.forEach(pt => simulation.ctx.lineTo(pt.x, pt.y));
                    simulation.ctx.stroke();
                });
                simulation.ctx.restore();
            };
        })(simulation.draw.bind(simulation));

        // disable dragging for clear view
        simulation.originalDrag = simulation.drag.drag;
        simulation.drag.drag = 0;
    }

    static cleanup(simulation) {
        if (simulation.originalDrag !== undefined) {
            simulation.drag.drag = simulation.originalDrag;
            delete simulation.originalDrag;
        }
        if (simulation.trails) {
            delete simulation.trails;
        }
        // Note: restoration of original update/draw requires scene recreation
    }
}
