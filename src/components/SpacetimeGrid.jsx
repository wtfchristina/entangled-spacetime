import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { applyQuantumGravity } from '../logic/tensorCalculations';

export default function SpacetimeGrid({ entanglement }) {
  const pointsRef = useRef();
  const linesRef = useRef();
  const groupRef = useRef();

  // 1. Generate the initial 3D Tensor Network Grid
  const { basePositions, indices } = useMemo(() => {
    const pos = [];
    const ind = [];
    const gridSize = 5; // A 5x5x5 cube of nodes
    const spacing = 1.5; // Distance between nodes
    const offset = (gridSize * spacing) / 2 - (spacing / 2);

    // Create the nodes (qubits)
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        for (let z = 0; z < gridSize; z++) {
          pos.push(x * spacing - offset, y * spacing - offset, z * spacing - offset);
        }
      }
    }

    // Connect adjacent nodes with lines (entanglement bonds)
    const getIndex = (x, y, z) => x * gridSize * gridSize + y * gridSize + z;
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        for (let z = 0; z < gridSize; z++) {
          const current = getIndex(x, y, z);
          if (x < gridSize - 1) ind.push(current, getIndex(x + 1, y, z));
          if (y < gridSize - 1) ind.push(current, getIndex(x, y + 1, z));
          if (z < gridSize - 1) ind.push(current, getIndex(x, y, z + 1));
        }
      }
    }
    
    return { 
      basePositions: new Float32Array(pos), 
      indices: new Uint16Array(ind) 
    };
  }, []);

  const dynamicPositions = useMemo(() => new Float32Array(basePositions), [basePositions]);

  // 2. Animate and Warp the Grid in Real-Time using the Physics Engine
  useFrame((state, delta) => {
    groupRef.current.rotation.y += delta * 0.15;
    groupRef.current.rotation.x += delta * 0.05;

    const currentPosArray = pointsRef.current.geometry.attributes.position.array;
    const time = state.clock.elapsedTime;
    
    for (let i = 0; i < basePositions.length; i += 3) {
      const x = basePositions[i];
      const y = basePositions[i + 1];
      const z = basePositions[i + 2];
      
      const baseDistance = Math.sqrt(x*x + y*y + z*z);
      
      // Pass coordinates to our external physics logic
      const { warpedX, warpedY, warpedZ } = applyQuantumGravity(
        x, y, z, baseDistance, time, entanglement
      );

      currentPosArray[i] = warpedX;
      currentPosArray[i + 1] = warpedY;
      currentPosArray[i + 2] = warpedZ;
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    linesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute 
            attach="attributes-position" 
            count={dynamicPositions.length / 3} 
            array={dynamicPositions} 
            itemSize={3} 
          />
        </bufferGeometry>
        <pointsMaterial size={0.15} color="#4fa4ff" transparent opacity={0.9} sizeAttenuation={true} />
      </points>

      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute 
            attach="attributes-position" 
            count={dynamicPositions.length / 3} 
            array={dynamicPositions} 
            itemSize={3} 
          />
          <bufferAttribute 
            attach="index" 
            count={indices.length} 
            array={indices} 
            itemSize={1} 
          />
        </bufferGeometry>
        <lineBasicMaterial color="#88ccff" transparent opacity={0.1 + entanglement * 0.6} />
      </lineSegments>
    </group>
  );
}
