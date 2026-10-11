/**
 * tensorCalculations.js
 * Calculates spacetime geometry modifications based on quantum entanglement.
 */

export function applyQuantumGravity(x, y, z, baseDistance, time, entanglement) {
  // Prevent division by zero and cap the baseline
  const safeEntanglement = Math.max(0.01, entanglement);
  const normalizedDist = baseDistance / 5; // 5 is roughly the max radius of our grid

  // 1. Ryu-Takayanagi Warp: Higher entanglement exponentially decreases spatial distance
  // We simulate this by pulling outer nodes inward non-linearly.
  const geometricWarp = 1 - (Math.pow(safeEntanglement, 1.5) * 0.45 * normalizedDist);

  // 2. Quantum Fluctuations (Superposition Jitter)
  // Time-dependent oscillations that increase in amplitude with higher entropy
  const frequency = 3;
  const phaseShift = baseDistance * 2;
  
  const waveX = Math.sin(time * frequency + phaseShift) * 0.15 * safeEntanglement;
  const waveY = Math.cos(time * frequency * 0.8 - phaseShift) * 0.15 * safeEntanglement;
  const waveZ = Math.sin(time * frequency * 1.2 + phaseShift) * 0.15 * safeEntanglement;

  return {
    warpedX: (x * geometricWarp) + waveX,
    warpedY: (y * geometricWarp) + waveY,
    warpedZ: (z * geometricWarp) + waveZ,
    // Return a metric scalar to dynamically change node brightness
    energyDensity: safeEntanglement * (1 / (normalizedDist + 0.1))
  };
}
