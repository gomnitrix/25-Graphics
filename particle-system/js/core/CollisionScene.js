class CollisionScene {
    static create(simulation, particleCount = 20) {
        // initialize
        simulation.particles = [];
        simulation.forces = [];
        simulation.constraints = [];
        const canvas = simulation.canvas;
        const width = canvas.width;
        const height = canvas.height;
        // inital particles
        const minSize = 10;
        const maxSize = 30;
        const minVelocity = -50;
        const maxVelocity = 50;
        simulation.particleRadii = [];
        simulation.showVectors = true;
        simulation.collisionRestitution = 0.9;

        // create random particles
        for (let i = 0; i < particleCount; i++) {
            const size = minSize + Math.random() * (maxSize - minSize);
            const margin = maxSize;
            const x = margin + Math.random() * (width - 2 * margin);
            const y = margin + Math.random() * (height - 2 * margin);
            const particle = simulation.addParticle(x, y, size);
            particle.velocity.x = minVelocity + Math.random() * (maxVelocity - minVelocity);
            particle.velocity.y = minVelocity + Math.random() * (maxVelocity - minVelocity);
            simulation.particleRadii.push(size / 2);
            particle.collisionForce = { x: 0, y: 0 };
        }

        // particle collisions
        simulation.checkParticleCollisions = function (particles, particleRadii) {
            const restitution = this.hasOwnProperty('collisionRestitution') ?
                this.collisionRestitution : 0.9;

            for (let i = 0; i < particles.length; i++) {
                const p1 = particles[i];
                const r1 = particleRadii[i];

                // reset collision force
                p1.collisionForce.x = 0;
                p1.collisionForce.y = 0;

                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const r2 = particleRadii[j];

                    // neither particle moves, then jump
                    if (p1.fixed && p2.fixed) continue;

                    // distance between p1, p2
                    const dx = p2.position.x - p1.position.x;
                    const dy = p2.position.y - p1.position.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const minDistance = r1 + r2;

                    // check collision
                    if (distance < minDistance) {
                        // normal (p1 -> p2)
                        const nx = dx / distance;
                        const ny = dy / distance;

                        // relative v
                        const vx = p2.velocity.x - p1.velocity.x;
                        const vy = p2.velocity.y - p1.velocity.y;
                        // the normal component of the relative v
                        const vnDot = vx * nx + vy * ny;

                        // particles are separating, jump
                        if (vnDot > 0) continue;

                        // impulse
                        const m1 = p1.mass;
                        const m2 = p2.mass;
                        const j = -(1 + restitution) * vnDot / (1 / m1 + 1 / m2);

                        // add collision force to the total force
                        if (!p1.fixed) {
                            const collisionForceX = -j * nx / m1 * 20;
                            const collisionForceY = -j * ny / m1 * 20;
                            p1.force.x += collisionForceX;
                            p1.force.y += collisionForceY;
                            p1.collisionForce.x += collisionForceX;
                            p1.collisionForce.y += collisionForceY;
                        }

                        if (!p2.fixed) {
                            const collisionForceX = j * nx / m2 * 20;
                            const collisionForceY = j * ny / m2 * 20;
                            p2.force.x += collisionForceX;
                            p2.force.y += collisionForceY;
                            p2.collisionForce.x += collisionForceX;
                            p2.collisionForce.y += collisionForceY;
                        }

                        // apply impulse to v
                        if (!p1.fixed) {
                            p1.velocity.x -= j * nx / m1;
                            p1.velocity.y -= j * ny / m1;
                        }

                        if (!p2.fixed) {
                            p2.velocity.x += j * nx / m2;
                            p2.velocity.y += j * ny / m2;
                        }

                        // correct positions
                        const overlap = minDistance - distance;
                        const correction = overlap * 0.5;

                        if (!p1.fixed) {
                            p1.position.x -= nx * correction;
                            p1.position.y -= ny * correction;
                        }

                        if (!p2.fixed) {
                            p2.position.x += nx * correction;
                            p2.position.y += ny * correction;
                        }
                    }
                }
            }
        };

        // margin collisions
        const originalGroundApply = simulation.ground.apply;
        simulation.ground.apply = function (particles) {
            originalGroundApply.call(this, particles);

            const w = simulation.canvas.width, h = simulation.canvas.height;
            const margin = this.margin;
            const restitution = this.restitution;

            for (const p of particles) {
                if (p.fixed) continue;

                let hasCollision = false;
                let nx = 0, ny = 0;

                // ground
                if (p.position.y >= h - margin) {
                    ny = -1;
                    hasCollision = true;
                }
                // ceiling
                else if (p.position.y <= margin) {
                    ny = 1;
                    hasCollision = true;
                }
                // left wall
                else if (p.position.x <= margin) {
                    nx = 1;
                    hasCollision = true;
                }
                // right wall
                else if (p.position.x >= w - margin) {
                    nx = -1;
                    hasCollision = true;
                }

                if (hasCollision) {
                    // v before collision
                    const vMag = Math.sqrt(p.velocity.x * p.velocity.x + p.velocity.y * p.velocity.y);
                    // add collision force to total force
                    if (vMag > 0.1) {
                        const collisionForceX = nx * vMag * p.mass * 5;
                        const collisionForceY = ny * vMag * p.mass * 5;
                        p.force.x += collisionForceX;
                        p.force.y += collisionForceY;
                        p.collisionForce.x += collisionForceX;
                        p.collisionForce.y += collisionForceY;
                    }
                }
            }
        };

        simulation.originalGroundApply = originalGroundApply;

        // draw
        function drawArrow(ctx, fromX, fromY, toX, toY, color) {
            // segment
            ctx.beginPath();
            ctx.moveTo(fromX, fromY);
            ctx.lineTo(toX, toY);
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.stroke();

            // arrow
            const arrowSize = 7;
            const angle = Math.atan2(toY - fromY, toX - fromX);
            ctx.beginPath();
            ctx.moveTo(toX, toY);
            ctx.lineTo(
                toX - arrowSize * Math.cos(angle - Math.PI / 6),
                toY - arrowSize * Math.sin(angle - Math.PI / 6)
            );
            ctx.lineTo(
                toX - arrowSize * Math.cos(angle + Math.PI / 6),
                toY - arrowSize * Math.sin(angle + Math.PI / 6)
            );
            ctx.fillStyle = color;
            ctx.fill();
        }

        const originalDrawParticle = Particle.prototype.draw;

        Particle.prototype.draw = function (ctx) {
            const index = simulation.particles.indexOf(this);
            if (index !== -1 && simulation.particleRadii && index < simulation.particleRadii.length) {
                const radius = simulation.particleRadii[index];
                ctx.beginPath();
                ctx.arc(this.position.x, this.position.y, radius, 0, Math.PI * 2);
                ctx.fillStyle = this.fixed ? '#ffd369' : '#00adb5';
                ctx.fill();
                ctx.closePath();

                if (simulation.showVectors) {
                    // velocity vector (blue)
                    const speedScale = 1.5;
                    const vx = this.velocity.x * speedScale;
                    const vy = this.velocity.y * speedScale;
                    const vMag = Math.sqrt(vx * vx + vy * vy);

                    // force vector (red)
                    const forceScale = 0.1;
                    const fx = this.force.x * forceScale;
                    const fy = this.force.y * forceScale;
                    const fMag = Math.sqrt(fx * fx + fy * fy);

                    if (vMag > 0.1) {
                        drawArrow(ctx, this.position.x, this.position.y,
                            this.position.x + vx, this.position.y + vy, '#1e88e5');
                    }

                    if (fMag > 0.1) {
                        drawArrow(ctx, this.position.x, this.position.y,
                            this.position.x + fx, this.position.y + fy, '#e53935');
                    }
                }
            } else {
                originalDrawParticle.call(this, ctx);
            }
        };

        simulation.originalDrawParticle = originalDrawParticle;

        simulation.drawLegend = function (ctx) {
            if (this.showVectors) {
                const padding = 10;
                const lineLength = 30;
                const fontSize = 14;
                ctx.font = fontSize + 'px Arial';

                drawArrow(ctx, padding, padding, padding + lineLength, padding, '#1e88e5');
                ctx.fillStyle = '#222831';
                ctx.fillText('Velocity', padding + lineLength + 5, padding + fontSize / 2 - 2);

                drawArrow(ctx, padding, padding + fontSize + 10,
                    padding + lineLength, padding + fontSize + 10, '#e53935');
                ctx.fillStyle = '#222831';
                ctx.fillText('Force', padding + lineLength + 5, padding + fontSize + 10 + fontSize / 2 - 2);
            }
        };

        const originalUpdate = simulation.update;
        simulation.update = function (dt) {
            originalUpdate.call(this, dt);

            if (this.hasOwnProperty('particleRadii') && this.showVectors) {
                // clear forces
                for (const p of this.particles) {
                    p.force.x = 0;
                    p.force.y = 0;
                }

                // recalculate forces
                this.gravity.apply(this.particles);

                // aplly other forces
                for (const force of this.forces) {
                    force.apply();
                }
            }
        };

        simulation.originalUpdate = originalUpdate;
    }


    static cleanup(simulation) {
        if (simulation.hasOwnProperty('originalDrawParticle')) {
            Particle.prototype.draw = simulation.originalDrawParticle;
            delete simulation.originalDrawParticle;
        }

        if (simulation.hasOwnProperty('originalUpdate')) {
            simulation.update = simulation.originalUpdate;
            delete simulation.originalUpdate;
        }

        if (simulation.hasOwnProperty('originalGroundApply')) {
            simulation.ground.apply = simulation.originalGroundApply;
            delete simulation.originalGroundApply;
        }

        if (simulation.hasOwnProperty('particleRadii')) {
            delete simulation.particleRadii;
        }
        if (simulation.hasOwnProperty('showVectors')) {
            delete simulation.showVectors;
        }
        if (simulation.hasOwnProperty('collisionRestitution')) {
            delete simulation.collisionRestitution;
        }

        if (typeof simulation.drawLegend === 'function') {
            delete simulation.drawLegend;
        }

        if (simulation.hasOwnProperty('checkParticleCollisions')) {
            delete simulation.checkParticleCollisions;
        }
    }
}