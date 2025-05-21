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
                // skip fixed
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
                    // skip fixed
                    J[i][2 * idx] = 0;
                    J[i][2 * idx + 1] = 0;
                    Jdot[i][2 * idx] = 0;
                    Jdot[i][2 * idx + 1] = 0;
                } else {
                    // assign jacobian entries
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

    // LU decomposition and solver for Ax = b
    solveLagrangeMultiplier(A, b) {
        const n = b.length;
        const matrixA = A.map(row => [...row]);
        const vectorB = [...b];

        // Add regularization to improve numerical stability
        for (let i = 0; i < n; i++) {
            matrixA[i][i] += 1e-7;  // Small regularization term
        }

        // LU decomposition
        for (let k = 0; k < n - 1; k++) {
            let maxIdx = k;
            let maxVal = Math.abs(matrixA[k][k]);

            for (let i = k + 1; i < n; i++) {
                if (Math.abs(matrixA[i][k]) > maxVal) {
                    maxIdx = i;
                    maxVal = Math.abs(matrixA[i][k]);
                }
            }

            if (maxIdx !== k) {
                [matrixA[k], matrixA[maxIdx]] = [matrixA[maxIdx], matrixA[k]];
                [vectorB[k], vectorB[maxIdx]] = [vectorB[maxIdx], vectorB[k]];
            }

            if (Math.abs(matrixA[k][k]) < 1e-10) {
                matrixA[k][k] += 1e-10;
            }

            // elimination
            for (let i = k + 1; i < n; i++) {
                const factor = matrixA[i][k] / matrixA[k][k];
                matrixA[i][k] = factor;

                for (let j = k + 1; j < n; j++) {
                    matrixA[i][j] -= factor * matrixA[k][j];
                }

                vectorB[i] -= factor * vectorB[k];
            }
        }

        const x = new Array(n).fill(0);

        for (let i = n - 1; i >= 0; i--) {
            let sum = 0;
            for (let j = i + 1; j < n; j++) {
                sum += matrixA[i][j] * x[j];
            }
            x[i] = (vectorB[i] - sum) / matrixA[i][i];
        }

        return x;
    }

    
    // matrix-vector multiplication
    multiplyMatrixVector(A, v) {
        const n = A.length;
        const result = new Array(n).fill(0);

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                result[i] += A[i][j] * v[j];
            }
        }

        return result;
    }

    // vector dot product
    dotProduct(a, b) {
        let sum = 0;
        for (let i = 0; i < a.length; i++) {
            sum += a[i] * b[i];
        }
        return sum;
    }
}
