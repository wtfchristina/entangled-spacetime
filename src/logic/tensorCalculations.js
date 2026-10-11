/**
 * tensorCalculations.js
 * Comprehensive physics engine:
 * - AdS/CFT geometric deformation
 * - Schwarzschild event horizon collapse dynamics
 * - Curvature stress & metric calculations
 * - Traveling graviton wave propagation
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

  // Quantum State Topology Profiles
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

  // Base quantum uncertainty oscillations
  const phase = baseDist * 2.2;
  const jitterX = Math.sin(time * freq + phase) * waveAmp;
  const jitterY = Math.cos(time * (freq * 0.85) - phase) * waveAmp;
  const jitterZ = Math.sin(time * (freq * 1.15) + phase) * waveAmp;

  let finalX = baseX * warpFactor + jitterX;
  let finalY = baseY * warpFactor + jitterY;
  let finalZ = baseZ * warpFactor + jitterZ;

  // Layer 4 Feature: Black Hole Singularity Collapse (Schwarzschild metric sink)
  if (blackHoleActive) {
    const rSchwarzschild = 1.8;
    const currentR = Math.sqrt(finalX * finalX + finalY * finalY + finalZ * finalZ);

    if (currentR < rSchwarzschild * 2.5) {
      // Powerful gravitational pull toward origin
      const sinkStrength = Math.pow(1 - currentR / (rSchwarzschild * 2.5), 2) * 0.75;
      finalX *= 1 - sinkStrength;
      finalY *= 1 - sinkStrength;
      finalZ *= 1 - sinkStrength;
    }
  }

  // Gravitational Wave Pulse Propagation
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

  // Strain calculation (curvature proxy)
  const currentDist = Math.sqrt(finalX * finalX + finalY * finalY + finalZ * finalZ);
  const strain = Math.abs(currentDist - baseDist) / (baseDist + 0.001);

  return {
    x: finalX,
    y: finalY,
    z: finalZ,
    strain
  };
}

export function computeMetricTelemetry(entanglement, stateMode, blackHoleActive) {
  let g00Val = -(1 - Math.min(0.85, entanglement * 0.7));
  let grrVal = 1 / (1 - Math.min(0.85, entanglement * 0.65) + 0.001);
  let ricciBase = entanglement * 4.2;

  if (blackHoleActive) {
    g00Val = -0.05; // Extreme gravitational time dilation near event horizon
    grrVal = 14.82; // Extreme spatial stretching
    ricciBase += 12.5; // Curvature singularity spike
  } else {
    if (stateMode === 'ghz') ricciBase *= 1.6;
    if (stateMode === 'bell') ricciBase *= 1.25;
    if (stateMode === 'thermal') ricciBase *= 0.2;
  }

  return {
    g00: g00Val.toFixed(3),
    grr: grrVal.toFixed(3),
    ricciScalar: ricciBase.toFixed(2),
    vonNeumannEntropy: (blackHoleActive ? 0.99 : (stateMode === 'thermal' ? 0.95 : entanglement * 0.82)).toFixed(3)
  };
}
