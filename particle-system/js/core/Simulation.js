class Simulation {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.forces = [];
        this.constraints = [];
        this.lastTime = 0;
        this.isRunning = true;
        this.iterations = 20; // Number of constraint solving iterations
        this.gravity = new GravityForce(25);
        this.drag = new DragForce(0.2);
        this.ground = new GroundForce(canvas, 0.8, 0.8);
        this.timestep = 1 / 120; // fixed timestep (seconds)
        this.substeps = 10; // substeps per frame
        this.frameRate = 40;
        this.integrator = new VerletIntegrator();
        
        // Mouse interaction properties
        this.mouseParticle = null;
        this.mouseSprings = [];
        this.isDragging = false;
        this.mouseInfluence = 30;
        this.mouseX = 0;
        this.mouseY = 0;
        
        this.setupMouseInteraction();
    }

    setupMouseInteraction() {
        this.canvas.addEventListener('mousedown', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;

            this.mouseParticle = new Particle(this.mouseX, this.mouseY, 1);
            this.mouseParticle.fixed = true;

            let minDist = Infinity;
            let nearest = null;
            this.particles.forEach(p => {
                const dx = p.position.x - this.mouseX;
                const dy = p.position.y - this.mouseY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < minDist && dist <= this.mouseInfluence) {
                    minDist = dist;
                    nearest = p;
                }
            });
            if (nearest) {
                const spring = new SpringForce(nearest, this.mouseParticle, 0, 5.0, 0.2);
                this.mouseSprings.push(spring);
                this.forces.push(spring);
            }
            this.isDragging = true;
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isDragging && this.mouseParticle) {
                const rect = this.canvas.getBoundingClientRect();
                this.mouseX = e.clientX - rect.left;
                this.mouseY = e.clientY - rect.top;
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            this.mouseSprings.forEach(spring => {
                const idx = this.forces.indexOf(spring);
                if (idx !== -1) this.forces.splice(idx, 1);
            });
            this.mouseSprings = [];
            this.mouseParticle = null;
            this.isDragging = false;
        });
    }

    addParticle(x, y, mass = 1) {
        const particle = new Particle(x, y, mass);
        this.particles.push(particle);
        return particle;
    }

    addDistanceConstraint(particle1, particle2, distance) {
        const constraint = new DistanceConstraint(particle1, particle2, distance);
        this.constraints.push(constraint);
        return constraint;
    }

    addAngularSpring(particle1, particle2, particle3, restAngle, stiffness, damping) {
        const spring = new AngularSpringForce(particle1, particle2, particle3, restAngle, stiffness, damping);
        this.forces.push(spring);
        return spring;
    }

    addCircularWire(particle, centerX, centerY, radius) {
        const constraint = new CircularWireConstraint(particle, centerX, centerY, radius);
        this.constraints.push(constraint);
        return constraint;
    }

    createSpringStructure(x, y, particlesNum, width = 50, height = 20) {
        const particles = [];
        const springs = [];
        const constraints = [];

        // Create particles in a triangular pattern
        let currY = y;
        for (let i = 0; i < particlesNum; i++) {
            const px = (i%2 === 0) ? x : x + width;
            const py = currY + (i % 2 === 1 ? 0 : 1) * height;
            currY = py;
            const particle = this.addParticle(px, py);
            particles.push(particle);
        }

        // Add distance constraints between adjacent particles
        for (let i = 0; i < particlesNum - 1; i++) {
            const p1 = particles[i];
            const p2 = particles[i + 1];
            const dx = p2.position.x - p1.position.x;
            const dy = p2.position.y - p1.position.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            constraints.push(this.addDistanceConstraint(p1, p2, dist));
        }

        // Add angular springs
        for (let i = 0; i < particlesNum - 2; i++) {
            const p1 = particles[i];
            const p2 = particles[i + 1];
            const p3 = particles[i + 2];
            const restAngle = getAngle(p1, p2, p3) * 180 / Math.PI;
            springs.push(this.addAngularSpring(p1, p2, p3, restAngle, 40, 1));
        }
        this.particles = particles;
        this.forces = springs;
        this.constraints = constraints;
        return;
    }

    createCircleScene() {
        // center point
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        // particle1 of the circle
        const angle1 = Math.PI / 4;
        const radius1 = 50;
        const x1 = centerX + Math.cos(angle1) * radius1;
        const y1 = centerY + Math.sin(angle1) * radius1;
        const particle1 = this.addParticle(x1, y1, 1);
        this.addCircularWire(particle1, centerX, centerY, radius1);

        // particle2 of particle1 (spring)
        const springLength = 20;
        const x2 = x1;
        const y2 = y1 + springLength;
        const particle2 = this.addParticle(x2, y2, 1);
        const spring = new SpringForce(particle1, particle2, springLength, 50, 0.5);
        this.forces.push(spring);

        // particle 3 of circle
        const angle2 = Math.PI * 3 / 4;
        const radius2 = 80;
        const x3 = centerX + Math.cos(angle2) * (radius2);
        const y3 = centerY + Math.sin(angle2) * (radius2);
        const particle3 = this.addParticle(x3, y3, 1);
        this.addCircularWire(particle3, centerX, centerY, radius2);
        this.circleDecoration2 = { centerX, centerY, radius2 };

        // particle 4 of particle 3 (rod)
        const rodLength = 20;
        const x4 = x3;
        const y4 = y3 + rodLength;
        const particle4 = this.addParticle(x4, y4, 1);
        this.addDistanceConstraint(particle3, particle4, rodLength);
    }
    
    update(dt) {
        const subDt = this.timestep;
        for (let s = 0; s < this.substeps; s++) {
            this.gravity.apply(this.particles);
            this.drag.apply(this.particles);
            for (const force of this.forces) force.apply();
            this.integrator.step(this.particles, subDt);
            for (let i = 0; i < this.iterations; i++) {
                for (const constraint of this.constraints) constraint.solve();
            }
            this.ground.apply(this.particles);
            for (const p of this.particles) {
               p.update(subDt);
            }
            if (this.mouseParticle) {
                this.mouseParticle.position.x = this.mouseX;
                this.mouseParticle.position.y = this.mouseY;
            }
        }
    }

    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw constraints
        for (const constraint of this.constraints) {
            constraint.draw(this.ctx);
        }

        // Draw forces
        for (const force of this.forces) {
            force.draw(this.ctx);
        }

        // Draw particles
        for (const particle of this.particles) {
            particle.draw(this.ctx);
        }
    }

    animate(currentTime) {
        if (!this.isRunning) return;
        if (!this.lastTime) this.lastTime = currentTime;
        const dt = (currentTime - this.lastTime) / 1000; // Convert to seconds
        if (this.frameRate === 0) {
            return;
        }
        if (this.frameRate > 0) {
            const minFrameTime = 1000 / this.frameRate;
            if ((currentTime - this.lastTime) < minFrameTime) {
                requestAnimationFrame((time) => this.animate(time));
                return;
            }
        }
        this.lastTime = currentTime;

        this.update(dt);
        this.draw();

        requestAnimationFrame((time) => this.animate(time));
    }

    start() {
        this.isRunning = true;
        this.lastTime = 0;
        this.draw();
        if (this.frameRate > 0) {
            requestAnimationFrame((time) => this.animate(time));
        }
    }

    pause() {
        this.isRunning = false;
    }
}

function getAngle(p1, p2, p3) {
    const v1x = p1.position.x - p2.position.x;
    const v1y = p1.position.y - p2.position.y;
    const v2x = p3.position.x - p2.position.x;
    const v2y = p3.position.y - p2.position.y;
    const dot = v1x * v2x + v1y * v2y;
    const len1 = Math.hypot(v1x, v1y);
    const len2 = Math.hypot(v2x, v2y);
    return Math.acos(dot / (len1 * len2));
}
