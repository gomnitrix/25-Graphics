class ObjCollision {
    constructor(left, right, top, bottom, restitution = 0.5, friction = 0.5) {
        this.left = left;     
        this.right = right;
        this.top = top;
        this.bottom = bottom;
        this.restitution = restitution;
        this.friction = friction;
        this.margin = 5; // margin for the ground and walls
    }


    
   /*
    constructor(centerX, centerY, radius) {
        this.centerX = centerX;
        this.centerY = centerY;
        this.radius = radius;
        this.margin = 15; // margin for the ground and walls
    }
*/
    apply(particles) {
        for (const p of particles) {
            

            
            // Top
            if (p.position.y > this.top - this.margin && p.position.y < this.top && this.left < p.position.x && p.position.x < this.right) {
                p.position.y = this.top - this.margin;
                p.velocity.y *= -this.restitution;
                p.velocity.x *= this.friction;
            }
            // bottom
            else if (p.position.y > this.bottom && p.position.y < this.bottom + this.margin && this.left < p.position.x && p.position.x < this.right) {
                p.position.y = this.bottom + this.margin;
                p.velocity.y *= -this.restitution;
                p.velocity.x *= this.friction;
            }
            // left
            else if (p.position.x > this.left - this.margin && p.position.x < this.left && this.top < p.position.y && p.position.y < this.bottom) {
                p.position.x = this.left - this.margin;
                p.velocity.x *= -this.restitution;
                p.velocity.y *= this.friction;
            }
            // right
            else if (p.position.x > this.right && p.position.x < this.right + this.margin && this.top < p.position.y && p.position.y < this.bottom) {
                p.position.x = this.right + this.margin;
                p.velocity.x *= -this.restitution;
                p.velocity.y *= this.friction;
            }
                /*
            const r = Math.sqrt((p.position.x-this.centerX) ** 2 + (p.position.y-this.centerY) ** 2)
            const vx = p.velocity.x;
            const vy = p.velocity.y;
            const C1 = this.centerX;
            const C2 = this.centerY;
            const D1 = p.position.x;
            const D2 = p.position.y;
            const vl = Math.sqrt(vx ** 2 + vy ** 2);


            if (r < this.radius + this.margin && r > this.radius) {
                const theta1 = Math.acos((vx*(D1-C1) + vy*(D2-C2)) / (r * vl));
                const theta2 = Math.acos((D1-C1) / r);
                const theta3 = Math.PI/2 - theta2;
                const theta4 = theta1 - theta3;
                p.velocity.x = Math.cos(theta4) * vl;

                p.velocity.y = Math.sin(theta4) * vl;

            }
                */
        }
    }


} 