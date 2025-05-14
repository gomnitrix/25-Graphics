class DragForce extends Force {
    constructor(drag = 0.1) {
        super();
        this.drag = drag;
    }
    apply(particles) {
        for (const p of particles) {
            if (!p.fixed) {
                p.applyForce(-p.velocity.x * this.drag, -p.velocity.y * this.drag);
            }
        }
    }
} 