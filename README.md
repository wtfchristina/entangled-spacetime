# Entangled Spacetime Visualizer

An interactive 3D web application modeling emergent spacetime geometry from quantum entanglement, inspired by the AdS/CFT correspondence and the Ryu-Takayanagi formula.

🔗 **Live Demo:** [entangled-spacetime.vercel.app](https://entangled-spacetime.vercel.app)

---

## Overview

In theoretical physics, holographic duality suggests that spacetime geometry is not fundamental, but emerges from entanglement structures within a boundary quantum state. This project provides a real-time, interactive visual representation of this principle.

By adjusting the **Entanglement Entropy** parameter, users can observe the physical lattice contract and exhibit quantum fluctuations, simulating the non-linear relationship between quantum information density and spatial geometry.

## Key Features

- **Dynamic Tensor Network Grid:** 125-node, 300-bond 3D lattice rendered using Three.js and React Three Fiber.
- **Ryu-Takayanagi Warp Simulation:** Procedural mathematical engine modeling gravitational convergence as entanglement entropy increases.
- **Optimized 60 FPS Render Pipeline:** Utilizes raw BufferAttributes and memoized geometry coordinates for fluid performance across devices.
- **Interactive Technical Dashboard:** Real-time metrics tracking active qubits, tensor bonds, and entropy states.

## Tech Stack

- **Frontend:** React 19, Vite
- **3D Graphics:** Three.js, React Three Fiber, @react-three/drei
- **Deployment:** Vercel

## Local Development

```bash
# Clone the repository
git clone [https://github.com/wtfchristina/entangled-spacetime.git](https://github.com/wtfchristina/entangled-spacetime.git)

# Navigate to project folder
cd entangled-spacetime

# Install dependencies
npm install

# Start the dev server
npm run dev
```
