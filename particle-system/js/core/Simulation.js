class Simulation {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.forces = [];
        this.constraints = [];
        this.lastTime = 0;
        this.isRunning = true;
        this.gravity = new GravityForce(25);
        this.drag = new DragForce(0.2);
        this.ground = new GroundForce(canvas, 0.8, 0.8);
        this.timestep = 1 / 48; // fixed timestep (seconds)
        this.substeps = 10; // substeps per frame
        this.frameRate = 40;
        this.integrator = new VerletIntegrator(this);
        this.constraintSolver = null;  // will be created when constraints are added

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

    updateConstraintSolver() {
        if (this.constraints.length > 0) {
            this.constraintSolver = new GlobalSolver(this.particles, this.constraints);
        } else {
            this.constraintSolver = null;
        }
    }

    addRodConstraint1(particle1, particle2, distance) {
        const constraint = new RodConstraint1(particle1, particle2, distance);
        this.constraints.push(constraint);
        this.updateConstraintSolver();
        return constraint;
    }

    addRodConstraint2(particle1, particle2, distance) {
        const constraint = new RodConstraint2(particle1, particle2, distance);
        this.constraints.push(constraint);
        this.updateConstraintSolver();
        return constraint;
    }

    // addDistanceConstraint(particle1, particle2, distance) {
    //     const constraint = new RodConstraint(particle1, particle2, distance);
    //     this.constraints.push(constraint);
    //     // Update the global solver when constraints change
    //     this.updateConstraintSolver();
    //     return constraint;
    // }

    addAngularSpring(particle1, particle2, particle3, restAngle, stiffness, damping) {
        const spring = new AngularSpringForce(particle1, particle2, particle3, restAngle, stiffness, damping);
        this.forces.push(spring);
        return spring;
    }

    addCircularWire(particle, centerX, centerY, radius) {
        const constraint = new CircularWireConstraint(particle, centerX, centerY, radius);
        this.constraints.push(constraint);
        this.updateConstraintSolver();
        return constraint;
    }

    // Scene creation methods
    createSpringStructure(x, y, particlesNum, width = 50, height = 20) {
        AngularSpringScene.create(this, x, y, particlesNum, width, height);
    }

    createCircleScene() {
        CircleScene.create(this);
    }

    createSquareScene() {
        SquareScene.create(this);
    }

    createDoublePendulumScene() {
        DoublePendulumScene.create(this);
    }

    createCollisionScene(particleCount) {
        CollisionScene.create(this, particleCount);
    }

    createFall(){
        FreeFallScene.create(this);
    }

    update1() {
        // clear forces
        for (const p of this.particles) {
            p.force.x = 0;
            p.force.y = 0;
        }

        // aplly forces
        this.gravity.apply(this.particles);
        this.drag.apply(this.particles);
        this.ground.apply(this.particles);
        for (const force of this.forces) force.apply();

        // mouse
        if (this.mouseParticle) {
            this.mouseParticle.position.x = this.mouseX;
            this.mouseParticle.position.y = this.mouseY;
        }

        // constraints
        if (this.constraintSolver) {
            this.constraintSolver.step();
        }

        // derivatives
        const derivatives = [];
        for (const p of this.particles) {
            derivatives.push({
                v: { x: p.velocity.x, y: p.velocity.y },
                a: {
                    x: p.force.x / p.mass,
                    y: p.force.y / p.mass
                }
            });
        }

        return derivatives;
    }

    update2(derivatives, dt, n = 1.0) {
        this.particles.forEach((p, i) => {
            if (p.fixed) return;

            const deriv = derivatives[i];

            p.position.x += n * (dt * deriv.v.x);
            p.position.y += n * (dt * deriv.v.y);
            p.velocity.x += n * (dt * deriv.a.x);
            p.velocity.y += n * (dt * deriv.a.y);
        });
    }

    update(dt) {
        const subDt = this.timestep;
        for (let s = 0; s < this.substeps; s++) {
            // integrations
            this.integrator.step(this.particles, subDt);
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
            if (typeof force.draw === 'function') {
                force.draw(this.ctx);
            }
        }

        // Draw particles
        for (const particle of this.particles) {
            particle.draw(this.ctx);
        }

        if (typeof this.drawLegend === 'function' && this.hasOwnProperty('particleRadii')) {
            this.drawLegend(this.ctx);
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