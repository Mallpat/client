# 🚀 Code Mafia: Dreadnought Edition (Hackathon Flagship)

A 2D top-down cyberpunk social deduction & engineering arena built with **React (Vite)**, **HTML5 2D Vector Canvas Engine**, **Monaco Editor**, and **Node.js/Socket.io**.

---

## 🌟 What's New in the Hackathon Dreadnought Edition

### 1. Original Cybernetic Operatives & Sci-Fi Props (Zero "Among Us" Assets)
- **Articulated Cybernetic Operatives**: Segmented ballistic chestplate, armored shoulder pauldrons, glowing AR curved hex-visors, rear jetpack thrusters with animated particle trail exhausts, and mechanical walking strides.
- **Original High-Graphic Procedural Props**:
  - **Quantum Hyper-Reactor Core**: Counter-rotating magnetic stabilization rings and swirling plasma vortex.
  - **Holographic 3D Star-Chart Projector**: Rotating wireframe celestial globe with orbiting orbital rings and digital telemetry glyphs.
  - **Cryogenic Stasis Chambers**: Glass cylinders with bioluminescent cyan fluid, rising air bubbles, and floating 3D DNA double-helix projections.
  - **AI & Supercomputer Databanks**: Monolithic server racks with animated LED data-bus lights and spinning circular ventilation fans.
  - **Tactical Radar & Surveillance Wall**: Multi-screen curved command terminal with rotating radar sweep.
  - **Interactive Decontamination & Wardrobe Pod**: Biometric chamber with sweeping vertical laser scan beam.

### 2. Massive 2400 × 1800 Dreadnought Megastructure (8 Themed Sectors)
1. **Command Bridge [Sector 1]** (North: `x: 850-1550, y: 100-550`): **Terminal 1: Hyperspace Matrix Rotation** (`rotateMatrix90(matrix)`).
2. **AI & Quantum Mainframe [Sector 2]** (North-West: `x: 200-750, y: 150-600`): **Terminal 2: LRU Cache Eviction** (`evictStaleKeys(cache, maxAge)`).
3. **Communications & Sensor Array [Sector 3]** (North-East: `x: 1650-2200, y: 150-600`): **Terminal 3: Signal Packet Defragmenter** (`defragmentPackets(packets)`).
4. **Security & Defense Vault [Sector 4]** (West: `x: 150-700, y: 750-1250`): **Terminal 4: Cryptographic Checksum** (`validateSecurityChecksum(str)`).
5. **Cybernetics & Bio-Lab [Sector 5]** (East: `x: 1700-2250, y: 750-1250`): **Terminal 5: Gene Sequence Splicer** (`spliceNucleotides(dna, target)`).
6. **Quantum Hyper-Reactor Core [Sector 6]** (South: `x: 850-1550, y: 1250-1750`): **Terminal 6: Plasma Pressure Convergence** (`convergePlasmaFrequency(base, target)`).
7. **Central Assembly Atrium** (Center: `x: 850-1550, y: 650-1150`): Central Lockdown Beacon & Wardrobe Pod.
8. **Power Grid Substation & Armory** (South-West / South-East): Tesla coils and auxiliary capacitors.

### 3. Dynamic Imposter Scaling Engine
- Scales dynamically with player count:
  - 1-3 players: 1 Infiltrator (Mafia).
  - 4-6 players: 2 Infiltrators (or 1 if set by host).
  - 7+ players: 3 Infiltrators.
- Host can customize the Imposter setting (`Auto`, `1`, `2`, or `3`) directly from the waiting deck!

### 4. Interactive 2D Waiting Deck Lobby & Live Wardrobe Customizer
- Players spawn directly on the 2D canvas in the lobby to walk around together before the match starts!
- Open the **Wardrobe Drawer** (via proximity `[E]` at the Wardrobe Pod or clicking **"WARDROBE"** in the top bar):
  - **10 Exo-Suit Colorways**: Crimson Vanguard, Cobalt Striker, Emerald Matrix, Solar Pulse, Hyper Orange, Void Nebula, Neon Flamingo, Quantum Cyan, Arctic Frost, Stealth Obsidian.
  - **5 Tactical Visor Glows**: Cyber Cyan, Laser Gold, Toxic Lime, Plasma Red, Ultraviolet.
  - **6 Operative Class Titles**: Lead Architect, Quantum Engineer, Security Specialist, Systems Hacker, Chief Navigator, Bio-Technician.
  - Synchronizes in real time with all players in the lobby!

### 5. Real-Time Mini-Map Radar HUD
- Persistent miniature radar in the top-right corner showing all 8 sectors, live player location blip, and real-time terminal health indicators. Toggleable with `[M]`.

---

## 🎮 Controls
| Key | Action |
| :--- | :--- |
| **`W`**, **`A`**, **`S`**, **`D`** / Arrows | Move cyber operative (with mechanical stride & camera follow) |
| **`[E]`** | Interact with nearest Terminal, Emergency Beacon, or Wardrobe Pod |
| **`[Q]`** | Sabotage Terminal (Infiltrators only during Night Phase) |
| **`[M]`** | Toggle Real-Time Mini-Map Radar HUD |
| **`[Escape]`** | Close Monaco IDE or Wardrobe Drawer |
| **`RUN TEST SUITE ➔`** | Execute code against unit tests in sandboxed Node VM |

---

## 🌐 Live Deployment
- **Frontend (Vercel)**: **[https://client-mallpat2008-3533s-projects.vercel.app](https://client-mallpat2008-3533s-projects.vercel.app)**
- **Local Dev Server**: **[http://localhost:5173](http://localhost:5173)**
- **Backend Core**: **[http://localhost:5000](http://localhost:5000)**
