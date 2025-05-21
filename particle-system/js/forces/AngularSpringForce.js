class AngularSpringForce extends Force {
    constructor(p1, p2, p3, restAngleDegree, stiffness=1.2, damping = 1) {
        super();
        this.p1 = p1; // Outer particle 1
        this.p2 = p2; // Central particle
        this.p3 = p3; // Outer particle 3
        this.restAngle = restAngleDegree;
        this.stiffness = stiffness;
        this.damping = damping;
        
        const b = Math.hypot(p1.position.x - p2.position.x, p1.position.y - p2.position.y);
        const c = Math.hypot(p3.position.x - p2.position.x, p3.position.y - p2.position.y);
        const angleRad = this.restAngle * Math.PI / 180;
        const targetDistP1P3 = Math.sqrt(b * b + c * c - 2 * b * c * Math.cos(angleRad));
        this.internalSpring = new SpringForce(p1, p3, targetDistP1P3, stiffness, damping);
    }

    apply() {
        const b = Math.hypot(this.p1.position.x - this.p2.position.x, this.p1.position.y - this.p2.position.y);
        const c = Math.hypot(this.p3.position.x - this.p2.position.x, this.p3.position.y - this.p2.position.y);
        if (b < 1e-6 || c < 1e-6) return;
        const angleRad = this.restAngle * Math.PI / 180;
        const targetDistP1P3 = Math.sqrt(b * b + c * c - 2 * b * c * Math.cos(angleRad));
        this.internalSpring.restLength = targetDistP1P3;
        this.internalSpring.apply();
    }

    draw(ctx) {
        this.internalSpring.draw(ctx);
    }

    setStiffness(value) {
        this.stiffness = value;
        if (this.internalSpring) this.internalSpring.setStiffness(value);
    }

    setDamping(value) {
        this.damping = value;
        if (this.internalSpring) this.internalSpring.setDamping(value);
    }
} 