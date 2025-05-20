class GlobalSolver {
    constructor(particles, constraints) {
        this.particles = particles;
        this.constraints = constraints;
    }

    step() {
        const { J, Jdot, Q, W, JWJT, RHS } = this.assembleGlobalMatrix();
        const lambdas = this.solveLagrangeMultiplier(JWJT, RHS);

        // Compute Qhat = J^T * lambda and apply
        const Qhat = this.computeConstraintForces(J, lambdas);
        this.particles.forEach((p, i) => {
            p.force.x += Qhat[2 * i];
            p.force.y += Qhat[2 * i + 1];
        });

        // apply feedback forces
        this.constraints.forEach(constraint => {
            if (constraint.feedbackforces) {
                constraint.feedbackforces.forEach(force => {
                    force.apply();
                });
            }
        });
    }

    assembleGlobalMatrix() {
        const N = this.particles.length;
        const M = this.constraints.length;
        // build J (M x 2N), J_dot, Q (2N)
        const J = Array(M).fill().map(() => Array(2 * N).fill(0));
        const Jdot = Array(M).fill().map(() => Array(2 * N).fill(0));
        const Q = Array(2 * N).fill(0);
        const W = Array(2 * N).fill(0);

        // fill Q and W
        this.particles.forEach((p, idx) => {
            if (p.fixed) {
                // Fixed: no force contribution, zero mass weight
                Q[2 * idx] = 0;
                Q[2 * idx + 1] = 0;
                W[2 * idx] = 0;
                W[2 * idx + 1] = 0;
            } else {
                Q[2 * idx] = p.force.x;
                Q[2 * idx + 1] = p.force.y;
                W[2 * idx] = 1 / p.mass;
                W[2 * idx + 1] = 1 / p.mass;
            }
        });

        // fill J, Jdot rows
        this.constraints.forEach((c, i) => {
            const particles = c.affectedParticles();
            const jac = c.computeJacobian();
            const jacDot = c.computeJacobianDot();
            particles.forEach((p, k) => {
                const idx = this.particles.indexOf(p);
                if (p.fixed) {
                    // Skip fixed
                    J[i][2 * idx] = 0;
                    J[i][2 * idx + 1] = 0;
                    Jdot[i][2 * idx] = 0;
                    Jdot[i][2 * idx + 1] = 0;
                } else {
                    // Assign jacobian entries
                    J[i][2 * idx] = jac[2 * k] !== undefined ? jac[2 * k] : jac[0];
                    J[i][2 * idx + 1] = jac[2 * k + 1] !== undefined ? jac[2 * k + 1] : jac[1];
                    Jdot[i][2 * idx] = jacDot[2 * k] !== undefined ? jacDot[2 * k] : jacDot[0];
                    Jdot[i][2 * idx + 1] = jacDot[2 * k + 1] !== undefined ? jacDot[2 * k + 1] : jacDot[1];
                }
            });
        });

        // compute JWJT and RHS: JWJT[i][j] = sum_k J[i][k]*W[k]*J[j][k]
        const JWJT = Array(M).fill().map(() => Array(M).fill(0));
        const RHS = Array(M).fill(0);
        for (let i = 0; i < M; ++i) {
            for (let j = 0; j < M; ++j) {
                let sum = 0;
                for (let k = 0; k < 2 * N; ++k) sum += J[i][k] * W[k] * J[j][k];
                JWJT[i][j] = sum;
            }
            // RHS[i] = - (sum_k Jdot[i][k]*v[k] + sum_k J[i][k]*W[k]*Q[k])
            let term1 = 0, term2 = 0;
            for (let k = 0; k < 2 * N; ++k) {
                const v = (k % 2 === 0 ? this.particles[k / 2 | 0].velocity.x : this.particles[(k - 1) / 2 | 0].velocity.y);
                term1 += Jdot[i][k] * v;
                term2 += J[i][k] * W[k] * Q[k];
            }
            RHS[i] = - (term1 + term2);
        }
        return { J, Jdot, Q, W, JWJT, RHS };
    }

    computeConstraintForces(J, lambdas) {
        const N2 = J[0].length;
        const M = J.length;
        const Qhat = Array(N2).fill(0);
        for (let i = 0; i < M; i++) {
            for (let k = 0; k < N2; k++) {
                Qhat[k] += J[i][k] * lambdas[i];
            }
        }
        return Qhat;
    }


    solveLagrangeMultiplier(A, b) {
        const M = b.length;
        // Convert dense A to CCS
        const rows = [], cols = [], vals = [];
        for (let i = 0; i < M; ++i) {
            for (let j = 0; j < M; ++j) {
                const v = A[i][j];
                if (v !== 0) {
                    rows.push(i);
                    cols.push(j);
                    vals.push(v);
                }
            }
        }
        const ccsA = numeric.ccsScatter([rows, cols, vals]);

        // Convert b to CCS (Mx1)
        const brow = [], bcol = [], bval = [];
        for (let i = 0; i < M; ++i) {
            brow.push(i);
            bcol.push(0);
            bval.push(b[i]);
        }
        const ccsb = numeric.ccsScatter([brow, bcol, bval]);

        // Solve using LUP with pivoting
        const lu = numeric.ccsLUP(ccsA);
        const lmbccs = numeric.ccsLUPSolve(lu, ccsb);

        // Convert back to full vector and return as 1D array
        const lambdaFull = numeric.ccsFull(lmbccs);
        return lambdaFull.map(row => row[0]);
    }
}