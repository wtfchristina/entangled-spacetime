import React from 'react';

export default function UIControls({ entanglementLevel, setEntanglementLevel }) {
  return (
    <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Primary Slider Card */}
      <div style={{ backgroundColor: '#111827', padding: '15px', borderRadius: '8px', border: '1px solid #374151' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#9CA3AF', letterSpacing: '0.5px' }}>ENTANGLEMENT ENTROPY</span>
          <span style={{ fontSize: '14px', color: '#60A5FA', fontFamily: 'monospace' }}>{entanglementLevel.toFixed(3)} S</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.01" 
          value={entanglementLevel}
          onChange={(e) => setEntanglementLevel(parseFloat(e.target.value))}
          style={{ width: '100%', cursor: 'pointer', accentColor: '#3B82F6' }}
        />
      </div>

      {/* Static Data Readouts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div style={{ backgroundColor: '#111827', padding: '15px', borderRadius: '8px', border: '1px solid #374151' }}>
          <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '5px', fontWeight: 'bold' }}>ACTIVE QUBITS</div>
          <div style={{ fontSize: '20px', color: '#F3F4F6', fontFamily: 'monospace' }}>125</div>
        </div>
        <div style={{ backgroundColor: '#111827', padding: '15px', borderRadius: '8px', border: '1px solid #374151' }}>
          <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '5px', fontWeight: 'bold' }}>TENSOR BONDS</div>
          <div style={{ fontSize: '20px', color: '#F3F4F6', fontFamily: 'monospace' }}>300</div>
        </div>
      </div>
      
    </div>
  );
}
