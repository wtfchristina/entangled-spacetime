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
  const [audioEnabled, setAudioEnabled] = useState(false);

  const clockRef = useRef(0);
  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);
  const gainRef = useRef(null);

  const telemetry = computeMetricTelemetry(entanglement, stateMode, blackHoleActive);

  // Initialize and modulate Web Audio synthesizer
  useEffect(() => {
    if (!audioEnabled) {
      if (audioCtxRef.current) {
        audioCtxRef.current.suspend();
      }
      return;
    }

    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(65, ctx.currentTime); // Deep resonant drone
      gain.gain.setValueAtTime(0.08, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      audioCtxRef.current = ctx;
      oscRef.current = osc;
      gainRef.current = gain;
    } else {
      audioCtxRef.current.resume();
    }
  }, [audioEnabled]);

  // Modulate drone pitch & tone based on curvature and black hole state
  useEffect(() => {
    if (audioCtxRef.current && oscRef.current && audioEnabled) {
      const ctx = audioCtxRef.current;
      const basePitch = blackHoleActive ? 42 : 55 + entanglement * 95;
      oscRef.current.frequency.exponentialRampToValueAtTime(
        Math.max(30, basePitch),
        ctx.currentTime + 0.1
      );
    }
  }, [entanglement, blackHoleActive, audioEnabled]);

  const triggerPerturbation = () => {
    setPerturbation({ active: true, startTime: clockRef.current });

    // Brief frequency modulation for the graviton wave
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
          width: '420px',
          padding: '24px',
          backgroundColor: '#0b0f19',
          borderRight: '1px solid #1f2937',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          overflowY: 'auto',
          zIndex: 10
        }}
      >
        <div>
          <h1 style={{ fontSize: '20px', margin: '0 0 6px 0', letterSpacing: '-0.3px' }}>
            AdS/CFT Tensor Network
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af', lineHeight: 1.5 }}>
            Emergent Spacetime Geometry, Black Hole Collapse & Sonification
          </p>
        </div>

        {/* Quantum State Presets */}
        <div>
          <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#9ca3af', letterSpacing: '0.5px' }}>
            QUANTUM STATE TOPOLOGY
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
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
                  padding: '8px 10px',
                  fontSize: '12px',
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

        {/* Entanglement Entropy Slider */}
        <div style={{ backgroundColor: '#111827', padding: '14px', borderRadius: '8px', border: '1px solid #374151' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#9ca3af' }}>ENTANGLEMENT ENTROPY (S)</span>
            <span style={{ fontSize: '13px', color: '#38bdf8', fontFamily: 'monospace' }}>
              {entanglement.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={entanglement}
            disabled={blackHoleActive}
            onChange={(e) => setEntanglement(parseFloat(e.target.value))}
            style={{ width: '100%', cursor: blackHoleActive ? 'not-allowed' : 'pointer', accentColor: '#38bdf8' }}
          />
        </div>

        {/* Action Toggles: Black Hole & Audio Sonification */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button
            onClick={() => setBlackHoleActive(!blackHoleActive)}
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

          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            style={{
              padding: '10px',
              backgroundColor: audioEnabled ? '#065f46' : '#111827',
              color: '#f8fafc',
              border: audioEnabled ? '1px solid #34d399' : '1px solid #374151',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            {audioEnabled ? 'Audio: Active' : 'Sonify Curvature'}
          </button>
        </div>

        {/* Graviton Pulse Button */}
        <button
          onClick={triggerPerturbation}
          style={{
            padding: '11px',
            backgroundColor: '#1e293b',
            color: '#f8fafc',
            border: '1px solid #475569',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600'
          }}
        >
          Emit Graviton Pulse (Perturbation)
        </button>

        {/* Telemetry Dashboard */}
        <div>
          <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#9ca3af', letterSpacing: '0.5px' }}>
            METRIC & HOLOGRAPHIC TELEMETRY
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
            <div style={{ backgroundColor: '#111827', padding: '10px', borderRadius: '6px', border: '1px solid #1f2937' }}>
              <div style={{ fontSize: '10px', color: '#9ca3af' }}>RICCI SCALAR (R)</div>
              <div style={{ fontSize: '16px', color: blackHoleActive ? '#c084fc' : '#f43f5e', fontFamily: 'monospace', marginTop: '3px' }}>
                {telemetry.ricciScalar}
              </div>
            </div>
            <div style={{ backgroundColor: '#111827', padding: '10px', borderRadius: '6px', border: '1px solid #1f2937' }}>
              <div style={{ fontSize: '10px', color: '#9ca3af' }}>VON NEUMANN (S_vN)</div>
              <div style={{ fontSize: '16px', color: '#38bdf8', fontFamily: 'monospace', marginTop: '3px' }}>
                {telemetry.vonNeumannEntropy}
              </div>
            </div>
            <div style={{ backgroundColor: '#111827', padding: '10px', borderRadius: '6px', border: '1px solid #1f2937' }}>
              <div style={{ fontSize: '10px', color: '#9ca3af' }}>METRIC g_00</div>
              <div style={{ fontSize: '16px', color: '#e2e8f0', fontFamily: 'monospace', marginTop: '3px' }}>
                {telemetry.g00}
              </div>
            </div>
            <div style={{ backgroundColor: '#111827', padding: '10px', borderRadius: '6px', border: '1px solid #1f2937' }}>
              <div style={{ fontSize: '10px', color: '#9ca3af' }}>SPATIAL g_rr</div>
              <div style={{ fontSize: '16px', color: '#e2e8f0', fontFamily: 'monospace', marginTop: '3px' }}>
                {telemetry.grr}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Canvas Viewport */}
      <div style={{ flexGrow: 1, height: '100%', position: 'relative' }}>
        <Canvas
          camera={{ position: [0, 4, 11], fov: 45 }}
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
            triggerPerturbation={triggerPerturbation}
          />
          <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        </Canvas>
      </div>
    </div>
  );
}
