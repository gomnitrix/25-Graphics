class SpringForce extends Force {
    constructor(p1, p2, restLength, stiffness, damping = 0.1) {
        super();
        this.p1 = p1;
        this.p2 = p2;
        this.restLength = restLength;
        this.stiffness = stiffness;
        this.damping = damping;
        this.stiffnessConstant = 1.0;
    }
    setStiffness(value) {
        this.stiffness = value;
    }
    setDamping(value) {
        this.damping = value;
    }

    apply() {
        // calculate position differences 
        const dx = this.p1.position.x - this.p2.position.x;
        const dy = this.p1.position.y - this.p2.position.y;
        const dist = Math.hypot(dx, dy);
        
        // calculate velocity differences 
        const dvx = this.p1.velocity.x - this.p2.velocity.x;
        const dvy = this.p1.velocity.y - this.p2.velocity.y;

        const springForce = -(this.stiffnessConstant * this.stiffness * (dist - this.restLength));
        
        const fx = (springForce - (this.damping * (dvx * dx)) / dist) * (dx / dist);
        const fy = (springForce - (this.damping * (dvy * dy)) / dist) * (dy / dist);

        if (!isNaN(fx) && isFinite(fx)) {
            this.p1.applyForce(fx, 0);
            this.p2.applyForce(-fx, 0);
        }
        if (!isNaN(fy) && isFinite(fy)) {
            this.p1.applyForce(0, fy);
            this.p2.applyForce(0, -fy);
        }

        const maxVelocity = 800;
        this.p1.velocity.x = Math.max(-maxVelocity, Math.min(maxVelocity, this.p1.velocity.x));
        this.p1.velocity.y = Math.max(-maxVelocity, Math.min(maxVelocity, this.p1.velocity.y));
        this.p2.velocity.x = Math.max(-maxVelocity, Math.min(maxVelocity, this.p2.velocity.x));
        this.p2.velocity.y = Math.max(-maxVelocity, Math.min(maxVelocity, this.p2.velocity.y));
    }

    draw(ctx) {
        const dx = this.p2.position.x - this.p1.position.x;
        const dy = this.p2.position.y - this.p1.position.y;
        const dist = Math.hypot(dx, dy);
        const delta = (dist - this.restLength) / this.restLength;
        let color;
        if (delta < -0.05) {
            // Compressed: red to purple
            color = lerpColor('#ff3b30', '#a259f7', Math.min(1, Math.abs(delta) / 0.3));
        } else if (delta > 0.05) {
            // Stretched: purple to blue
            color = lerpColor('#a259f7', '#0099ff', Math.min(1, delta / 0.3));
        } else {
            // Normal: purple
            color = '#a259f7';
        }
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(this.p1.position.x, this.p1.position.y);
        ctx.lineTo(this.p2.position.x, this.p2.position.y);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.8;
        ctx.stroke();
        ctx.globalAlpha = 1.0;
        ctx.closePath();
        ctx.restore();
    }
}

function lerpColor(a, b, t) {
    const ah = a.replace('#', '');
    const bh = b.replace('#', '');
    const ar = parseInt(ah.substring(0, 2), 16), ag = parseInt(ah.substring(2, 4), 16), ab = parseInt(ah.substring(4, 6), 16);
    const br = parseInt(bh.substring(0, 2), 16), bg = parseInt(bh.substring(2, 4), 16), bb = parseInt(bh.substring(4, 6), 16);
    const rr = Math.round(ar + (br - ar) * t);
    const rg = Math.round(ag + (bg - ag) * t);
    const rb = Math.round(ab + (bb - ab) * t);
    return `#${((1 << 24) + (rr << 16) + (rg << 8) + rb).toString(16).slice(1)}`;
} 