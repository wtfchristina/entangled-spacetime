/**
 * tensorCalculations.js
 * Holographic Spacetime, Traversable Wormhole Protocol, and QEC Engine
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
  blackHoleActive,
  erBridgeActive,
  nodeIndex,
  syndromeErrors = [],
  teleportPacket = null
) {
  const normDist = Math.max(0.001, baseDist / 5);

  let warpFactor = 1.0;
  let waveAmp = 0.12 * entanglement;
  let freq = 2.8;

  const hasError = syndromeErrors.includes(nodeIndex);

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

  if (hasError) {
    finalX += Math.sin(time * 18 + nodeIndex) * 0.22;
    finalY += Math.cos(time * 18 + nodeIndex) * 0.22;
    finalZ += Math.sin(time * 22 + nodeIndex) * 0.22;
  }

  if (erBridgeActive) {
    const separation = 4.8;
    const sideSign = baseX >= 0 ? 1 : -1;
    finalX = baseX * 0.7 + sideSign * separation;
    finalY = baseY * 0.75;
    finalZ = baseZ * 0.75;

    const pullTowardsThroat = entanglement * 1.2 * Math.exp(-Math.abs(baseX));
    finalX -= sideSign * pullTowardsThroat;

    // Shockwave pulse dilation during teleportation
    if (teleportPacket && teleportPacket.active) {
      const shockEffect = Math.sin(time * 12) * 0.18 * Math.exp(-Math.abs(baseX));
      finalY += shockEffect;
    }
  }

  if (blackHoleActive && !erBridgeActive) {
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

  return { x: finalX, y: finalY, z: finalZ, strain, hasError };
}

export function calculateRyuTakayanagiSurface(boundaryAngle, entanglement) {
  const steps = 40;
  const radius = 4.4;
  const maxDip = (boundaryAngle / Math.PI) * (2.8 * (1 - entanglement * 0.35));

  const vertices = [];
  const halfAngle = boundaryAngle / 2;

  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * 2 - 1;
    const phi = t * halfAngle;

    const dip = (1 - t * t) * maxDip;
    const currentR = radius - dip;

    const x = Math.sin(phi) * currentR;
    const y = Math.cos(phi) * currentR;
    const z = 0;

    vertices.push(x, y, z);
  }

  let geodesicArea = 0;
  for (let i = 0; i < vertices.length - 3; i += 3) {
    const dx = vertices[i + 3] - vertices[i];
    const dy = vertices[i + 4] - vertices[i + 1];
    const dz = vertices[i + 5] - vertices[i + 2];
    geodesicArea += Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  return {
    vertices: new Float32Array(vertices),
    minimalArea: geodesicArea.toFixed(2),
    holographicEntropy: (geodesicArea / 4).toFixed(3)
  };
}

export function generateWormholeGeometry(entanglement, time) {
  const numRings = 24;
  const pointsPerRing = 16;
  const bridgeLength = 7.5;
  const throatRadius = Math.max(0.15, Math.sqrt(entanglement) * 1.35);

  const ringVertices = [];
  const lineIndices = [];

  for (let r = 0; r <= numRings; r++) {
    const u = (r / numRings) * 2 - 1;
    const x = u * (bridgeLength / 2);
    const localRadius = throatRadius * Math.cosh(u * 1.3) + Math.sin(time * 3 + u * 4) * 0.06;

    for (let p = 0; p < pointsPerRing; p++) {
      const theta = (p / pointsPerRing) * Math.PI * 2;
      const y = Math.sin(theta) * localRadius;
      const z = Math.cos(theta) * localRadius;
      ringVertices.push(x, y, z);
    }
  }

  for (let r = 0; r < numRings; r++) {
    for (let p = 0; p < pointsPerRing; p++) {
      const current = r * pointsPerRing + p;
      const nextInRing = r * pointsPerRing + ((p + 1) % pointsPerRing);
      const nextRingSame = (r + 1) * pointsPerRing + p;

      lineIndices.push(current, nextInRing);
      lineIndices.push(current, nextRingSame);
    }
  }

  return {
    vertices: new Float32Array(ringVertices),
    indices: new Uint16Array(lineIndices),
    throatRadius: throatRadius.toFixed(2)
  };
}

export function traceGeodesicRays(impactParamY, entanglement, blackHoleActive, erBridgeActive) {
  const steps = 60;
  const stepSize = 0.22;
  const rays = [-1.2, 0.0, 1.2];

  return rays.map((zOffset) => {
    const points = [];
    let px = -7.0;
    let py = impactParamY;
    let pz = zOffset;

    let vx = 1.0;
    let vy = 0.0;
    let vz = 0.0;

    for (let s = 0; s < steps; s++) {
      points.push(px, py, pz);

      if (erBridgeActive) {
        const mouthX = px < 0 ? -3.5 : 3.5;
        const distToMouth = Math.sqrt(Math.pow(px - mouthX, 2) + py * py + pz * pz);
        const pull = (entanglement * 1.5) / Math.pow(Math.max(0.7, distToMouth), 2.5);

        vx += ((mouthX - px) / distToMouth) * pull * stepSize * 0.3;
        vy -= (py / distToMouth) * pull * stepSize;
        vz -= (pz / distToMouth) * pull * stepSize;
      } else {
        const r = Math.sqrt(px * px + py * py + pz * pz);
        const safeR = Math.max(0.6, r);

        let fieldStrength = (entanglement * 1.8) / Math.pow(safeR, 3);
        if (blackHoleActive) fieldStrength += 5.2 / Math.pow(safeR, 3);

        vx -= (px / safeR) * fieldStrength * stepSize;
        vy -= (py / safeR) * fieldStrength * stepSize;
        vz -= (pz / safeR) * fieldStrength * stepSize;
      }

      const vMag = Math.sqrt(vx * vx + vy * vy + vz * vz);
      vx /= vMag;
      vy /= vMag;
      vz /= vMag;

      px += vx * stepSize;
      py += vy * stepSize;
      pz += vz * stepSize;

      if (!erBridgeActive && blackHoleActive && Math.sqrt(px * px + py * py + pz * pz) < 1.35) {
        points.push(px, py, pz);
        break;
      }
    }

    return new Float32Array(points);
  });
}

/**
 * Gao-Jafferis-Wall traversable teleportation trajectory:
 * Smoothly travels from Left Mouth A (-4.8) -> Throat (0.0) -> Right Mouth B (+4.8)
 */
export function computeTeleportationPosition(progress, entanglement) {
  // Clamped progress between 0 (Mouth A) and 1 (Mouth B)
  const p = Math.min(1.0, Math.max(0.0, progress));
  const x = -4.8 + p * 9.6;

  // Throat compression
  const throatFactor = Math.exp(-Math.pow(x / 1.8, 2));
  const y = Math.sin(p * Math.PI) * 0.5 * (1 - throatFactor);
  const z = Math.cos(p * Math.PI * 4) * 0.25 * throatFactor;

  return { x, y, z };
}

export function computeMetricTelemetry(
  entanglement,
  stateMode,
  blackHoleActive,
  erBridgeActive,
  impactParamY,
  syndromeErrors = [],
  boundaryAngle = 1.8,
  teleportPacket = null
) {
  let g00Val = -(1 - Math.min(0.85, entanglement * 0.7));
  let grrVal = 1 / (1 - Math.min(0.85, entanglement * 0.65) + 0.001);
  let ricciBase = entanglement * 4.2;

  if (erBridgeActive) {
    g00Val = teleportPacket?.active ? -0.85 : -0.42;
    grrVal = 1.0;
    ricciBase = entanglement * 8.6;
  } else if (blackHoleActive) {
    g00Val = -0.05;
    grrVal = 14.82;
    ricciBase += 12.5;
  } else {
    if (stateMode === 'ghz') ricciBase *= 1.6;
    if (stateMode === 'bell') ricciBase *= 1.25;
    if (stateMode === 'thermal') ricciBase *= 0.2;
  }

  const safeB = Math.max(0.5, Math.abs(impactParamY));
  const massProxy = erBridgeActive ? entanglement * 2.2 : (blackHoleActive ? 2.5 : entanglement * 0.9);
  const deflectionAngleRad = ((4 * massProxy) / safeB).toFixed(2);
  const throatRadius = erBridgeActive ? (Math.sqrt(entanglement) * 1.35).toFixed(2) : '0.00';

  const totalQubits = 125;
  const numErrors = syndromeErrors.length;
  const physicalErrorRate = ((numErrors / totalQubits) * 100).toFixed(1);
  const logicalFidelity = Math.max(0.01, Math.exp(-numErrors * 0.12)).toFixed(3);

  const rt = calculateRyuTakayanagiSurface(boundaryAngle, entanglement);
  const hkllError = Math.max(0.002, Math.exp(-boundaryAngle * 1.8)).toFixed(4);

  return {
    g00: g00Val.toFixed(3),
    grr: grrVal.toFixed(3),
    ricciScalar: ricciBase.toFixed(2),
    vonNeumannEntropy: (erBridgeActive ? 0.92 : (blackHoleActive ? 0.99 : (stateMode === 'thermal' ? 0.95 : entanglement * 0.82))).toFixed(3),
    deflectionAngle: `${deflectionAngleRad} rad`,
    throatRadius: `${throatRadius} L_P`,
    physicalErrorRate: `${physicalErrorRate}%`,
    logicalFidelity,
    activeSyndromes: numErrors,
    rtArea: rt.minimalArea,
    holographicEntropy: rt.holographicEntropy,
    hkllError: `ε = ${hkllError}`
  };
}
