/**
 * tensorCalculations.js
 * Comprehensive physics engine:
 * - AdS/CFT geometric deformation
 * - Schwarzschild event horizon collapse dynamics
 * - Curvature stress & metric calculations
 * - Traveling graviton wave propagation
 * - Geodesic path tracing (gravitational light bending)
 */

export function calculateNodeState(
  baseX,
  baseY,
  baseZ,
  baseDist,
  time,
  entanglement,
  stateMode,
  perturbation,
  blackHoleActive
) {
  const normDist = Math.max(0.001, baseDist / 5);

  let warpFactor = 1.0;
  let waveAmp = 0.12 * entanglement;
  let freq = 2.8;

  switch (stateMode) {
    case 'bell': {
      const axisAlignment = Math.abs(baseX) / (baseDist + 0.001);
      warpFactor = 1.0 - Math.pow(entanglement, 1.4) * 0.65 * axisAlignment;
      waveAmp *= 0.6;
      break;
    }
    case 'ghz': {
      warpFactor = 1.0 - Math.pow(entanglement, 1.6) * 0.5 * normDist;
      freq = 4.5;
      waveAmp = 0.22 * entanglement;
      break;
    }
    case 'thermal': {
      warpFactor = 1.0 - entanglement * 0.1;
      waveAmp = 0.3 * (0.3 + entanglement);
      freq = 1.2;
      break;
    }
    case 'standard':
    default: {
      warpFactor = 1.0 - Math.pow(entanglement, 1.5) * 0.45 * normDist;
      break;
    }
  }

  const phase = baseDist * 2.2;
  const jitterX = Math.sin(time * freq + phase) * waveAmp;
  const jitterY = Math.cos(time * (freq * 0.85) - phase) * waveAmp;
  const jitterZ = Math.sin(time * (freq * 1.15) + phase) * waveAmp;

  let finalX = baseX * warpFactor + jitterX;
  let finalY = baseY * warpFactor + jitterY;
  let finalZ = baseZ * warpFactor + jitterZ;

  if (blackHoleActive) {
    const rSchwarzschild = 1.8;
    const currentR = Math.sqrt(finalX * finalX + finalY * finalY + finalZ * finalZ);

    if (currentR < rSchwarzschild * 2.5) {
      const sinkStrength = Math.pow(1 - currentR / (rSchwarzschild * 2.5), 2) * 0.75;
      finalX *= 1 - sinkStrength;
      finalY *= 1 - sinkStrength;
      finalZ *= 1 - sinkStrength;
    }
  }

  if (perturbation && perturbation.active) {
    const elapsed = time - perturbation.startTime;
    const waveSpeed = 4.0;
    const waveRadius = elapsed * waveSpeed;
    const distToPulse = Math.abs(baseDist - waveRadius);

    if (distToPulse < 1.2 && elapsed < 3.0) {
      const pulseMagnitude = Math.exp(-distToPulse * 2.5) * Math.sin(distToPulse * 6 - elapsed * 8) * 0.4;
      finalX += (baseX / (baseDist + 0.001)) * pulseMagnitude;
      finalY += (baseY / (baseDist + 0.001)) * pulseMagnitude;
      finalZ += (baseZ / (baseDist + 0.001)) * pulseMagnitude;
    }
  }

  const currentDist = Math.sqrt(finalX * finalX + finalY * finalY + finalZ * finalZ);
  const strain = Math.abs(currentDist - baseDist) / (baseDist + 0.001);

  return { x: finalX, y: finalY, z: finalZ, strain };
}

/**
 * Numerically integrates null geodesics through the warped spacetime metric
 */
export function traceGeodesicRays(impactParamY, entanglement, blackHoleActive) {
  const steps = 60;
  const stepSize = 0.22;
  const rays = [-1.2, 0.0, 1.2]; // 3 parallel photon rays at distinct Z-offsets

  return rays.map((zOffset) => {
    const points = [];
    let px = -6.5;
    let py = impactParamY;
    let pz = zOffset;

    let vx = 1.0;
    let vy = 0.0;
    let vz = 0.0;

    for (let s = 0; s < steps; s++) {
      points.push(px, py, pz);

      const r = Math.sqrt(px * px + py * py + pz * pz);
      const safeR = Math.max(0.6, r);

      // Gravitational acceleration proxy (Christoffel connection coefficient Gamma^mu_alpha_beta)
      let fieldStrength = (entanglement * 1.8) / Math.pow(safeR, 3);
      if (blackHoleActive) {
        fieldStrength += 5.2 / Math.pow(safeR, 3);
      }

      // Deflect velocity vector inward toward origin
      vx -= (px / safeR) * fieldStrength * stepSize;
      vy -= (py / safeR) * fieldStrength * stepSize;
      vz -= (pz / safeR) * fieldStrength * stepSize;

      // Normalize velocity to speed of light c = 1
      const vMag = Math.sqrt(vx * vx + vy * vy + vz * vz);
      vx /= vMag;
      vy /= vMag;
      vz /= vMag;

      px += vx * stepSize;
      py += vy * stepSize;
      pz += vz * stepSize;

      // Stop if photon enters event horizon
      if (blackHoleActive && r < 1.35) {
        points.push(px, py, pz);
        break;
      }
    }

    return new Float32Array(points);
  });
}

export function computeMetricTelemetry(entanglement, stateMode, blackHoleActive, impactParamY) {
  let g00Val = -(1 - Math.min(0.85, entanglement * 0.7));
  let grrVal = 1 / (1 - Math.min(0.85, entanglement * 0.65) + 0.001);
  let ricciBase = entanglement * 4.2;

  if (blackHoleActive) {
    g00Val = -0.05;
    grrVal = 14.82;
    ricciBase += 12.5;
  } else {
    if (stateMode === 'ghz') ricciBase *= 1.6;
    if (stateMode === 'bell') ricciBase *= 1.25;
    if (stateMode === 'thermal') ricciBase *= 0.2;
  }

  // Einstein Deflection Angle proxy: theta ~ 4GM / (c^2 * b)
  const safeB = Math.max(0.5, Math.abs(impactParamY));
  const massProxy = blackHoleActive ? 2.5 : entanglement * 0.9;
  const deflectionAngleRad = ((4 * massProxy) / safeB).toFixed(2);

  return {
    g00: g00Val.toFixed(3),
    grr: grrVal.toFixed(3),
    ricciScalar: ricciBase.toFixed(2),
    vonNeumannEntropy: (blackHoleActive ? 0.99 : (stateMode === 'thermal' ? 0.95 : entanglement * 0.82)).toFixed(3),
    deflectionAngle: `${deflectionAngleRad} rad`
  };
}
