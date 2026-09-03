# 🚀 Code Mafia: Collaborative Debugging Challenge

A 2D top-down social deduction game inspired by *Among Us*, built with **React (Vite)**, **HTML5 2D Canvas vector routines**, **Monaco Editor**, and **Node.js/Socket.io**.

---

## 🎮 How to Play

### 1. Launch the Game
The server and client are already running:
- **Game URL**: [http://localhost:5173](http://localhost:5173)
- **Backend Core**: [http://localhost:5000](http://localhost:5000)

> **Pro-Tip**: Open **two separate browser windows or tabs** to play multiplayer 1v1 or with friends!

### 2. Controls
- **Movement**: `W`, `A`, `S`, `D` or Arrow Keys (with walking bob animations and camera follow).
- **Interact / Use Terminal**: Press `[E]` or click the floating action button when within range of any terminal console or the Cafeteria emergency button.
- **Sabotage Terminal (Mafia only during Night Phase)**: Press `[Q]` or click "SABOTAGE TERMINAL" when near any terminal console.
- **Close Terminal IDE**: Press `[Escape]` or click `[X]`.
- **Run Tests inside Terminal**: Press `[Ctrl + Enter]` or click `RUN TEST SUITE ➔`.

---

## 🗺️ Spaceship Map & Terminals

- **Central Cafeteria** (Center: `x: 600, y: 450`):
  - Round meeting table with the pulsing red **Emergency Standup Button**.
- **Server Room** (North: `x: 600, y: 140`):
  - Dark blue floor with blinking server racks.
  - **Terminal A**: Array Deduplication & Numerical Sort (`deduplicateAndSort(arr)`).
- **Algorithm Lab** (East: `x: 960, y: 450`):
  - Holographic displays and lab panels.
  - **Terminal B**: Arithmetic Balancing Bug (`calculateSubsystemSum(a, b)`).
- **Security Vault** (West: `x: 240, y: 450`):
  - Reinforced steel vault monitors.
  - **Terminal C**: Passphrase Palindrome Validator (`validatePassphrase(str)`).

---

## ⏱️ Game Phases & Flow

1. **LOBBY**:
   - Pick your astronaut suit color (Red, Blue, Green, Yellow, Orange, Purple, Pink, Cyan).
   - Enter your astronaut callsign.
   - Host launches mission once at least 2 players have joined.

2. **DAY SPRINT (90 Seconds)**:
   - Full ship illumination.
   - Developers walk to terminals and fix broken code in Monaco IDE.
   - Live progress bar tracks **Ship Integrity (X / 3 Terminals Fixed)**.

3. **NIGHT BLACKOUT (30 Seconds)**:
   - Ship loses primary power!
   - **Developers**: Flashlight fog of war (135px circular vision around player, rest of the ship is pitch black).
   - **Mafia**: Night vision enabled (sees the full map). Can press `[Q]` near terminals to revert fixes and inject syntax bugs!

4. **EMERGENCY STANDUP (35 Seconds)**:
   - Triggered either by pressing `[E]` on the Cafeteria Emergency Button or automatically after Night phase ends.
   - Conference table UI with all alive players.
   - Live debate chat channel.
   - Anonymous voting: Vote to eject suspect or skip vote.
   - Dramatic ejection sequence reveals whether the ejected player was Crew or Mafia!

5. **WIN CONDITIONS**:
   - **Developers Win**: Stabilize all 3 terminals (100% tests passing) **OR** eject all Mafia infiltrators.
   - **Mafia Win**: Round time expires before all 3 terminals are fixed **OR** Mafia reaches player parity.
