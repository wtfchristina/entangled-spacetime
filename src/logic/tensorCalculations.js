/**
 * tensorCalculations.js
 * Computes coordinate deformation, localized curvature heatmaps,
 * metric tensor approximations, and traveling gravitational wave perturbations.
 */

export function calculateNodeState(
  baseX,
  baseY,
  baseZ,
  baseDist,
  time,
  entanglement,
  stateMode,
  perturbation
) {
  const normDist = Math.max(0.001, baseDist / 5);

  let warpFactor = 1.0;
  let waveAmp = 0.12 * entanglement;
  let freq = 2.8;

  // Layer 2: Quantum State Specific Dynamics
  switch (stateMode) {
    case 'bell': {
      // Bell pair: concentrate warping along the central X axis
      const axisAlignment = Math.abs(baseX) / (baseDist + 0.001);
      warpFactor = 1.0 - Math.pow(entanglement, 1.4) * 0.65 * axisAlignment;
      waveAmp *= 0.6;
      break;
    }
    case 'ghz': {
      // GHZ: uniform, maximum global coherence and sharp inward contraction
      warpFactor = 1.0 - Math.pow(entanglement, 1.6) * 0.5 * normDist;
      freq = 4.5;
      waveAmp = 0.22 * entanglement;
      break;
    }
    case 'thermal': {
      // Thermal mixed state: high decoherence, minimal geometric contraction
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

  // Base quantum fluctuations
  const phase = baseDist * 2.2;
  const jitterX = Math.sin(time * freq + phase) * waveAmp;
  const jitterY = Math.cos(time * (freq * 0.85) - phase) * waveAmp;
  const jitterZ = Math.sin(time * (freq * 1.15) + phase) * waveAmp;

  let finalX = baseX * warpFactor + jitterX;
  let finalY = baseY * warpFactor + jitterY;
  let finalZ = baseZ * warpFactor + jitterZ;

  // Layer 3: Gravitational Wave Ripple Propagation
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

  // Local stretch metric (proxy for curvature stress)
  const currentDist = Math.sqrt(finalX * finalX + finalY * finalY + finalZ * finalZ);
  const strain = Math.abs(currentDist - baseDist) / (baseDist + 0.001);

  return {
    x: finalX,
    y: finalY,
    z: finalZ,
    strain
  };
}

export function computeMetricTelemetry(entanglement, stateMode) {
  // Metric tensor component approximations: g_00 and spatial g_rr
  const g00 = -(1 - Math.min(0.85, entanglement * 0.7)).toFixed(3);
  const grr = (1 / (1 - Math.min(0.85, entanglement * 0.65) + 0.001)).toFixed(3);

  // Ricci Curvature Scalar approximation R (in units of 1/L^2)
  let ricciBase = entanglement * 4.2;
  if (stateMode === 'ghz') ricciBase *= 1.6;
  if (stateMode === 'bell') ricciBase *= 1.25;
  if (stateMode === 'thermal') ricciBase *= 0.2;

  const ricciScalar = ricciBase.toFixed(2);
  const vonNeumannEntropy = (stateMode === 'thermal' ? 0.95 : entanglement * 0.82).toFixed(3);

  return { g00, grr, ricciScalar, vonNeumannEntropy };
}
