import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import SpacetimeGrid from './components/SpacetimeGrid';
import { computeMetricTelemetry } from './logic/tensorCalculations';

export default function App() {
  const [entanglement, setEntanglement] = useState(0.5);
  const [stateMode, setStateMode] = useState('standard');
  const [perturbation, setPerturbation] = useState({ active: false, startTime: 0 });
  const [blackHoleActive, setBlackHoleActive] = useState(false);
  const [erBridgeActive, setErBridgeActive] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [geodesicsActive, setGeodesicsActive] = useState(false);
  const [impactParamY, setImpactParamY] = useState(1.6);
  const [syndromeErrors, setSyndromeErrors] = useState([]);
  const [cinematicBloom, setCinematicBloom] = useState(true);
  
  // Ryu-Takayanagi Holographic Surface States
  const [rtActive, setRtActive] = useState(true);
  const [boundaryAngle, setBoundaryAngle] = useState(2.1);

  const clockRef = useRef(0);
  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);
  const osc2Ref = useRef(null);
  const gainRef = useRef(null);

  const telemetry = computeMetricTelemetry(
    entanglement,
    stateMode,
    blackHoleActive,
    erBridgeActive,
    impactParamY,
    syndromeErrors,
    boundaryAngle
  );

  useEffect(() => {
    if (!audioEnabled) {
      if (audioCtxRef.current) audioCtxRef.current.suspend();
      return;
    }

    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc2.type = 'triangle';
      osc.frequency.setValueAtTime(65, ctx.currentTime);
      osc2.frequency.setValueAtTime(130, ctx.currentTime);
      gain.gain.setValueAtTime(0.07, ctx.currentTime);

      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc2.start();

      audioCtxRef.current = ctx;
      oscRef.current = osc;
      osc2Ref.current = osc2;
      gainRef.current = gain;
    } else {
      audioCtxRef.current.resume();
    }
  }, [audioEnabled]);

  useEffect(() => {
    if (audioCtxRef.current && oscRef.current && osc2Ref.current && audioEnabled) {
      const ctx = audioCtxRef.current;
      let basePitch = 55 + entanglement * 95;
      if (erBridgeActive) basePitch = 110 + entanglement * 75;
      if (blackHoleActive && !erBridgeActive) basePitch = 42;

      const detuneFactor = syndromeErrors.length * 8;

      oscRef.current.frequency.exponentialRampToValueAtTime(
        Math.max(30, basePitch + detuneFactor),
        ctx.currentTime + 0.1
      );
      osc2Ref.current.frequency.exponentialRampToValueAtTime(
        Math.max(60, (basePitch + detuneFactor) * 1.5),
        ctx.currentTime + 0.1
      );
    }
  }, [entanglement, blackHoleActive, erBridgeActive, syndromeErrors, audioEnabled]);

  const triggerPerturbation = () => {
    setPerturbation({ active: true, startTime: clockRef.current });

    if (audioCtxRef.current && oscRef.current && audioEnabled) {
      const ctx = audioCtxRef.current;
      const currentFreq = oscRef.current.frequency.value;
      oscRef.current.frequency.setValueAtTime(currentFreq * 2.2, ctx.currentTime);
      oscRef.current.frequency.exponentialRampToValueAtTime(currentFreq, ctx.currentTime + 0.6);
    }
  };

  const injectPauliNoise = () => {
    const totalQubits = 125;
    const newErrors = new Set(syndromeErrors);
    let attempts = 0;
    while (newErrors.size < syndromeErrors.length + 5 && attempts < 50) {
      const randomQubit = Math.floor(Math.random() * totalQubits);
      newErrors.add(randomQubit);
      attempts++;
    }
    setSyndromeErrors(Array.from(newErrors));
  };

  const runSyndromeDecoder = () => {
    setSyndromeErrors([]);
  };

  const captureSnapshot = () => {
    const canvasElement = document.querySelector('canvas');
    if (!canvasElement) return;

    const dataUrl = canvasElement.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `entangled-spacetime-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  const exportTelemetryData = () => {
    const payload = {
      project: 'Entangled Spacetime Visualizer',
      timestamp: new Date().toISOString(),
      parameters: {
        entanglementEntropy: entanglement,
        topologyMode: stateMode,
        boundaryAngleSubregion: boundaryAngle,
        blackHoleActive,
        erBridgeActive,
        geodesicsActive,
        impactParameter: impactParamY
      },
      holographicDuality: {
        ryuTakayanagiMinimalArea: telemetry.rtArea,
        holographicEntanglementEntropy: telemetry.holographicEntropy,
        formula: 'S_A = Area(gamma_A) / 4G'
      },
      relativityTelemetry: {
        ricciCurvatureScalar: telemetry.ricciScalar,
        g_00_temporal: telemetry.g00,
        g_rr_radial: telemetry.grr,
        einsteinDeflectionAngle: telemetry.deflectionAngle,
        wormholeThroatRadius: telemetry.throatRadius
      },
      quantumErrorCorrection: {
        code: '[[125, 1, 5]]',
        activeSyndromes: telemetry.activeSyndromes,
        logicalFidelity: telemetry.logicalFidelity,
        physicalErrorRate: telemetry.physicalErrorRate
      }
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const link = document.createElement('a');
    link.download = `spacetime-telemetry-${Date.now()}.json`;
    link.href = dataStr;
    link.click();
  };

  const chromaticOffset = new THREE.Vector2(
    blackHoleActive ? 0.0035 : 0.0012 + entanglement * 0.001,
    blackHoleActive ? 0.0035 : 0.0012 + entanglement * 0.001
  );

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        backgroundColor: '#030712',
        color: '#f3f4f6',
        margin: 0,
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: 'hidden'
      }}
    >
      {/* Sidebar Controls & Telemetry */}
      <div
        style={{
          width: '450px',
          padding: '24px',
          backgroundColor: '#0b0f19',
          borderRight: '1px solid #1f2937',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '13px',
          overflowY: 'auto',
          zIndex: 10
        }}
      >
        <div>
          <h1 style={{ fontSize: '20px', margin: '0 0 4px 0', letterSpacing: '-0.3px' }}>
            AdS/CFT Tensor Network
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af', lineHeight: 1.4 }}>
            Ryu-Takayanagi Surface & Holographic Duality Visualizer
          </p>
        </div>

        {/* Feature Toggles: ER = EPR, Black Hole */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button
            onClick={() => {
              setErBridgeActive(!erBridgeActive);
              if (!erBridgeActive) setBlackHoleActive(false);
            }}
            style={{
              padding: '9px',
              backgroundColor: erBridgeActive ? '#0891b2' : '#0e3a47',
              color: '#f8fafc',
              border: erBridgeActive ? '1px solid #22d3ee' : '1px solid #155e75',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '600'
            }}
          >
            {erBridgeActive ? 'ER = EPR: Active' : 'Form ER Bridge'}
          </button>

          <button
            onClick={() => {
              setBlackHoleActive(!blackHoleActive);
              if (!blackHoleActive) setErBridgeActive(false);
            }}
            style={{
              padding: '9px',
              backgroundColor: blackHoleActive ? '#7e22ce' : '#1e1b4b',
              color: '#f8fafc',
              border: blackHoleActive ? '1px solid #c084fc' : '1px solid #4338ca',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '600'
            }}
          >
            {blackHoleActive ? 'Collapse: Active' : 'Form Event Horizon'}
          </button>
        </div>

        {/* Ryu-Takayanagi Holographic Surface Controls */}
        <div style={{ backgroundColor: '#111827', padding: '12px', borderRadius: '8px', border: '1px solid #374151' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#10b981' }}>
              RYU-TAKAYANAGI SURFACE (γ_A)
            </span>
            <button
              onClick={() => setRtActive(!rtActive)}
              style={{
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: 'bold',
                backgroundColor: rtActive ? '#059669' : '#1f2937',
                color: '#fff',
                border: '1px solid #10b981',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {rtActive ? 'γ_A ON' : 'γ_A OFF'}
            </button>
          </div>
          {rtActive && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>
                <span>CFT Boundary Subregion (Δθ_A)</span>
                <span style={{ fontFamily: 'monospace', color: '#10b981' }}>{boundaryAngle.toFixed(2)} rad</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.1"
                step="0.05"
                value={boundaryAngle}
                onChange={(e) => setBoundaryAngle(parseFloat(e.target.value))}
                style={{ width: '100%', cursor: 'pointer', accentColor: '#10b981' }}
              />
            </div>
          )}
        </div>

        {/* Entanglement Entropy Slider */}
        <div style={{ backgroundColor: '#111827', padding: '12px', borderRadius: '8px', border: '1px solid #374151' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: erBridgeActive ? '#22d3ee' : '#9ca3af' }}>
              {erBridgeActive ? 'EPR ENTANGLEMENT FLUX (S)' : 'ENTANGLEMENT ENTROPY (S)'}
            </span>
            <span style={{ fontSize: '13px', color: erBridgeActive ? '#22d3ee' : '#38bdf8', fontFamily: 'monospace' }}>
              {entanglement.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min="0.05"
            max="1"
            step="0.01"
            value={entanglement}
            onChange={(e) => setEntanglement(parseFloat(e.target.value))}
            style={{ width: '100%', cursor: 'pointer', accentColor: erBridgeActive ? '#22d3ee' : '#38bdf8' }}
          />
        </div>

        {/* Quantum Error Correction Console */}
        <div style={{ backgroundColor: '#111827', padding: '12px', borderRadius: '8px', border: '1px solid #374151' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#f59e0b' }}>
              TOPOLOGICAL QUANTUM ERROR CORRECTION
            </span>
            <span style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'monospace' }}>
              Code: [[125, 1, 5]]
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              onClick={injectPauliNoise}
              style={{
                padding: '7px',
                backgroundColor: '#78350f',
                color: '#fef3c7',
                border: '1px solid #f59e0b',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: '600'
              }}
            >
              Inject Pauli Noise (+5)
            </button>
            <button
              onClick={runSyndromeDecoder}
              disabled={syndromeErrors.length === 0}
              style={{
                padding: '7px',
                backgroundColor: syndromeErrors.length > 0 ? '#065f46' : '#1f2937',
                color: syndromeErrors.length > 0 ? '#d1fae5' : '#6b7280',
                border: syndromeErrors.length > 0 ? '1px solid #10b981' : '1px solid #374151',
                borderRadius: '6px',
                cursor: syndromeErrors.length > 0 ? 'pointer' : 'not-allowed',
                fontSize: '11px',
                fontWeight: '600'
              }}
            >
              Run Syndrome Decoder
            </button>
          </div>
        </div>

        {/* Geodesics & Optical Shaders */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button
            onClick={() => setGeodesicsActive(!geodesicsActive)}
            style={{
              padding: '9px',
              backgroundColor: geodesicsActive ? '#ca8a04' : '#1f2937',
              color: '#fff',
              border: geodesicsActive ? '1px solid #facc15' : '1px solid #374151',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '600'
            }}
          >
            {geodesicsActive ? 'Light Rays: ON' : 'Light Rays: OFF'}
          </button>

          <button
            onClick={() => setCinematicBloom(!cinematicBloom)}
            style={{
              padding: '9px',
              backgroundColor: cinematicBloom ? '#db2777' : '#1f2937',
              color: '#fff',
              border: cinematicBloom ? '1px solid #f472b6' : '1px solid #374151',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '600'
            }}
          >
            {cinematicBloom ? 'Shaders: ON' : 'Shaders: OFF'}
          </button>
        </div>

        {/* Audio Sonification and Pulse */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            style={{
              padding: '9px',
              backgroundColor: audioEnabled ? '#065f46' : '#111827',
              color: '#f8fafc',
              border: audioEnabled ? '1px solid #34d399' : '1px solid #374151',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '600'
            }}
          >
            {audioEnabled ? 'Audio: Active' : 'Sonify Metric'}
          </button>

          <button
            onClick={triggerPerturbation}
            style={{
              padding: '9px',
              backgroundColor: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #475569',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '600'
            }}
          >
            Graviton Pulse
          </button>
        </div>

        {/* Export & Snapshot */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button
            onClick={captureSnapshot}
            style={{
              padding: '8px',
              backgroundColor: '#1e1b4b',
              color: '#c7d2fe',
              border: '1px solid #4f46e5',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '600'
            }}
          >
            📸 Capture (PNG)
          </button>

          <button
            onClick={exportTelemetryData}
            style={{
              padding: '8px',
              backgroundColor: '#1e1b4b',
              color: '#c7d2fe',
              border: '1px solid #4f46e5',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '600'
            }}
          >
            📊 Export (JSON)
          </button>
        </div>

        {/* Holographic Telemetry Readouts */}
        <div>
          <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#9ca3af', letterSpacing: '0.5px' }}>
            HOLOGRAPHIC & RYU-TAKAYANAGI TELEMETRY
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '6px' }}>
            <div style={{ backgroundColor: '#111827', padding: '9px', borderRadius: '6px', border: '1px solid #1f2937' }}>
              <div style={{ fontSize: '10px', color: '#9ca3af' }}>MINIMAL AREA Area(γ_A)</div>
              <div style={{ fontSize: '15px', color: '#10b981', fontFamily: 'monospace', marginTop: '2px' }}>
                {telemetry.rtArea} L_P²
              </div>
            </div>
            <div style={{ backgroundColor: '#111827', padding: '9px', borderRadius: '6px', border: '1px solid #1f2937' }}>
              <div style={{ fontSize: '10px', color: '#9ca3af' }}>HOLOGRAPHIC ENTROPY S_A</div>
              <div style={{ fontSize: '15px', color: '#10b981', fontFamily: 'monospace', marginTop: '2px' }}>
                {telemetry.holographicEntropy}
              </div>
            </div>
            <div style={{ backgroundColor: '#111827', padding: '9px', borderRadius: '6px', border: '1px solid #1f2937' }}>
              <div style={{ fontSize: '10px', color: '#9ca3af' }}>LOGICAL FIDELITY (F_L)</div>
              <div
                style={{
                  fontSize: '15px',
                  color: telemetry.logicalFidelity > 0.8 ? '#38bdf8' : '#f59e0b',
                  fontFamily: 'monospace',
                  marginTop: '2px'
                }}
              >
                {telemetry.logicalFidelity}
              </div>
            </div>
            <div style={{ backgroundColor: '#111827', padding: '9px', borderRadius: '6px', border: '1px solid #1f2937' }}>
              <div style={{ fontSize: '10px', color: '#9ca3af' }}>RICCI SCALAR (R)</div>
              <div style={{ fontSize: '15px', color: '#f43f5e', fontFamily: 'monospace', marginTop: '2px' }}>
                {telemetry.ricciScalar}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Canvas Viewport */}
      <div style={{ flexGrow: 1, height: '100%', position: 'relative' }}>
        <Canvas
          camera={{ position: [0, 4, 13], fov: 45 }}
          gl={{
            preserveDrawingBuffer: true,
            antialias: false,
            toneMapping: THREE.ACESFilmicToneMapping
          }}
          onPointerDown={() => triggerPerturbation()}
        >
          <color attach="background" args={['#02040a']} />
          <ambientLight intensity={0.25} />
          <pointLight position={[10, 10, 10]} intensity={2.2} color="#38bdf8" />
          
          <SpacetimeGrid
            entanglement={entanglement}
            stateMode={stateMode}
            perturbation={perturbation}
            blackHoleActive={blackHoleActive}
            erBridgeActive={erBridgeActive}
            geodesicsActive={geodesicsActive}
            impactParamY={impactParamY}
            syndromeErrors={syndromeErrors}
            rtActive={rtActive}
            boundaryAngle={boundaryAngle}
            triggerPerturbation={triggerPerturbation}
          />
          
          <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />

          {cinematicBloom && (
            <EffectComposer multisampling={0}>
              <Bloom
                intensity={1.3}
                luminanceThreshold={0.15}
                luminanceSmoothing={0.8}
                mipmapBlur={true}
              />
              <ChromaticAberration
                offset={chromaticOffset}
                radialModulation={true}
                modulationOffset={0.3}
              />
              <Vignette
                eskil={false}
                offset={0.15}
                darkness={1.1}
              />
            </EffectComposer>
          )}
        </Canvas>
      </div>
    </div>
  );
}
