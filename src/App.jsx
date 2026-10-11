import React, { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import SpacetimeGrid from './components/SpacetimeGrid';
import { computeMetricTelemetry } from './logic/tensorCalculations';

export default function App() {
  const [entanglement, setEntanglement] = useState(0.5);
  const [stateMode, setStateMode] = useState('standard');
  const [perturbation, setPerturbation] = useState({ active: false, startTime: 0 });

  const clockRef = useRef(0);

  const telemetry = computeMetricTelemetry(entanglement, stateMode);

  const triggerPerturbation = () => {
    setPerturbation({ active: true, startTime: clockRef.current });
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
          width: '400px',
          padding: '24px',
          backgroundColor: '#0b0f19',
          borderRight: '1px solid #1f2937',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          overflowY: 'auto',
          zIndex: 10
        }}
      >
        <div>
          <h1 style={{ fontSize: '20px', margin: '0 0 6px 0', letterSpacing: '-0.3px' }}>
            AdS/CFT Tensor Network
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af', lineHeight: 1.5 }}>
            Emergent Spacetime Geometry & Curvature Tensor Visualizer
          </p>
        </div>

        {/* Layer 2: Quantum State Presets */}
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
                style={{
                  padding: '8px 10px',
                  fontSize: '12px',
                  fontWeight: stateMode === st.id ? '600' : '400',
                  borderRadius: '6px',
                  border: stateMode === st.id ? '1px solid #38bdf8' : '1px solid #374151',
                  backgroundColor: stateMode === st.id ? 'rgba(56, 189, 248, 0.15)' : '#111827',
                  color: stateMode === st.id ? '#38bdf8' : '#d1d5db',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                {st.name}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Slider */}
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
            onChange={(e) => setEntanglement(parseFloat(e.target.value))}
            style={{ width: '100%', cursor: 'pointer', accentColor: '#38bdf8' }}
          />
        </div>

        {/* Layer 3: Perturbation Button */}
        <button
          onClick={triggerPerturbation}
          style={{
            padding: '12px',
            backgroundColor: '#1e293b',
            color: '#f8fafc',
            border: '1px solid #475569',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <span>Emit Graviton Pulse (Perturbation)</span>
        </button>

        {/* Layer 1: General Relativity Telemetry Dashboard */}
        <div>
          <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#9ca3af', letterSpacing: '0.5px' }}>
            GENERAL RELATIVITY METRIC READOUT
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
            <div style={{ backgroundColor: '#111827', padding: '12px', borderRadius: '6px', border: '1px solid #1f2937' }}>
              <div style={{ fontSize: '10px', color: '#9ca3af' }}>RICCI SCALAR (R)</div>
              <div style={{ fontSize: '16px', color: '#f43f5e', fontFamily: 'monospace', marginTop: '4px' }}>
                {telemetry.ricciScalar}
              </div>
            </div>
            <div style={{ backgroundColor: '#111827', padding: '12px', borderRadius: '6px', border: '1px solid #1f2937' }}>
              <div style={{ fontSize: '10px', color: '#9ca3af' }}>VON NEUMANN (S_vN)</div>
              <div style={{ fontSize: '16px', color: '#38bdf8', fontFamily: 'monospace', marginTop: '4px' }}>
                {telemetry.vonNeumannEntropy}
              </div>
            </div>
            <div style={{ backgroundColor: '#111827', padding: '12px', borderRadius: '6px', border: '1px solid #1f2937' }}>
              <div style={{ fontSize: '10px', color: '#9ca3af' }}>METRIC g_00</div>
              <div style={{ fontSize: '16px', color: '#e2e8f0', fontFamily: 'monospace', marginTop: '4px' }}>
                {telemetry.g00}
              </div>
            </div>
            <div style={{ backgroundColor: '#111827', padding: '12px', borderRadius: '6px', border: '1px solid #1f2937' }}>
              <div style={{ fontSize: '10px', color: '#9ca3af' }}>SPATIAL g_rr</div>
              <div style={{ fontSize: '16px', color: '#e2e8f0', fontFamily: 'monospace', marginTop: '4px' }}>
                {telemetry.grr}
              </div>
            </div>
          </div>
        </div>

        {/* Heatmap Legend */}
        <div style={{ padding: '12px', backgroundColor: '#111827', borderRadius: '6px', border: '1px solid #1f2937', fontSize: '11px', color: '#9ca3af' }}>
          <div style={{ marginBottom: '6px', fontWeight: 'bold' }}>CURVATURE STRESS GRADIENT</div>
          <div
            style={{
              height: '8px',
              borderRadius: '4px',
              background: 'linear-gradient(to right, #38bdf8, #f43f5e)',
              marginBottom: '6px'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
            <span>Minkowski Flat (Cyan)</span>
            <span>High Ricci Curvature (Magenta)</span>
          </div>
        </div>
      </div>

      {/* 3D Canvas Area */}
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
            triggerPerturbation={triggerPerturbation}
          />
          <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        </Canvas>
      </div>
    </div>
  );
}
