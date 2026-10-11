import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
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
    impactParamY
  );

  // Initialize Web Audio synthesizer with dual harmonic oscillators
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

  // Modulate synth frequencies based on ER wormhole throat & curvature
  useEffect(() => {
    if (audioCtxRef.current && oscRef.current && osc2Ref.current && audioEnabled) {
      const ctx = audioCtxRef.current;
      let basePitch = 55 + entanglement * 95;
      if (erBridgeActive) basePitch = 110 + entanglement * 75; // Resonant higher harmonic for wormhole
      if (blackHoleActive && !erBridgeActive) basePitch = 42;

      oscRef.current.frequency.exponentialRampToValueAtTime(
        Math.max(30, basePitch),
        ctx.currentTime + 0.1
      );
      osc2Ref.current.frequency.exponentialRampToValueAtTime(
        Math.max(60, basePitch * 1.5),
        ctx.currentTime + 0.1
      );
    }
  }, [entanglement, blackHoleActive, erBridgeActive, audioEnabled]);

  const triggerPerturbation = () => {
    setPerturbation({ active: true, startTime: clockRef.current });

    if (audioCtxRef.current && oscRef.current && audioEnabled) {
      const ctx = audioCtxRef.current;
      const currentFreq = oscRef.current.frequency.value;
      oscRef.current.frequency.setValueAtTime(currentFreq * 2.2, ctx.currentTime);
      oscRef.current.frequency.exponentialRampToValueAtTime(currentFreq, ctx.currentTime + 0.6);
    }
  };

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
          width: '430px',
          padding: '24px',
          backgroundColor: '#0b0f19',
          borderRight: '1px solid #1f2937',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          overflowY: 'auto',
          zIndex: 10
        }}
      >
        <div>
          <h1 style={{ fontSize: '20px', margin: '0 0 4px 0', letterSpacing: '-0.3px' }}>
            AdS/CFT Tensor Network
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af', lineHeight: 1.4 }}>
            ER = EPR Wormhole Bridge & Geodesic Dynamics Simulator
          </p>
        </div>

        {/* Feature Toggles: ER = EPR, Black Hole, Audio */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button
            onClick={() => {
              setErBridgeActive(!erBridgeActive);
              if (!erBridgeActive) setBlackHoleActive(false);
            }}
            style={{
              padding: '10px',
              backgroundColor: erBridgeActive ? '#0891b2' : '#0e3a47',
              color: '#f8fafc',
              border: erBridgeActive ? '1px solid #22d3ee' : '1px solid #155e75',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '12px',
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
              padding: '10px',
              backgroundColor: blackHoleActive ? '#7e22ce' : '#1e1b4b',
              color: '#f8fafc',
              border: blackHoleActive ? '1px solid #c084fc' : '1px solid #4338ca',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            {blackHoleActive ? 'Collapse: Active' : 'Form Event Horizon'}
          </button>
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

        {/* Quantum State Presets (Available when not in ER mode) */}
        {!erBridgeActive && (
          <div>
            <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#9ca3af', letterSpacing: '0.5px' }}>
              QUANTUM STATE TOPOLOGY
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '6px' }}>
              {[
                { id: 'standard', name: 'Boundary Vacuum' },
                { id: 'bell', name: 'Bell Pair Cluster' },
                { id: 'ghz', name: 'GHZ Maximal Coherence' },
                { id: 'thermal', name: 'Thermal Mixed State' }
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setStateMode(st.id)}
                  disabled={blackHoleActive}
                  style={{
                    padding: '7px 8px',
                    fontSize: '11px',
                    fontWeight: stateMode === st.id ? '600' : '400',
                    borderRadius: '6px',
                    border: stateMode === st.id ? '1px solid #38bdf8' : '1px solid #374151',
                    backgroundColor: stateMode === st.id ? 'rgba(56, 189, 248, 0.15)' : '#111827',
                    color: stateMode === st.id ? '#38bdf8' : '#d1d5db',
                    cursor: blackHoleActive ? 'not-allowed' : 'pointer',
                    opacity: blackHoleActive ? 0.4 : 1,
                    textAlign: 'left'
                  }}
                >
                  {st.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Geodesic Ray Controls */}
        <div style={{ backgroundColor: '#111827', padding: '12px', borderRadius: '8px', border: '1px solid #374151' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#facc15' }}>NULL GEODESIC RAYS (LIGHT)</span>
            <button
              onClick={() => setGeodesicsActive(!geodesicsActive)}
              style={{
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: 'bold',
                backgroundColor: geodesicsActive ? '#ca8a04' : '#1f2937',
                color: '#fff',
                border: '1px solid #eab308',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {geodesicsActive ? 'Beams ON' : 'Beams OFF'}
            </button>
          </div>
          {geodesicsActive && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>
                <span>Impact Parameter (b)</span>
                <span style={{ fontFamily: 'monospace', color: '#facc15' }}>{impactParamY.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="3.5"
                step="0.05"
                value={impactParamY}
                onChange={(e) => setImpactParamY(parseFloat(e.target.value))}
                style={{ width: '100%', cursor: 'pointer', accentColor: '#facc15' }}
              />
            </div>
          )}
        </div>

        {/* Utility Controls */}
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
              fontSize: '12px',
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
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            Graviton Pulse
          </button>
        </div>

        {/* Telemetry Readouts */}
        <div>
          <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#9ca3af', letterSpacing: '0.5px' }}>
            {erBridgeActive ? 'ER = EPR WORMHOLE TELEMETRY' : 'METRIC & GEODESIC TELEMETRY'}
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '6px' }}>
            <div style={{ backgroundColor: '#111827', padding: '9px', borderRadius: '6px', border: '1px solid #1f2937' }}>
              <div style={{ fontSize: '10px', color: '#9ca3af' }}>
                {erBridgeActive ? 'THROAT RADIUS (r_0)' : 'RICCI SCALAR (R)'}
              </div>
              <div
                style={{
                  fontSize: '15px',
                  color: erBridgeActive ? '#22d3ee' : blackHoleActive ? '#c084fc' : '#f43f5e',
                  fontFamily: 'monospace',
                  marginTop: '2px'
                }}
              >
                {erBridgeActive ? telemetry.throatRadius : telemetry.ricciScalar}
              </div>
            </div>
            <div style={{ backgroundColor: '#111827', padding: '9px', borderRadius: '6px', border: '1px solid #1f2937' }}>
              <div style={{ fontSize: '10px', color: '#9ca3af' }}>DEFLECTION (Δθ)</div>
              <div style={{ fontSize: '15px', color: '#facc15', fontFamily: 'monospace', marginTop: '2px' }}>
                {telemetry.deflectionAngle}
              </div>
            </div>
            <div style={{ backgroundColor: '#111827', padding: '9px', borderRadius: '6px', border: '1px solid #1f2937' }}>
              <div style={{ fontSize: '10px', color: '#9ca3af' }}>METRIC g_00</div>
              <div style={{ fontSize: '15px', color: '#e2e8f0', fontFamily: 'monospace', marginTop: '2px' }}>
                {telemetry.g00}
              </div>
            </div>
            <div style={{ backgroundColor: '#111827', padding: '9px', borderRadius: '6px', border: '1px solid #1f2937' }}>
              <div style={{ fontSize: '10px', color: '#9ca3af' }}>SPATIAL g_rr</div>
              <div style={{ fontSize: '15px', color: '#e2e8f0', fontFamily: 'monospace', marginTop: '2px' }}>
                {telemetry.grr}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Canvas Viewport */}
      <div style={{ flexGrow: 1, height: '100%', position: 'relative' }}>
        <Canvas
          camera={{ position: [0, 4, 13], fov: 45 }}
          onPointerDown={() => triggerPerturbation()}
        >
          <color attach="background" args={['#030712']} />
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1.8} color="#38bdf8" />
          <SpacetimeGrid
            entanglement={entanglement}
            stateMode={stateMode}
            perturbation={perturbation}
            blackHoleActive={blackHoleActive}
            erBridgeActive={erBridgeActive}
            geodesicsActive={geodesicsActive}
            impactParamY={impactParamY}
            triggerPerturbation={triggerPerturbation}
          />
          <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        </Canvas>
      </div>
    </div>
  );
}
