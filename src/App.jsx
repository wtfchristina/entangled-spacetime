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
  
  // Ryu-Takayanagi & HKLL Subregion States
  const [rtActive, setRtActive] = useState(true);
  const [boundaryAngle, setBoundaryAngle] = useState(2.1);

  // Gao-Jafferis-Wall Traversable Teleportation State
  const [teleportPacket, setTeleportPacket] = useState({ active: false, startTime: 0, phase: 'idle' });

  // Camera Director Mode
  const [cameraMode, setCameraMode] = useState('lab');

  const clockRef = useRef(0);
  const controlsRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const oscRef = useRef(null);
  const osc2Ref = useRef(null);
  const gainRef = useRef(null);
  const oscilloscopeCanvasRef = useRef(null);

  const telemetry = computeMetricTelemetry(
    entanglement,
    stateMode,
    blackHoleActive,
    erBridgeActive,
    impactParamY,
    syndromeErrors,
    boundaryAngle,
    teleportPacket
  );

  // Initialize Web Audio synthesizer with AnalyserNode for the Oscilloscope
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
      const analyser = ctx.createAnalyser();

      analyser.fftSize = 128;

      osc.type = 'sine';
      osc2.type = 'triangle';
      osc.frequency.setValueAtTime(65, ctx.currentTime);
      osc2.frequency.setValueAtTime(130, ctx.currentTime);
      gain.gain.setValueAtTime(0.07, ctx.currentTime);

      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(analyser);
      analyser.connect(ctx.destination);

      osc.start();
      osc2.start();

      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      oscRef.current = osc;
      osc2Ref.current = osc2;
      gainRef.current = gain;
    } else {
      audioCtxRef.current.resume();
    }
  }, [audioEnabled]);

  // Audio modulation
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

  // Draw Live Audio Oscilloscope Canvas
  useEffect(() => {
    let animId;
    const canvas = oscilloscopeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const renderOscilloscope = () => {
      animId = requestAnimationFrame(renderOscilloscope);

      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (analyserRef.current && audioEnabled) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteTimeDomainData(dataArray);

        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#34d399';
        ctx.beginPath();

        const sliceWidth = canvas.width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * canvas.height) / 2;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);

          x += sliceWidth;
        }

        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
      } else {
        // Flat baseline when audio is disabled
        ctx.lineWidth = 1.0;
        ctx.strokeStyle = '#374151';
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
      }
    };

    renderOscilloscope();
    return () => cancelAnimationFrame(animId);
  }, [audioEnabled]);

  const triggerPerturbation = () => {
    setPerturbation({ active: true, startTime: clockRef.current });

    if (audioCtxRef.current && oscRef.current && audioEnabled) {
      const ctx = audioCtxRef.current;
      const currentFreq = oscRef.current.frequency.value;
      oscRef.current.frequency.setValueAtTime(currentFreq * 2.2, ctx.currentTime);
      oscRef.current.frequency.exponentialRampToValueAtTime(currentFreq, ctx.currentTime + 0.6);
    }
  };

  const fireTeleportationProtocol = () => {
    if (!erBridgeActive) setErBridgeActive(true);

    const now = clockRef.current;
    setTeleportPacket({ active: true, startTime: now, phase: 'transiting' });

    if (audioCtxRef.current && oscRef.current && audioEnabled) {
      const ctx = audioCtxRef.current;
      oscRef.current.frequency.setValueAtTime(320, ctx.currentTime);
      oscRef.current.frequency.exponentialRampToValueAtTime(740, ctx.currentTime + 1.2);
      oscRef.current.frequency.exponentialRampToValueAtTime(520, ctx.currentTime + 2.4);
    }

    setTimeout(() => {
      setTeleportPacket((prev) => ({ ...prev, phase: 'arrived' }));
    }, 2400);

    setTimeout(() => {
      setTeleportPacket({ active: false, startTime: 0, phase: 'idle' });
    }, 5500);
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
        cameraPerspective: cameraMode,
        blackHoleActive,
        erBridgeActive,
        geodesicsActive,
        impactParameter: impactParamY
      },
      teleportationProtocol: {
        status: teleportPacket.phase,
        fidelity: teleportPacket.phase === 'arrived' ? '0.998' : 'N/A'
      },
      holographicDuality: {
        ryuTakayanagiMinimalArea: telemetry.rtArea,
        holographicEntanglementEntropy: telemetry.holographicEntropy,
        hkllReconstructionError: telemetry.hkllError,
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
          gap: '12px',
          overflowY: 'auto',
          zIndex: 10
        }}
      >
        <div>
          <h1 style={{ fontSize: '20px', margin: '0 0 4px 0', letterSpacing: '-0.3px' }}>
            AdS/CFT Tensor Network
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af', lineHeight: 1.4 }}>
            Quantum Gravity & Relativistic Visualizer
          </p>
        </div>

        {/* Feature: Cinematic Camera Director */}
        <div style={{ backgroundColor: '#111827', padding: '12px', borderRadius: '8px', border: '1px solid #374151' }}>
          <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#38bdf8', letterSpacing: '0.5px' }}>
            CINEMATIC CAMERA DIRECTOR
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '6px' }}>
            {[
              { id: 'lab', name: 'Laboratory (Default)' },
              { id: 'horizon', name: 'Horizon Orbit' },
              { id: 'throat', name: 'Wormhole Throat' },
              { id: 'cft', name: 'CFT Top-Down' },
              { id: 'orbit', name: '360° Cinematic Glide' }
            ].map((cam) => (
              <button
                key={cam.id}
                onClick={() => setCameraMode(cam.id)}
                style={{
                  padding: '7px 8px',
                  fontSize: '11px',
                  fontWeight: cameraMode === cam.id ? '600' : '400',
                  borderRadius: '6px',
                  border: cameraMode === cam.id ? '1px solid #38bdf8' : '1px solid #374151',
                  backgroundColor: cameraMode === cam.id ? 'rgba(56, 189, 248, 0.2)' : '#0f172a',
                  color: cameraMode === cam.id ? '#38bdf8' : '#9ca3af',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                {cam.name}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Toggles: ER = EPR & Black Hole */}
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

        {/* Traversable Wormhole Teleportation Console */}
        <div style={{ backgroundColor: '#111827', padding: '12px', borderRadius: '8px', border: '1px solid #374151' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#34d399' }}>
              TRAVERSABLE WORMHOLE PROTOCOL
            </span>
            <span
              style={{
                fontSize: '10px',
                fontFamily: 'monospace',
                color: teleportPacket.phase === 'arrived' ? '#34d399' : teleportPacket.phase === 'transiting' ? '#facc15' : '#9ca3af'
              }}
            >
              {teleportPacket.phase === 'transiting' && '● TRANSITING'}
              {teleportPacket.phase === 'arrived' && '✔ RECONSTRUCTED'}
              {teleportPacket.phase === 'idle' && 'READY'}
            </span>
          </div>
          <button
            onClick={fireTeleportationProtocol}
            disabled={teleportPacket.active}
            style={{
              width: '100%',
              padding: '9px',
              backgroundColor: teleportPacket.active ? '#065f46' : '#047857',
              color: '#d1fae5',
              border: '1px solid #10b981',
              borderRadius: '6px',
              cursor: teleportPacket.active ? 'not-allowed' : 'pointer',
              fontSize: '11px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <span>
              {teleportPacket.phase === 'transiting' && '⚡ Transiting Wormhole Throat (A → B)...'}
              {teleportPacket.phase === 'arrived' && '🎉 Qubit Reconstructed at Mouth B!'}
              {teleportPacket.phase === 'idle' && 'Teleport Qubit Across Bridge (A → B)'}
            </span>
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

        {/* Ryu-Takayanagi Minimal Surface Controls */}
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

        {/* Live Audio Oscilloscope Canvas */}
        <div style={{ backgroundColor: '#111827', padding: '10px 12px', borderRadius: '8px', border: '1px solid #374151' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '11px', color: '#9ca3af' }}>
            <span style={{ fontWeight: 'bold', color: audioEnabled ? '#34d399' : '#6b7280' }}>
              {audioEnabled ? 'ACOUSTIC OSCILLOSCOPE (ACTIVE)' : 'ACOUSTIC OSCILLOSCOPE (OFFLINE)'}
            </span>
            <span>Web Audio API</span>
          </div>
          <canvas
            ref={oscilloscopeCanvasRef}
            width={380}
            height={36}
            style={{ width: '100%', height: '36px', borderRadius: '4px', display: 'block' }}
          />
        </div>

        {/* QEC Console */}
        <div style={{ backgroundColor: '#111827', padding: '12px', borderRadius: '8px', border: '1px solid #374151' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#f59e0b' }}>
              TOPOLOGICAL QUANTUM ERROR CORRECTION
            </span>
            <span style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'monospace' }}>
              [[125, 1, 5]]
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
              Inject Noise (+5)
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
              Decode Syndromes
            </button>
          </div>
        </div>

        {/* Optical & Geodesic Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button
            onClick={() => setGeodesicsActive(!geodesicsActive)}
            style={{
              padding: '8px',
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
              padding: '8px',
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

        {/* Audio and Pulse */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            style={{
              padding: '8px',
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
              padding: '8px',
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

        {/* Snapshot & Export */}
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

        {/* Holographic & Relativistic Telemetry Readouts */}
        <div>
          <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#9ca3af', letterSpacing: '0.5px' }}>
            HOLOGRAPHIC & HKLL BULK TELEMETRY
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '6px' }}>
            <div style={{ backgroundColor: '#111827', padding: '9px', borderRadius: '6px', border: '1px solid #1f2937' }}>
              <div style={{ fontSize: '10px', color: '#9ca3af' }}>MINIMAL AREA Area(γ_A)</div>
              <div style={{ fontSize: '14px', color: '#10b981', fontFamily: 'monospace', marginTop: '2px' }}>
                {telemetry.rtArea} L_P²
              </div>
            </div>
            <div style={{ backgroundColor: '#111827', padding: '9px', borderRadius: '6px', border: '1px solid #1f2937' }}>
              <div style={{ fontSize: '10px', color: '#9ca3af' }}>HKLL BULK ERROR</div>
              <div style={{ fontSize: '14px', color: '#38bdf8', fontFamily: 'monospace', marginTop: '2px' }}>
                {telemetry.hkllError}
              </div>
            </div>
            <div style={{ backgroundColor: '#111827', padding: '9px', borderRadius: '6px', border: '1px solid #1f2937' }}>
              <div style={{ fontSize: '10px', color: '#9ca3af' }}>LOGICAL FIDELITY</div>
              <div
                style={{
                  fontSize: '14px',
                  color: telemetry.logicalFidelity > 0.8 ? '#34d399' : '#f59e0b',
                  fontFamily: 'monospace',
                  marginTop: '2px'
                }}
              >
                {telemetry.logicalFidelity}
              </div>
            </div>
            <div style={{ backgroundColor: '#111827', padding: '9px', borderRadius: '6px', border: '1px solid #1f2937' }}>
              <div style={{ fontSize: '10px', color: '#9ca3af' }}>RICCI SCALAR (R)</div>
              <div style={{ fontSize: '14px', color: '#f43f5e', fontFamily: 'monospace', marginTop: '2px' }}>
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
            teleportPacket={teleportPacket}
            clockRef={clockRef}
            cameraMode={cameraMode}
            controlsRef={controlsRef}
            triggerPerturbation={triggerPerturbation}
          />
          
          <OrbitControls ref={controlsRef} enablePan={true} enableZoom={true} enableRotate={true} />

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
