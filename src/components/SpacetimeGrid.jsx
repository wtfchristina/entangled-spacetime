import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  calculateNodeState,
  generateWormholeGeometry,
  calculateRyuTakayanagiSurface,
  traceGeodesicRays,
  computeTeleportationPosition,
  RS_SCHWARZSCHILD,
  R_PHOTON_SPHERE,
  R_ISCO
} from '../logic/tensorCalculations';

export default function SpacetimeGrid({
  entanglement,
  stateMode,
  perturbation,
  blackHoleActive,
  erBridgeActive,
  geodesicsActive,
  impactParamY,
  rayCount = 11,
  beamMode = 'curtain',
  syndromeErrors,
  rtActive,
  boundaryAngle,
  teleportPacket,
  clockRef,
  cameraMode,
  controlsRef,
  triggerPerturbation
}) {
  const pointsRef = useRef();
  const linesRef = useRef();
  const groupRef = useRef();
  const horizonRef = useRef();
  const photonSphereRef = useRef();
  const iscoRingRef = useRef();
  const accretionRingRef = useRef();
  const accretionParticlesRef = useRef();
  const wormholeRef = useRef();
  const rtSurfaceRef = useRef();
  const teleportMarkerRef = useRef();
  const arrivalHaloRef = useRef();
  const photonMarkersRef = useRef([]);

  // 1. Base Lattice Topology
  const { basePositions, indices, lineColorsTemplate, nodeColorsTemplate } = useMemo(() => {
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
    const nodeColors = new Float32Array(pos.length);
    for (let i = 0; i < lineColors.length; i += 3) {
      lineColors[i] = 0.2;
      lineColors[i + 1] = 0.6;
      lineColors[i + 2] = 1.0;

      nodeColors[i] = 0.58;
      nodeColors[i + 1] = 0.77;
      nodeColors[i + 2] = 0.99;
    }

    return {
      basePositions: new Float32Array(pos),
      indices: new Uint16Array(ind),
      lineColorsTemplate: lineColors,
      nodeColorsTemplate: nodeColors
    };
  }, []);

  const dynamicPositions = useMemo(() => new Float32Array(basePositions), [basePositions]);
  const dynamicLineColors = useMemo(() => new Float32Array(lineColorsTemplate), [lineColorsTemplate]);
  const dynamicNodeColors = useMemo(() => new Float32Array(nodeColorsTemplate), [nodeColorsTemplate]);

  // Procedural swirling accretion texture starting exactly at ISCO
  const accretionTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const cx = 256;
    const cy = 256;

    for (let i = 0; i < 72; i++) {
      const angle = (i / 72) * Math.PI * 2;
      const len = 110 + Math.random() * 135;
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(254, 215, 170, 0.75)' : 'rgba(234, 88, 12, 0.4)';
      ctx.lineWidth = 3 + Math.random() * 4;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * 95, cy + Math.sin(angle) * 95);
      ctx.lineTo(cx + Math.cos(angle) * len, cy + Math.sin(angle) * len);
      ctx.stroke();
    }

    const grad = ctx.createRadialGradient(cx, cy, 95, cx, cy, 250);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    grad.addColorStop(0.35, 'rgba(251, 146, 60, 0.85)');
    grad.addColorStop(0.75, 'rgba(194, 65, 12, 0.5)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, []);

  // Keplerian particles orbiting strictly at or outside ISCO
  const accretionParticles = useMemo(() => {
    const count = 420;
    const initialData = [];
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Radius strictly bounded by ISCO (3.6) up to 5.2
      const radius = R_ISCO + Math.random() * 1.6;
      const angle = Math.random() * Math.PI * 2;
      const speed = (3.4 / Math.pow(radius, 1.25)) * (0.95 + Math.random() * 0.1);
      const zOffset = (Math.random() - 0.5) * 0.10;

      initialData.push({ radius, angle, speed, zOffset });
    }

    return { initialData, positions, colors, count };
  }, []);

  const geodesicPaths = useMemo(() => {
    if (!geodesicsActive) return [];
    return traceGeodesicRays(impactParamY, entanglement, blackHoleActive, erBridgeActive, rayCount, beamMode);
  }, [geodesicsActive, impactParamY, entanglement, blackHoleActive, erBridgeActive, rayCount, beamMode]);

  const rtSurface = useMemo(() => {
    if (!rtActive) return null;
    return calculateRyuTakayanagiSurface(boundaryAngle, entanglement);
  }, [rtActive, boundaryAngle, entanglement]);

  const coolColor = useMemo(() => new THREE.Color('#38bdf8'), []);
  const hotColor = useMemo(() => new THREE.Color('#f43f5e'), []);
  const horizonColor = useMemo(() => new THREE.Color('#a855f7'), []);
  const wormholeColor = useMemo(() => new THREE.Color('#06b6d4'), []);
  const shockwaveColor = useMemo(() => new THREE.Color('#10b981'), []);
  const errorColor = useMemo(() => new THREE.Color('#f59e0b'), []);
  const tornColor = useMemo(() => new THREE.Color('#334155'), []); // Muted grey-blue for torn metric
  const normalNodeColor = useMemo(() => new THREE.Color('#93c5fd'), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  const targetCamPos = useMemo(() => new THREE.Vector3(), []);
  const targetLookAt = useMemo(() => new THREE.Vector3(), []);

  // 2. Render & Simulation Loop
  useFrame((state, delta) => {
    if (clockRef) {
      clockRef.current = state.clock.elapsedTime;
    }

    const time = state.clock.elapsedTime;

    // Camera Director
    if (controlsRef && controlsRef.current) {
      switch (cameraMode) {
        case 'horizon':
          targetCamPos.set(0, 1.2, 4.2);
          targetLookAt.set(0, 0, 0);
          break;
        case 'throat':
          targetCamPos.set(0, 0.4, 2.4);
          targetLookAt.set(3.5, 0, 0);
          break;
        case 'cft':
          targetCamPos.set(0, 15, 0.1);
          targetLookAt.set(0, 0, 0);
          break;
        case 'orbit': {
          const orbitR = 12.0;
          const orbitSpeed = 0.25;
          targetCamPos.set(
            Math.sin(time * orbitSpeed) * orbitR,
            4.0 + Math.sin(time * 0.15) * 2.0,
            Math.cos(time * orbitSpeed) * orbitR
          );
          targetLookAt.set(0, 0, 0);
          break;
        }
        case 'lab':
        default:
          targetCamPos.set(0, 4, 13);
          targetLookAt.set(0, 0, 0);
          break;
      }

      state.camera.position.lerp(targetCamPos, delta * 2.8);
      controlsRef.current.target.lerp(targetLookAt, delta * 3.5);
      controlsRef.current.update();
    }

    groupRef.current.rotation.y += delta * 0.10;
    groupRef.current.rotation.x += delta * 0.03;

    // Relativistic Horizon & Photon Sphere Pulses
    if (horizonRef.current && blackHoleActive) {
      const pulse = 1 + Math.sin(time * 4) * 0.02;
      horizonRef.current.scale.set(pulse, pulse, pulse);
    }
    if (photonSphereRef.current && blackHoleActive) {
      const phPulse = 1 + Math.cos(time * 6) * 0.03;
      photonSphereRef.current.scale.set(phPulse, phPulse, phPulse);
    }

    // Accretion Disk Spin & Keplerian Differential Plunge Flow
    if (blackHoleActive && !erBridgeActive) {
      if (accretionRingRef.current) {
        accretionRingRef.current.rotation.z += delta * 1.6;
      }

      if (accretionParticlesRef.current) {
        const posArr = accretionParticlesRef.current.geometry.attributes.position.array;
        const colArr = accretionParticlesRef.current.geometry.attributes.color.array;
        const { initialData } = accretionParticles;

        for (let i = 0; i < initialData.length; i++) {
          const p = initialData[i];
          p.angle += delta * p.speed;

          const lx = Math.cos(p.angle) * p.radius;
          const ly = Math.sin(p.angle) * p.radius;
          const lz = p.zOffset;

          posArr[i * 3] = lx;
          posArr[i * 3 + 1] = ly;
          posArr[i * 3 + 2] = lz;

          const doppler = Math.sin(p.angle);
          if (doppler > 0) {
            colArr[i * 3] = 1.0;
            colArr[i * 3 + 1] = 0.85 + doppler * 0.15;
            colArr[i * 3 + 2] = 0.4 + doppler * 0.5;
          } else {
            colArr[i * 3] = 0.9 + doppler * 0.35;
            colArr[i * 3 + 1] = 0.35 + doppler * 0.25;
            colArr[i * 3 + 2] = 0.05;
          }
        }

        accretionParticlesRef.current.geometry.attributes.position.needsUpdate = true;
        accretionParticlesRef.current.geometry.attributes.color.needsUpdate = true;
      }
    }

    // Wormhole Geometry
    if (wormholeRef.current && erBridgeActive) {
      const wh = generateWormholeGeometry(entanglement, time);
      wormholeRef.current.geometry.attributes.position.array.set(wh.vertices);
      wormholeRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Teleportation Traversal
    if (teleportMarkerRef.current && teleportPacket && teleportPacket.active) {
      const duration = 2.4;
      const elapsed = time - teleportPacket.startTime;
      const progress = Math.min(1.0, elapsed / duration);

      const pos = computeTeleportationPosition(progress, entanglement);
      teleportMarkerRef.current.position.set(pos.x, pos.y, pos.z);

      const isArrived = progress >= 0.99;
      const pulseScale = isArrived ? 1.35 + Math.sin(time * 16) * 0.25 : 1.0 + Math.sin(time * 24) * 0.2;
      teleportMarkerRef.current.scale.set(pulseScale, pulseScale, pulseScale);

      if (arrivalHaloRef.current) {
        if (isArrived) {
          arrivalHaloRef.current.visible = true;
          const haloScale = 1.0 + ((elapsed - duration) * 1.5) % 2.5;
          arrivalHaloRef.current.scale.set(haloScale, haloScale, haloScale);
          arrivalHaloRef.current.position.set(4.8, 0, 0);
        } else {
          arrivalHaloRef.current.visible = false;
        }
      }
    }

    // Geodesic Photons
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

    // Coordinates, Strain & Van Raamsdonk Dissociation
    const currentPosArray = pointsRef.current.geometry.attributes.position.array;
    const lineColorsArray = linesRef.current.geometry.attributes.color.array;
    const nodeColorsArray = pointsRef.current.geometry.attributes.color.array;

    for (let i = 0; i < basePositions.length; i += 3) {
      const nodeIndex = i / 3;
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
        erBridgeActive,
        nodeIndex,
        syndromeErrors,
        teleportPacket
      );

      currentPosArray[i] = node.x;
      currentPosArray[i + 1] = node.y;
      currentPosArray[i + 2] = node.z;

      if (node.isDissociated) {
        tempColor.copy(tornColor);
        nodeColorsArray[i] = tempColor.r;
        nodeColorsArray[i + 1] = tempColor.g;
        nodeColorsArray[i + 2] = tempColor.b;
      } else if (node.hasError) {
        const flash = 0.5 + Math.sin(time * 12 + nodeIndex) * 0.5;
        tempColor.copy(errorColor).lerp(hotColor, flash);
        nodeColorsArray[i] = tempColor.r;
        nodeColorsArray[i + 1] = tempColor.g;
        nodeColorsArray[i + 2] = tempColor.b;
      } else {
        nodeColorsArray[i] = normalNodeColor.r;
        nodeColorsArray[i + 1] = normalNodeColor.g;
        nodeColorsArray[i + 2] = normalNodeColor.b;
      }

      const strainFactor = Math.min(1.0, node.strain * 2.2 + entanglement * 0.35);

      if (node.isDissociated) {
        tempColor.copy(tornColor);
      } else if (erBridgeActive) {
        if (teleportPacket && teleportPacket.active) {
          tempColor.copy(wormholeColor).lerp(shockwaveColor, 0.7);
        } else {
          tempColor.copy(coolColor).lerp(wormholeColor, 0.7);
        }
      } else if (blackHoleActive && baseDist < R_ISCO) {
        tempColor.copy(hotColor).lerp(horizonColor, 0.6);
      } else {
        tempColor.copy(coolColor).lerp(hotColor, strainFactor);
      }

      lineColorsArray[i] = tempColor.r;
      lineColorsArray[i + 1] = tempColor.g;
      lineColorsArray[i + 2] = tempColor.b;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.geometry.attributes.color.needsUpdate = true;
    linesRef.current.geometry.attributes.position.needsUpdate = true;
    linesRef.current.geometry.attributes.color.needsUpdate = true;
  });

  const initialWormhole = useMemo(() => generateWormholeGeometry(0.5, 0), []);

  return (
    <group
      ref={groupRef}
      onClick={(e) => {
        e.stopPropagation();
        triggerPerturbation();
      }}
    >
      {/* 2D CFT Boundary Sphere */}
      <mesh>
        <sphereGeometry args={[4.5, 32, 32]} />
        <meshBasicMaterial
          color="#1e293b"
          wireframe={true}
          transparent={true}
          opacity={0.12}
        />
      </mesh>

      {/* Ryu-Takayanagi Minimal Surface (gamma_A) */}
      {rtActive && rtSurface && (
        <line ref={rtSurfaceRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={rtSurface.vertices.length / 3}
              array={rtSurface.vertices}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#10b981" linewidth={3} />
        </line>
      )}

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
            color={teleportPacket?.active ? '#10b981' : '#06b6d4'}
            transparent
            opacity={0.35 + entanglement * 0.55}
          />
        </lineSegments>
      )}

      {/* Gao-Jafferis-Wall Teleporting Qubit Packet */}
      {erBridgeActive && teleportPacket && teleportPacket.active && (
        <group>
          <mesh ref={teleportMarkerRef}>
            <sphereGeometry args={[0.26, 32, 32]} />
            <meshBasicMaterial color="#34d399" />
          </mesh>
          <mesh ref={arrivalHaloRef} visible={false}>
            <ringGeometry args={[0.3, 0.45, 32]} />
            <meshBasicMaterial color="#6ee7b7" side={THREE.DoubleSide} transparent opacity={0.8} />
          </mesh>
        </group>
      )}

      {/* General Relativistic Black Hole Horizons & Boundaries */}
      {blackHoleActive && !erBridgeActive && (
        <group>
          {/* 1. Schwarzschild Event Horizon (r_s = 1.2) */}
          <mesh ref={horizonRef}>
            <sphereGeometry args={[RS_SCHWARZSCHILD, 32, 32]} />
            <meshStandardMaterial
              color="#020008"
              emissive="#7e22ce"
              emissiveIntensity={0.8}
              roughness={0.05}
              wireframe={true}
              transparent={true}
              opacity={0.9}
            />
          </mesh>

          {/* 2. Photon Sphere (r_ph = 1.5 r_s = 1.8) */}
          <mesh ref={photonSphereRef}>
            <sphereGeometry args={[R_PHOTON_SPHERE, 24, 24]} />
            <meshBasicMaterial
              color="#facc15"
              wireframe={true}
              transparent={true}
              opacity={0.35}
            />
          </mesh>

          {/* Tilted Accretion Disk Plane */}
          <group rotation={[Math.PI / 3.4, 0.25, 0]}>
            {/* 3. ISCO Ring Boundary Marker (r_isco = 3.0 r_s = 3.6) */}
            <mesh ref={iscoRingRef}>
              <ringGeometry args={[R_ISCO - 0.04, R_ISCO + 0.04, 64]} />
              <meshBasicMaterial
                color="#06b6d4"
                side={THREE.DoubleSide}
                transparent={true}
                opacity={0.65}
              />
            </mesh>

            {/* Stable Accretion Disk Plasma (r >= R_ISCO) */}
            <mesh ref={accretionRingRef}>
              <ringGeometry args={[R_ISCO, 4.8, 64]} />
              <meshBasicMaterial
                map={accretionTexture}
                side={THREE.DoubleSide}
                transparent={true}
                opacity={0.9}
              />
            </mesh>

            {/* Differential Keplerian Particle Swarm */}
            <points ref={accretionParticlesRef}>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={accretionParticles.count}
                  array={accretionParticles.positions}
                  itemSize={3}
                />
                <bufferAttribute
                  attach="attributes-color"
                  count={accretionParticles.count}
                  array={accretionParticles.colors}
                  itemSize={3}
                />
              </bufferGeometry>
              <pointsMaterial
                size={0.12}
                vertexColors={true}
                transparent={true}
                opacity={0.95}
                sizeAttenuation={true}
              />
            </points>
          </group>
        </group>
      )}

      {/* Multi-Ray Geodesic Bundle */}
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
              <lineBasicMaterial color="#eab308" transparent opacity={0.45} />
            </line>
            <mesh ref={(el) => (photonMarkersRef.current[idx] = el)}>
              <sphereGeometry args={[0.07, 12, 12]} />
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
          <bufferAttribute
            attach="attributes-color"
            count={dynamicNodeColors.length / 3}
            array={dynamicNodeColors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.17}
          vertexColors={true}
          transparent
          opacity={entanglement < 0.20 ? Math.max(0.2, entanglement * 2.5) : 0.95}
          sizeAttenuation={true}
        />
      </points>

      {/* Dynamic Entanglement Bonds (Fades out during Van Raamsdonk Disconnection) */}
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
            count={dynamicLineColors.length / 3}
            array={dynamicLineColors}
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
          opacity={entanglement < 0.20 ? 0.0 : 0.3 + entanglement * 0.65}
        />
      </lineSegments>
    </group>
  );
}
