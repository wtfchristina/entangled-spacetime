# Entangled Spacetime Visualizer

An interactive 3D computational physics simulator modeling emergent spacetime geometry from quantum entanglement entropy, inspired by the AdS/CFT correspondence, the Ryu-Takayanagi conjecture, and general relativistic geodesic dynamics.

🔗 **Live Simulator:** [entangled-spacetime.vercel.app](https://entangled-spacetime.vercel.app)  
💻 **Repository:** [github.com/wtfchristina/entangled-spacetime](https://github.com/wtfchristina/entangled-spacetime)

---

## Overview

In theoretical high-energy physics, holographic duality suggests that bulk spacetime geometry is not fundamental, but emerges naturally from the entanglement structure of a boundary quantum state ($S_A = \frac{\text{Area}(\gamma_A)}{4G_N}$). 

This application provides a real-time, in-browser visual and auditory laboratory exploring this principle. Users can manipulate boundary entanglement entropy, alter quantum state topologies, initiate gravitational wave perturbations, trigger black hole collapses, and trace photon geodesics bending through the warped metric.

---

## Key Features

### 1. 3D Tensor Network Lattice
- **Dynamic Topology:** 125-node, 300-bond interactive lattice modeling entangled qubits and boundary connectivity.
- **Ryu-Takayanagi Metric Warping:** Procedural physics engine calculating non-linear coordinate contraction and quantum superposition fluctuations.
- **Curvature Stress Heatmap:** Vertex-colored shader pipeline that transitions bonds from Minkowski flat space (Cyan) to extreme Ricci curvature stress (Magenta/Violet).

### 2. Quantum State Topologies
- **Boundary Vacuum:** Baseline uniform AdS spatial geometry.
- **Bell Pair Cluster:** Entanglement concentrated along primary axes, demonstrating localized wormhole/bridge formation (ER = EPR).
- **GHZ Maximal Coherence:** High global multipartite entanglement driving uniform bulk contraction.
- **Thermal Mixed State:** Decoherent high-entropy system showing geometric decoherence without spatial collapse.

### 3. Null Geodesics & Gravitational Lensing
- **Ray Tracing Engine:** Numerically integrates photon paths through the deformed spacetime metric.
- **Animated Photon Wavepackets:** Real-time particle markers traversing worldlines at the speed of light.
- **Einstein Deflection Telemetry:** Computes live deflection angles ($\Delta\theta \approx \frac{4GM}{c^2 b}$) and metric tensor components ($g_{00}, g_{rr}$) based on adjustable impact parameters ($b$).

### 4. Gravitational Collapse & Event Horizon Dynamics
- **Black Hole Singularity:** Simulates critical gravitational collapse, pulling central nodes into a high-density singularity.
- **Schwarzschild Horizon:** Visualizes an interactive, pulsing wireframe event horizon sphere illustrating the Bekenstein-Hawking area law.

### 5. Procedural Curvature Sonification
- **Web Audio Engine:** Zero-dependency audio synthesizer leveraging the native Web Audio API.
- **Dynamic Acoustic Drone:** Real-time modulation of fundamental frequencies based on Ricci scalar values and graviton wave perturbations.

---

## Metric & Holographic Telemetry

The dashboard computes real-time relativistic and quantum information readouts:
- **Ricci Curvature Scalar ($R$):** Quantitative proxy for local spacetime strain.
- **Von Neumann Entropy ($S_{\text{vN}}$):** Measure of boundary entanglement density.
- **Metric Tensor Components ($g_{00}, g_{rr}$):** Simulates gravitational time dilation and radial spatial stretching.
- **Einstein Deflection Angle ($\Delta\theta$):** Angular trajectory bending of null geodesics.

---

## Tech Stack

- **Framework:** React 19
- **Build Tool:** Vite
- **3D Graphics & Shaders:** Three.js, React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`)
- **Audio Synthesis:** Native Web Audio API
- **Deployment:** Vercel

---

## Local Development

```bash
# Clone the repository
git clone [https://github.com/wtfchristina/entangled-spacetime.git](https://github.com/wtfchristina/entangled-spacetime.git)

# Navigate to the project directory
cd entangled-spacetime

# Install dependencies
npm install

# Start the local development server
npm run dev
