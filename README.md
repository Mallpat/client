# 🚀 Code Mafia: Dreadnought Edition (Hackathon Flagship)

A 2D top-down cyberpunk social deduction & engineering arena built with **React (Vite)**, **HTML5 2D Vector Canvas Engine**, **Monaco Editor**, and **Node.js/Socket.io**.

---

## 🌟 What's New in the Hackathon Dreadnought Edition

### 1. Avengers Heroes Roster (Replacing Generic Suits)
- **9 Iconic Avengers Characters**:
  1. **Iron Man (Tony Stark)**: Arc Reactor chest piece, gold-titanium armor, **boot jet thruster flames & hovering bob**.
  2. **Captain America (Steve Rogers)**: Vibranium star shield with gleam, tactical harness, **military sprint & shield tilt**.
  3. **Thor (God of Thunder)**: Mjolnir war hammer, flowing red cape, **cape physics ripple & electric lightning sparks**.
  4. **Hulk (Bruce Banner)**: Heavy gamma musculature (1.22x scale), **ground-shaking stomping gait & dust shockwaves**.
  5. **Black Widow (Natasha Romanoff)**: Tactical stealth suit, crimson braid, **low-profile sprint & Widow's Bite taser sparks**.
  6. **Spider-Man (Peter Parker)**: Web-patterned suit, large expressive triangular eyes, **springy crouch-jog**.
  7. **Doctor Strange (Stephen Strange)**: Cloak of Levitation, Eye of Agamotto, **floating levitation & rotating Eldritch Tao Mandalas**.
  8. **Black Panther (King T'Challa)**: Vibranium weave suit with claw necklace, **sleek feline prowl & purple kinetic energy pulses**.
  9. **Hawkeye (Clint Barton)**: Tactical archery gear, recurve bow, **archer jog & quiver with arrows**.

### 2. Calibrated Prop Speed & Host/Admin Control
- **Balanced Default Speed**: Reduced fixed velocity from `4.2` to a comfortable, tactical `2.4`.
- **Live Admin Speed Control**:
  - Room Host can adjust speed in the Lobby Waiting Deck or live during gameplay via the top bar `⚡ SPEED: [2.4x] ⚙️` controller.
  - Quick-preset buttons: **Stealth (1.8x)**, **Normal (2.4x)**, **Combat (3.2x)**, **Super (4.0x)**.
  - Instantly synced across all players via WebSocket `room_update`.

### 3. Dramatic Elimination Animations & Fallen Hero Relics
- **Thanos Snap Dissolution Cutscene**:
  - When an operative is voted out during Standup Debate, a full-screen cinematic modal activates.
  - The eliminated Avenger's body progressively turns into 180+ glowing cosmic ash particles drifting away.
  - Role reveal debrief confirms whether an Infiltrator was banished or an Innocent Avenger fell.
- **On-Canvas Fallen Hero Relics**:
  - Defeated players leave behind iconic memorial remnants on the ship floor (Cap's shield embedded in the deck, Thor's Mjolnir sparking, Iron Man's glowing Arc Reactor, Hulk's gamma crater, Spidey's mask, Doctor Strange's Eye of Agamotto, etc.).
  - Eliminated players transition into ethereal translucent ghost mode (`👻`) to observe or solve remaining terminals!

### 4. Colossal 3600 × 2700 Dreadnought Megastructure & Specific Barrier Physics
- **Expanded Map Scale (2.25x Area)**: The starship has been expanded to **3600 × 2700** with massive, dedicated sector rooms, wide inter-sector corridors with chevrons, and thick industrial metallic bulkheads.
- **Physical Room Wall Collisions & Wall Sliding**:
  - Operatives cannot walk out of the rooms into deep space or penetrate solid metallic walls.
  - Smooth 2D AABB wall-sliding physics ensures fluid navigation against walls and doorways.
- **Specific Obstacle Barriers**:
  - Solid collisions for consoles, the pulsing Plasma Reactor containment, cooling fans, stasis tubes, Wardrobe pods, and the Central Standup Beacon.
- **Lobby Forcefield Barriers**:
  - In the Lobby phase, all 4 corridor exits out of the Central Waiting Deck are blocked by animated **Red Laser Forcefield Barriers** (`🔒 FORCEFIELD // LOBBY LOCKED`), keeping operatives securely inside the room until 3 players log in!
  - Upon 3 players assembling, the forcefield disengages, doors illuminate green, and squad members are deployed across the sectors!

1. **Command Bridge [Sector 1]** (North: `x: 1340-2260, y: 180-800`): **Terminal 1: Hyperspace Matrix Rotation** (`rotateMatrix90(matrix)`).
2. **AI & Quantum Mainframe [Sector 2]** (North-West: `x: 250-1050, y: 200-850`): **Terminal 2: LRU Cache Eviction** (`evictStaleKeys(cache, maxAge)`).
3. **Communications & Sensor Array [Sector 3]** (North-East: `x: 2550-3350, y: 200-850`): **Terminal 3: Signal Packet Defragmenter** (`defragmentPackets(packets)`).
4. **Security & Surveillance Vault [Sector 4]** (West: `x: 200-1000, y: 1100-1850`): **Terminal 4: Cryptographic Checksum** (`validateSecurityChecksum(str)`).
5. **Cybernetics & Bio-Lab [Sector 5]** (East: `x: 2600-3400, y: 1100-1850`): **Terminal 5: Gene Sequence Splicer** (`spliceNucleotides(dna, target)`).
6. **Quantum Hyper-Reactor Core [Sector 6]** (South: `x: 1340-2260, y: 1900-2550`): **Terminal 6: Plasma Pressure Convergence** (`convergePlasmaFrequency(base, target)`).
7. **Central Assembly Atrium & Waiting Deck** (Center: `x: 1340-2260, y: 1040-1660`): Emergency Standup Beacon & Wardrobe Pod.
8. **Tactical Corridor Network**: North, South, East, West, and auxiliary connecting corridors with directional chevron floor plating.

### 5. Dynamic Imposter Scaling Engine
- Scales dynamically with player count:
  - 1-3 players: 1 Infiltrator (Mafia).
  - 4-6 players: 2 Infiltrators (or 1 if set by host).
  - 7+ players: 3 Infiltrators.
- Host can customize the Imposter setting (`Auto`, `1`, `2`, or `3`) directly from the waiting deck!

### 6. Interactive 2D Waiting Deck Lobby & Live Wardrobe Customizer
- Players spawn directly on the 2D canvas in the lobby to walk around together before the match starts!
- Open the **Wardrobe Drawer** (via proximity `[E]` at the Wardrobe Pod or clicking **"WARDROBE"** in the top bar) to switch your Avengers hero, specialization title, and view authentic lore quotes.
- Synchronizes in real time with all players in the lobby!

### 7. Real-Time Mini-Map Radar HUD
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
