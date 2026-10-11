import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  calculateNodeState,
  generateWormholeGeometry,
  traceGeodesicRays
} from '../logic/tensorCalculations';

export default function SpacetimeGrid({
  entanglement,
  stateMode,
  perturbation,
  blackHoleActive,
  erBridgeActive,
  geodesicsActive,
  impactParamY,
  triggerPerturbation
}) {
  const pointsRef = useRef();
  const linesRef = useRef();
  const groupRef = useRef();
  const horizonRef = useRef();
  const wormholeRef = useRef();
  const photonMarkersRef = useRef([]);

  // 1. Build Base Lattice Topology
  const { basePositions, indices, lineColorsTemplate } = useMemo(() => {
    const pos = [];
    const ind = [];
    const gridSize = 5;
    const spacing = 1.4;
    const offset = (gridSize * spacing) / 2 - spacing / 2;

    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        for (let z = 0; z < gridSize; z++) {
          pos.push(x * spacing - offset, y * spacing - offset, z * spacing - offset);
        }
      }
    }

    const getIndex = (x, y, z) => x * gridSize * gridSize + y * gridSize + z;
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        for (let z = 0; z < gridSize; z++) {
          const curr = getIndex(x, y, z);
          if (x < gridSize - 1) ind.push(curr, getIndex(x + 1, y, z));
          if (y < gridSize - 1) ind.push(curr, getIndex(x, y + 1, z));
          if (z < gridSize - 1) ind.push(curr, getIndex(x, y, z + 1));
        }
      }
    }

    const lineColors = new Float32Array(pos.length);
    for (let i = 0; i < lineColors.length; i += 3) {
      lineColors[i] = 0.2;
      lineColors[i + 1] = 0.6;
      lineColors[i + 2] = 1.0;
    }

    return {
      basePositions: new Float32Array(pos),
      indices: new Uint16Array(ind),
      lineColorsTemplate: lineColors
    };
  }, []);

  const dynamicPositions = useMemo(() => new Float32Array(basePositions), [basePositions]);
  const dynamicColors = useMemo(() => new Float32Array(lineColorsTemplate), [lineColorsTemplate]);

  // Compute curved null geodesic paths
  const geodesicPaths = useMemo(() => {
    if (!geodesicsActive) return [];
    return traceGeodesicRays(impactParamY, entanglement, blackHoleActive, erBridgeActive);
  }, [geodesicsActive, impactParamY, entanglement, blackHoleActive, erBridgeActive]);

  const coolColor = useMemo(() => new THREE.Color('#38bdf8'), []);
  const hotColor = useMemo(() => new THREE.Color('#f43f5e'), []);
  const horizonColor = useMemo(() => new THREE.Color('#a855f7'), []);
  const wormholeColor = useMemo(() => new THREE.Color('#06b6d4'), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  // 2. 60 FPS Render Loop
  useFrame((state, delta) => {
    groupRef.current.rotation.y += delta * 0.10;
    groupRef.current.rotation.x += delta * 0.03;

    const time = state.clock.elapsedTime;

    // Pulse event horizon if active
    if (horizonRef.current && blackHoleActive) {
      const pulse = 1 + Math.sin(time * 4) * 0.04;
      horizonRef.current.scale.set(pulse, pulse, pulse);
    }

    // Dynamic Wormhole Geometry Update
    if (wormholeRef.current && erBridgeActive) {
      const wh = generateWormholeGeometry(entanglement, time);
      wormholeRef.current.geometry.attributes.position.array.set(wh.vertices);
      wormholeRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Animate photon particles along geodesics
    if (geodesicsActive && geodesicPaths.length > 0) {
      const speed = 0.8;
      const progress = (time * speed) % 1;

      geodesicPaths.forEach((pathPoints, idx) => {
        const marker = photonMarkersRef.current[idx];
        if (marker) {
          const totalPoints = pathPoints.length / 3;
          const targetIndex = Math.floor(progress * (totalPoints - 1));
          const px = pathPoints[targetIndex * 3];
          const py = pathPoints[targetIndex * 3 + 1];
          const pz = pathPoints[targetIndex * 3 + 2];
          marker.position.set(px, py, pz);
        }
      });
    }

    // Update Lattice Vertices & Color Stress
    const currentPosArray = pointsRef.current.geometry.attributes.position.array;
    const lineColorsArray = linesRef.current.geometry.attributes.color.array;

    for (let i = 0; i < basePositions.length; i += 3) {
      const bx = basePositions[i];
      const by = basePositions[i + 1];
      const bz = basePositions[i + 2];
      const baseDist = Math.sqrt(bx * bx + by * by + bz * bz);

      const node = calculateNodeState(
        bx,
        by,
        bz,
        baseDist,
        time,
        entanglement,
        stateMode,
        perturbation,
        blackHoleActive,
        erBridgeActive
      );

      currentPosArray[i] = node.x;
      currentPosArray[i + 1] = node.y;
      currentPosArray[i + 2] = node.z;

      const strainFactor = Math.min(1.0, node.strain * 2.2 + entanglement * 0.35);

      if (erBridgeActive) {
        tempColor.copy(coolColor).lerp(wormholeColor, 0.7);
      } else if (blackHoleActive && baseDist < 2.0) {
        tempColor.copy(hotColor).lerp(horizonColor, 0.6);
      } else {
        tempColor.copy(coolColor).lerp(hotColor, strainFactor);
      }

      lineColorsArray[i] = tempColor.r;
      lineColorsArray[i + 1] = tempColor.g;
      lineColorsArray[i + 2] = tempColor.b;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    linesRef.current.geometry.attributes.position.needsUpdate = true;
    linesRef.current.geometry.attributes.color.needsUpdate = true;
  });

  // Base wormhole template for initial geometry buffer
  const initialWormhole = useMemo(() => generateWormholeGeometry(0.5, 0), []);

  return (
    <group
      ref={groupRef}
      onClick={(e) => {
        e.stopPropagation();
        triggerPerturbation();
      }}
    >
      {/* ER = EPR Einstein-Rosen Wormhole Throat Mesh */}
      {erBridgeActive && (
        <lineSegments ref={wormholeRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={initialWormhole.vertices.length / 3}
              array={initialWormhole.vertices}
              itemSize={3}
            />
            <bufferAttribute
              attach="index"
              count={initialWormhole.indices.length}
              array={initialWormhole.indices}
              itemSize={1}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color="#06b6d4"
            transparent
            opacity={0.35 + entanglement * 0.55}
          />
        </lineSegments>
      )}

      {/* Black Hole Event Horizon */}
      {blackHoleActive && !erBridgeActive && (
        <mesh ref={horizonRef}>
          <sphereGeometry args={[1.5, 32, 32]} />
          <meshStandardMaterial
            color="#050014"
            emissive="#a855f7"
            emissiveIntensity={0.6}
            roughness={0.1}
            wireframe={true}
            transparent={true}
            opacity={0.75}
          />
        </mesh>
      )}

      {/* Null Geodesic Paths & Traveling Photons */}
      {geodesicsActive &&
        geodesicPaths.map((pathPoints, idx) => (
          <group key={idx}>
            <line>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={pathPoints.length / 3}
                  array={pathPoints}
                  itemSize={3}
                />
              </bufferGeometry>
              <lineBasicMaterial color="#eab308" transparent opacity={0.4} />
            </line>
            <mesh ref={(el) => (photonMarkersRef.current[idx] = el)}>
              <sphereGeometry args={[0.09, 16, 16]} />
              <meshBasicMaterial color="#fef08a" />
            </mesh>
          </group>
        ))}

      {/* Qubit Nodes */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={dynamicPositions.length / 3}
            array={dynamicPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.16}
          color="#93c5fd"
          transparent
          opacity={0.95}
          sizeAttenuation={true}
        />
      </points>

      {/* Dynamic Entanglement Bonds */}
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={dynamicPositions.length / 3}
            array={dynamicPositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={dynamicColors.length / 3}
            array={dynamicColors}
            itemSize={3}
          />
          <bufferAttribute
            attach="index"
            count={indices.length}
            array={indices}
            itemSize={1}
          />
        </bufferGeometry>
        <lineBasicMaterial
          vertexColors={true}
          transparent
          opacity={0.3 + entanglement * 0.65}
        />
      </lineSegments>
    </group>
  );
}
