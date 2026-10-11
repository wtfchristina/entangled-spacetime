import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import SpacetimeGrid from './components/SpacetimeGrid';
import UIControls from './components/UIControls';

function App() {
  const [entanglementLevel, setEntanglementLevel] = useState(0.5);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#030712', margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Dashboard Sidebar */}
      <div style={{ 
        width: '380px', 
        padding: '30px', 
        color: '#fff', 
        boxSizing: 'border-box',
        backgroundColor: '#0B0F19',
        borderRight: '1px solid #1F2937',
        zIndex: 10,
        boxShadow: '4px 0 15px rgba(0,0,0,0.5)'
      }}>
        <div style={{ borderBottom: '1px solid #1F2937', paddingBottom: '20px', marginBottom: '20px' }}>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '24px', letterSpacing: '-0.5px' }}>AdS/CFT Visualizer</h1>
          <p style={{ color: '#9CA3AF', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
            Interactive tensor network simulation mapping quantum entanglement to emergent spacetime geometry.
          </p>
        </div>
        
        <UIControls 
          entanglementLevel={entanglementLevel} 
          setEntanglementLevel={setEntanglementLevel} 
        />

        <div style={{ marginTop: '30px', padding: '15px', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderLeft: '3px solid #3B82F6', fontSize: '13px', color: '#D1D5DB', lineHeight: '1.6' }}>
          <strong>Observation:</strong> As entropy increases, the Ryu-Takayanagi algorithm calculates a tighter geometric area, simulating gravitational pull on the spatial boundaries.
        </div>
      </div>

      {/* 3D Canvas */}
      <div style={{ flexGrow: 1, height: '100%', position: 'relative' }}>
        <Canvas camera={{ position: [0, 4, 12], fov: 45 }}>
          <color attach="background" args={['#030712']} />
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={2} color="#60A5FA" />
          <SpacetimeGrid entanglement={entanglementLevel} />
          <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        </Canvas>
      </div>

    </div>
  );
}

export default App;
