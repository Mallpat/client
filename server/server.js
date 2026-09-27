const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const vm = require('vm');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const distPath = path.join(__dirname, 'dist');
const clientDistPath = path.join(__dirname, '..', 'dist');
const activeDist = fs.existsSync(distPath) ? distPath : (fs.existsSync(clientDistPath) ? clientDistPath : null);

if (activeDist) {
  app.use(express.static(activeDist));
}

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Code Mafia 2D Dreadnought Server',
    version: '2.0.0-hackathon',
    timestamp: new Date().toISOString()
  });
});

app.get('*', (req, res, next) => {
  if (req.path === '/health' || req.path.startsWith('/socket.io')) {
    return next();
  }
  if (activeDist && fs.existsSync(path.join(activeDist, 'index.html'))) {
    return res.sendFile(path.join(activeDist, 'index.html'));
  }
  res.json({
    status: 'ok',
    service: 'Code Mafia 2D Dreadnought Server',
    message: '🟢 Socket.IO Server is online and ready! Connect your game client.',
    version: '2.0.0-hackathon'
  });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// =============================================================================
// 6 EXPANDED REAL-WORLD ENGINEERING DEBUGGING TERMINALS (3600 x 2700 MAP)
// =============================================================================
function createInitialTerminals() {
  return [
    {
      id: 'terminal-1',
      name: 'Terminal 1 // Navigation Warp Calibration',
      roomName: 'Command Bridge (Sector 1 - North)',
      x: 1800,
      y: 400,
      solved: false,
      sabotaged: false,
      functionName: 'calculateJumpDistance',
      description: 'Calibrate the warp jump engine. Return the warp jump distance by multiplying the energy charge (energy) by the engine velocity (velocity).',
      starterCode: `function calculateJumpDistance(energy, velocity) {\n  // FIX: Change subtraction (-) to multiplication (*)\n  return energy - velocity;\n}`,
      code: `function calculateJumpDistance(energy, velocity) {\n  // FIX: Change subtraction (-) to multiplication (*)\n  return energy - velocity;\n}`,
      tests: [
        { input: [10, 5], expected: 50 },
        { input: [4, 8], expected: 32 },
        { input: [7, 0], expected: 0 }
      ]
    },
    {
      id: 'terminal-2',
      name: 'Terminal 2 // Reactor Coolant Safety Check',
      roomName: 'AI & Quantum Mainframe (Sector 2 - North-West)',
      x: 650,
      y: 500,
      solved: false,
      sabotaged: false,
      functionName: 'isTemperatureSafe',
      description: 'Verify if the reactor coolant temperature is within safe operating limits. Return true if temperature is between minTemp and maxTemp (inclusive), otherwise return false.',
      starterCode: `function isTemperatureSafe(temperature, minTemp, maxTemp) {\n  // FIX: Return true only if temperature >= minTemp && temperature <= maxTemp\n  return temperature > maxTemp;\n}`,
      code: `function isTemperatureSafe(temperature, minTemp, maxTemp) {\n  // FIX: Return true only if temperature >= minTemp && temperature <= maxTemp\n  return temperature > maxTemp;\n}`,
      tests: [
        { input: [75, 50, 100], expected: true },
        { input: [120, 50, 100], expected: false },
        { input: [30, 50, 100], expected: false },
        { input: [50, 50, 100], expected: true }
      ]
    },
    {
      id: 'terminal-3',
      name: 'Terminal 3 // Distress Beacon Broadcaster',
      roomName: 'Communications & Sensor Array (Sector 3 - North-East)',
      x: 2950,
      y: 500,
      solved: false,
      sabotaged: false,
      functionName: 'formatDistressSignal',
      description: 'Format the emergency distress signal into capital letters so all allied fleet ships can decode the transmission.',
      starterCode: `function formatDistressSignal(signal) {\n  // FIX: Convert signal string to uppercase with .toUpperCase()\n  return signal.toLowerCase();\n}`,
      code: `function formatDistressSignal(signal) {\n  // FIX: Convert signal string to uppercase with .toUpperCase()\n  return signal.toLowerCase();\n}`,
      tests: [
        { input: ['sos skeld'], expected: 'SOS SKELD' },
        { input: ['infiltrator detected'], expected: 'INFILTRATOR DETECTED' },
        { input: ['reactor ok'], expected: 'REACTOR OK' }
      ]
    },
    {
      id: 'terminal-4',
      name: 'Terminal 4 // Security Airlock Passcode',
      roomName: 'Security & Surveillance Vault (Sector 4 - West)',
      x: 550,
      y: 1450,
      solved: false,
      sabotaged: false,
      functionName: 'validateAirlockCode',
      description: 'Validate the security airlock keycode. Return true if code length is at least 4 characters AND code does not equal "sabotage".',
      starterCode: `function validateAirlockCode(code) {\n  // FIX: Return true if code.length >= 4 and code !== 'sabotage'\n  return code.length > 20;\n}`,
      code: `function validateAirlockCode(code) {\n  // FIX: Return true if code.length >= 4 and code !== 'sabotage'\n  return code.length > 20;\n}`,
      tests: [
        { input: ['skeld99'], expected: true },
        { input: ['key'], expected: false },
        { input: ['sabotage'], expected: false },
        { input: ['vault_open'], expected: true }
      ]
    },
    {
      id: 'terminal-5',
      name: 'Terminal 5 // MedBay Sample Purifier',
      roomName: 'Cybernetics & Bio-Lab (Sector 5 - East)',
      x: 3050,
      y: 1450,
      solved: false,
      sabotaged: false,
      functionName: 'countCleanSamples',
      description: 'Filter test samples in the centrifuge. Return the total count of samples in the array that equal "clean".',
      starterCode: `function countCleanSamples(samples) {\n  // FIX: Change 'infected' to 'clean' to count sterile test tubes\n  return samples.filter(s => s === 'infected').length;\n}`,
      code: `function countCleanSamples(samples) {\n  // FIX: Change 'infected' to 'clean' to count sterile test tubes\n  return samples.filter(s => s === 'infected').length;\n}`,
      tests: [
        { input: [['clean', 'infected', 'clean']], expected: 2 },
        { input: [['infected', 'infected']], expected: 0 },
        { input: [['clean', 'clean', 'clean']], expected: 3 }
      ]
    },
    {
      id: 'terminal-6',
      name: 'Terminal 6 // Shield Power Energy Diverter',
      roomName: 'Quantum Hyper-Reactor Core (Sector 6 - South)',
      x: 1800,
      y: 2250,
      solved: false,
      sabotaged: false,
      functionName: 'sumShieldEnergy',
      description: 'Calculate total energy diverted to emergency shields by summing all numerical values in the powerCells array.',
      starterCode: `function sumShieldEnergy(powerCells) {\n  // FIX: Change subtraction (-) to addition (+) to sum all power cells\n  return powerCells.reduce((total, cell) => total - cell, 0);\n}`,
      code: `function sumShieldEnergy(powerCells) {\n  // FIX: Change subtraction (-) to addition (+) to sum all power cells\n  return powerCells.reduce((total, cell) => total - cell, 0);\n}`,
      tests: [
        { input: [[10, 20, 30]], expected: 60 },
        { input: [[15, 25]], expected: 40 },
        { input: [[100]], expected: 100 }
      ]
    }
  ];
}

const PLAYER_COLORS = [
  '#ef4444', // Crimson Red
  '#3b82f6', // Cobalt Blue
  '#10b981', // Emerald Matrix
  '#f59e0b', // Solar Amber
  '#f97316', // Hyper Orange
  '#8b5cf6', // Void Purple
  '#ec4899', // Neon Pink
  '#06b6d4', // Quantum Cyan
  '#e2e8f0', // Arctic White
  '#64748b'  // Stealth Slate
];

// Room state storage: roomId -> room
const rooms = new Map();

// =============================================================================
// SANDBOXED VM CODE EXECUTION
// =============================================================================
function evaluateTerminalInSandbox(terminal, userCode) {
  let passedCount = 0;
  const testLogs = [];

  terminal.tests.forEach((test, idx) => {
    try {
      const sandbox = { console: { log: () => {}, error: () => {} } };
      vm.createContext(sandbox);
      vm.runInContext(userCode, sandbox, { timeout: 1000 });

      if (typeof sandbox[terminal.functionName] !== 'function') {
        throw new Error(`Function '${terminal.functionName}' is not defined.`);
      }

      const inputCopy = JSON.parse(JSON.stringify(test.input));
      const result = sandbox[terminal.functionName](...inputCopy);
      const isMatch = JSON.stringify(result) === JSON.stringify(test.expected);

      if (isMatch) {
        passedCount++;
        testLogs.push({
          testNumber: idx + 1,
          passed: true,
          input: JSON.stringify(test.input),
          expected: JSON.stringify(test.expected),
          output: JSON.stringify(result)
        });
      } else {
        testLogs.push({
          testNumber: idx + 1,
          passed: false,
          input: JSON.stringify(test.input),
          expected: JSON.stringify(test.expected),
          output: JSON.stringify(result)
        });
      }
    } catch (err) {
      testLogs.push({
        testNumber: idx + 1,
        passed: false,
        input: JSON.stringify(test.input),
        expected: JSON.stringify(test.expected),
        error: err.message
      });
    }
  });

  return {
    passedCount,
    total: terminal.tests.length,
    isSolved: passedCount === terminal.tests.length,
    logs: testLogs
  };
}

// =============================================================================
// DYNAMIC IMPOSTER SCALING ENGINE
// =============================================================================
function calculateImposterCount(playerCount, customSetting) {
  const maxAllowed = Math.max(1, Math.floor((playerCount - 1) / 2));

  if (customSetting && customSetting !== 'auto') {
    const parsed = parseInt(customSetting, 10);
    if (!isNaN(parsed) && parsed >= 1) {
      return Math.min(parsed, maxAllowed);
    }
  }

  if (playerCount <= 3) return 1;
  if (playerCount <= 6) return Math.min(2, maxAllowed);
  return Math.min(3, maxAllowed);
}

// =============================================================================
// ROOM STATE BROADCASTER (ROLE-MASKED)
// =============================================================================
function broadcastRoomState(roomId) {
  const room = rooms.get(roomId);
  if (!room) return;

  const solvedCount = room.terminals.filter((t) => t.solved).length;
  const totalTerminals = room.terminals.length;

  room.players.forEach((targetPlayer) => {
    const isTargetMafia = targetPlayer.role === 'MAFIA' && room.phase !== 'LOBBY';

    const maskedPlayers = room.players.map((p) => {
      const isSelf = p.id === targetPlayer.id;
      const revealRole =
        room.phase === 'GAME_OVER' ||
        isSelf ||
        (isTargetMafia && p.role === 'MAFIA');

      return {
        id: p.id,
        username: p.username,
        color: p.color,
        visorColor: p.visorColor || '#06b6d4',
        operativeTitle: p.operativeTitle || 'Systems Engineer',
        characterId: p.characterId || 'ironman',
        x: p.x,
        y: p.y,
        isMoving: p.isMoving,
        facingLeft: p.facingLeft,
        isAlive: p.isAlive,
        role: revealRole ? p.role : 'UNKNOWN',
        votedFor: p.votedFor ? (room.phase === 'VOTING' ? 'VOTED' : p.votedFor) : null
      };
    });

    const fellowMafia = isTargetMafia
      ? room.players.filter((p) => p.role === 'MAFIA').map((p) => p.username)
      : [];

    io.to(targetPlayer.id).emit('room_update', {
      roomId: room.id,
      hostId: room.hostId,
      isHost: room.hostId === targetPlayer.id,
      phase: room.phase,
      timer: room.timer,
      playerSpeed: room.playerSpeed || 2.4,
      myRole: room.phase === 'LOBBY' ? 'PENDING' : targetPlayer.role,
      fellowMafia,
      players: maskedPlayers,
      terminals: room.terminals.map((t) => ({
        id: t.id,
        name: t.name,
        roomName: t.roomName,
        x: t.x,
        y: t.y,
        solved: t.solved,
        sabotaged: t.sabotaged,
        functionName: t.functionName,
        description: t.description,
        starterCode: t.starterCode,
        testsCount: t.tests.length
      })),
      solvedCount,
      totalTerminals,
      imposterSetting: room.imposterSetting || 'auto',
      calculatedImposters: calculateImposterCount(room.players.length, room.imposterSetting),
      chatMessages: room.chatMessages.slice(-40),
      lastEjection: room.lastEjection,
      gameWinner: room.gameWinner,
      winReason: room.winReason,
      emergencyCaller: room.emergencyCaller
    });
  });
}

// =============================================================================
// WIN CONDITION EVALUATION
// =============================================================================
function checkWinConditions(roomId) {
  const room = rooms.get(roomId);
  if (!room || room.phase === 'GAME_OVER' || room.phase === 'LOBBY') return false;

  const alivePlayers = room.players.filter((p) => p.isAlive);
  const aliveMafia = alivePlayers.filter((p) => p.role === 'MAFIA');
  const aliveDevs = alivePlayers.filter((p) => p.role === 'DEV');
  const allTerminalsSolved = room.terminals.every((t) => t.solved);

  if (allTerminalsSolved) {
    room.phase = 'GAME_OVER';
    room.gameWinner = 'DEVELOPERS';
    room.winReason = 'All 6 spaceship dreadnought subsystems stabilized! The ship jumped to safety.';
    if (room.timerInterval) clearInterval(room.timerInterval);
    broadcastRoomState(roomId);
    return true;
  }

  if (aliveMafia.length === 0) {
    room.phase = 'GAME_OVER';
    room.gameWinner = 'DEVELOPERS';
    room.winReason = 'All Cyber Infiltrators have been identified and ejected into deep space!';
    if (room.timerInterval) clearInterval(room.timerInterval);
    broadcastRoomState(roomId);
    return true;
  }

  if (aliveMafia.length >= aliveDevs.length) {
    room.phase = 'GAME_OVER';
    room.gameWinner = 'MAFIA';
    room.winReason = 'The Infiltrators reached parity and sabotaged primary life support!';
    if (room.timerInterval) clearInterval(room.timerInterval);
    broadcastRoomState(roomId);
    return true;
  }

  return false;
}

// =============================================================================
// PHASE TIMERS & TRANSITIONS
// =============================================================================
function startPhaseTimer(roomId, phaseName, durationSeconds) {
  const room = rooms.get(roomId);
  if (!room) return;

  if (room.timerInterval) {
    clearInterval(room.timerInterval);
    room.timerInterval = null;
  }

  room.phase = phaseName;
  room.timer = durationSeconds;
  broadcastRoomState(roomId);

  room.timerInterval = setInterval(() => {
    const currentRoom = rooms.get(roomId);
    if (!currentRoom || currentRoom.phase !== phaseName) {
      clearInterval(this);
      return;
    }

    currentRoom.timer -= 1;
    io.to(roomId).emit('timer_tick', { timer: currentRoom.timer, phase: phaseName });

    if (currentRoom.timer <= 0) {
      clearInterval(currentRoom.timerInterval);
      currentRoom.timerInterval = null;
      handlePhaseTimeout(roomId, phaseName);
    }
  }, 1000);
}

function handlePhaseTimeout(roomId, expiredPhase) {
  const room = rooms.get(roomId);
  if (!room || room.phase === 'GAME_OVER') return;

  if (expiredPhase === 'DAY') {
    startPhaseTimer(roomId, 'NIGHT', 30);
  } else if (expiredPhase === 'NIGHT') {
    room.emergencyCaller = 'Automated Power Grid Alarms';
    room.players.forEach((p) => { p.votedFor = null; });
    startPhaseTimer(roomId, 'VOTING', 35);
  } else if (expiredPhase === 'VOTING') {
    resolveVotingPhase(roomId);
  }
}

function resolveVotingPhase(roomId) {
  const room = rooms.get(roomId);
  if (!room) return;

  const voteCounts = {};
  let skipVotes = 0;

  room.players.forEach((p) => {
    if (p.isAlive && p.votedFor) {
      if (p.votedFor === 'SKIP') {
        skipVotes++;
      } else {
        voteCounts[p.votedFor] = (voteCounts[p.votedFor] || 0) + 1;
      }
    }
  });

  let maxVotes = 0;
  let ejectedId = null;
  let isTie = false;

  for (const [suspectId, count] of Object.entries(voteCounts)) {
    if (count > maxVotes) {
      maxVotes = count;
      ejectedId = suspectId;
      isTie = false;
    } else if (count === maxVotes) {
      isTie = true;
    }
  }

  if (isTie || skipVotes >= maxVotes || maxVotes === 0 || !ejectedId) {
    room.lastEjection = {
      ejected: false,
      message: 'Tie or skipped vote: No operative was ejected into deep space.'
    };
  } else {
    const ejectedPlayer = room.players.find((p) => p.id === ejectedId);
    if (ejectedPlayer) {
      ejectedPlayer.isAlive = false;
      const wasMafia = ejectedPlayer.role === 'MAFIA';
      room.lastEjection = {
        ejected: true,
        username: ejectedPlayer.username,
        color: ejectedPlayer.color,
        characterId: ejectedPlayer.characterId || 'ironman',
        x: ejectedPlayer.x,
        y: ejectedPlayer.y,
        wasMafia,
        message: `${ejectedPlayer.username} was ejected. They were ${wasMafia ? 'an INFILTRATOR (MAFIA)!' : 'an innocent CREW DEVELOPER!'}`
      };
    }
  }

  broadcastRoomState(roomId);

  if (!checkWinConditions(roomId)) {
    setTimeout(() => {
      startPhaseTimer(roomId, 'DAY', 600); // 10 minutes (600s) code sprint
    }, 5000);
  }
}

// =============================================================================
// SOCKET.IO EVENT HANDLERS
// =============================================================================
io.on('connection', (socket) => {
  console.log(`[Socket Connected] ID: ${socket.id}`);

  // 1. Join Room & Spawn in Central Assembly Bay (Lobby)
  socket.on('join_room', ({ roomId, username, color, visorColor, operativeTitle, characterId }) => {
    if (!roomId || !roomId.trim()) return;
    const cleanRoom = roomId.trim();
    const cleanName = (username && username.trim()) || `Operative_${socket.id.substring(0, 4)}`;

    socket.join(cleanRoom);

    if (!rooms.has(cleanRoom)) {
      rooms.set(cleanRoom, {
        id: cleanRoom,
        hostId: socket.id,
        phase: 'LOBBY',
        timer: 600, // 10 minutes (600s)
        timerInterval: null,
        imposterSetting: 'auto',
        playerSpeed: 2.4,
        players: [],
        terminals: createInitialTerminals(),
        chatMessages: [],
        lastEjection: null,
        gameWinner: null,
        winReason: null,
        emergencyCaller: null
      });
    }

    const room = rooms.get(cleanRoom);
    let player = room.players.find((p) => p.id === socket.id);

    const selectedColor = color || PLAYER_COLORS[room.players.length % PLAYER_COLORS.length];

    if (!player) {
      const spawnOffset = (room.players.length * 45) % 220;
      player = {
        id: socket.id,
        username: cleanName,
        color: selectedColor,
        visorColor: visorColor || '#06b6d4',
        operativeTitle: operativeTitle || 'Systems Engineer',
        characterId: characterId || 'ironman',
        x: 1720 + (spawnOffset % 160),
        y: 1320 + ((spawnOffset * 2) % 120),
        isMoving: false,
        facingLeft: false,
        role: 'DEV',
        isAlive: true,
        votedFor: null
      };
      room.players.push(player);
    } else {
      player.username = cleanName;
      player.color = selectedColor;
      if (visorColor) player.visorColor = visorColor;
      if (operativeTitle) player.operativeTitle = operativeTitle;
    }

    if (room.phase === 'LOBBY') {
      if (room.players.length >= 3) {
        if (!room.launchCountdownTimeout) {
          room.chatMessages.push({
            id: Date.now().toString(),
            sender: 'DREADNOUGHT AI',
            text: `⚠️ 3 OPERATIVES LOGGED IN (${room.players.length}/3)! Redirecting squad to main battle map in 3 seconds...`,
            system: true
          });
          broadcastRoomState(cleanRoom);

          room.launchCountdownTimeout = setTimeout(() => {
            const currentRoom = rooms.get(cleanRoom);
            if (currentRoom && currentRoom.phase === 'LOBBY' && currentRoom.players.length >= 3) {
              launchGameMission(cleanRoom);
            }
          }, 3000);
        }
      } else {
        room.chatMessages.push({
          id: Date.now().toString(),
          sender: 'DREADNOUGHT AI',
          text: `Operative ${player.username} logged into lobby (${room.players.length}/3 players needed to deploy to main map).`,
          system: true
        });
      }
    }

    broadcastRoomState(cleanRoom);
  });

  // 2. Real-Time Wardrobe / Appearance Customization
  socket.on('update_appearance', ({ roomId, color, visorColor, operativeTitle, characterId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const player = room.players.find((p) => p.id === socket.id);
    if (!player) return;

    if (color) player.color = color;
    if (visorColor) player.visorColor = visorColor;
    if (operativeTitle) player.operativeTitle = operativeTitle;
    if (characterId) player.characterId = characterId;

    broadcastRoomState(roomId);
  });

  // 3. Host Updates Game Settings
  socket.on('set_game_settings', ({ roomId, imposterSetting, playerSpeed }) => {
    const room = rooms.get(roomId);
    if (!room || room.hostId !== socket.id) return;

    if (imposterSetting && room.phase === 'LOBBY') {
      room.imposterSetting = imposterSetting;
    }

    if (playerSpeed !== undefined && playerSpeed !== null) {
      const num = parseFloat(playerSpeed);
      if (!isNaN(num) && num >= 1.0 && num <= 6.0) {
        room.playerSpeed = Math.round(num * 10) / 10;
      }
    }

    broadcastRoomState(roomId);
  });

  function launchGameMission(roomId) {
    const room = rooms.get(roomId);
    if (!room) return;
    if (room.players.length < 3) return;

    if (room.launchCountdownTimeout) {
      clearTimeout(room.launchCountdownTimeout);
      room.launchCountdownTimeout = null;
    }

    room.terminals = createInitialTerminals();
    room.gameWinner = null;
    room.winReason = null;
    room.lastEjection = null;
    room.emergencyCaller = null;

    const imposterCount = calculateImposterCount(room.players.length, room.imposterSetting);
    const shuffled = [...room.players].sort(() => 0.5 - Math.random());

    const sectorSpawns = [
      { x: 1800, y: 550 },
      { x: 650, y: 650 },
      { x: 2950, y: 650 },
      { x: 550, y: 1350 },
      { x: 3050, y: 1350 },
      { x: 1800, y: 2100 },
      { x: 1800, y: 1200 },
      { x: 1800, y: 1550 }
    ];

    room.players.forEach((p, index) => {
      p.role = 'DEV';
      p.isAlive = true;
      p.votedFor = null;
      const sp = sectorSpawns[index % sectorSpawns.length];
      p.x = sp.x;
      p.y = sp.y;
      p.isMoving = false;
      p.facingLeft = false;
    });

    for (let i = 0; i < imposterCount; i++) {
      shuffled[i].role = 'MAFIA';
    }

    room.chatMessages.push({
      sender: 'DREADNOUGHT AI',
      text: `🚀 3 OPERATIVES CONFIRMED! All players have been redirected from the lobby to the main Dreadnought map!`,
      system: true
    });

    startPhaseTimer(roomId, 'DAY', 600); // 10 minutes (600s) code sprint

    io.to(roomId).emit('mission_redirect', {
      message: '3 Operatives confirmed! You have been redirected to the main Dreadnought map.',
      phase: 'DAY'
    });
  }

  // 4. Start Game
  socket.on('start_game', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room || room.hostId !== socket.id) return;
    if (room.players.length < 3) {
      socket.emit('error_message', `The game stays in the lobby until at least 3 players log in. Currently logged in: ${room.players.length}/3.`);
      return;
    }

    launchGameMission(roomId);
  });

  // 5. Player Movement
  socket.on('player_move', ({ roomId, x, y, isMoving, facingLeft }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    if (room.phase !== 'LOBBY' && room.phase !== 'DAY' && room.phase !== 'NIGHT') return;

    const player = room.players.find((p) => p.id === socket.id);
    if (!player || (!player.isAlive && room.phase !== 'LOBBY')) return;

    player.x = x;
    player.y = y;
    player.isMoving = isMoving;
    player.facingLeft = facingLeft;

    socket.to(roomId).emit('player_moved', {
      id: socket.id,
      x,
      y,
      isMoving,
      facingLeft
    });
  });

  // 6. Run Terminal Tests
  socket.on('run_terminal_tests', ({ roomId, terminalId, userCode }) => {
    const room = rooms.get(roomId);
    if (!room || (room.phase !== 'DAY' && room.phase !== 'NIGHT')) return;

    const player = room.players.find((p) => p.id === socket.id);
    if (!player || !player.isAlive) return;

    const terminal = room.terminals.find((t) => t.id === terminalId);
    if (!terminal) return;

    terminal.code = userCode;
    const results = evaluateTerminalInSandbox(terminal, userCode);

    if (results.isSolved) {
      terminal.solved = true;
      terminal.sabotaged = false;
      room.chatMessages.push({
        id: Date.now().toString(),
        sender: 'SHIP-AI',
        text: `[SYSTEM] ${terminal.name} has been stabilized by ${player.username}!`,
        system: true
      });
      checkWinConditions(roomId);
    }

    socket.emit('terminal_test_results', {
      terminalId,
      ...results
    });

    broadcastRoomState(roomId);
  });

  // 7. Imposter Sabotage
  socket.on('sabotage_terminal', ({ roomId, terminalId }) => {
    const room = rooms.get(roomId);
    if (!room || room.phase !== 'NIGHT') return;

    const player = room.players.find((p) => p.id === socket.id);
    if (!player || !player.isAlive || player.role !== 'MAFIA') return;

    const terminal = room.terminals.find((t) => t.id === terminalId);
    if (!terminal) return;

    terminal.solved = false;
    terminal.sabotaged = true;

    room.chatMessages.push({
      id: Date.now().toString(),
      sender: 'SHIP-AI',
      text: `[WARNING] ${terminal.name} is experiencing electromagnetic interference!`,
      system: true
    });

    broadcastRoomState(roomId);
  });

  // 8. Emergency Standup Lockdown Call
  socket.on('call_emergency', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room || room.phase !== 'DAY') return;

    const player = room.players.find((p) => p.id === socket.id);
    if (!player || !player.isAlive) return;

    room.emergencyCaller = player.username;
    room.players.forEach((p) => { p.votedFor = null; });

    room.chatMessages.push({
      id: Date.now().toString(),
      sender: 'SHIP-AI',
      text: `🚨 EMERGENCY STANDUP TRIGGERED by ${player.username}! All operatives report to Central Lockdown deck.`,
      system: true
    });

    startPhaseTimer(roomId, 'VOTING', 35);
  });

  // 9. Debate Chat
  socket.on('send_chat', ({ roomId, message }) => {
    const room = rooms.get(roomId);
    if (!room || !message || !message.trim()) return;

    const player = room.players.find((p) => p.id === socket.id);
    if (!player) return;

    room.chatMessages.push({
      id: Date.now().toString(),
      sender: player.username,
      color: player.color,
      text: message.trim(),
      system: false
    });

    io.to(roomId).emit('chat_message', {
      sender: player.username,
      color: player.color,
      text: message.trim()
    });
  });

  // 10. Cast Ballot in Voting
  socket.on('cast_vote', ({ roomId, suspectId }) => {
    const room = rooms.get(roomId);
    if (!room || room.phase !== 'VOTING') return;

    const player = room.players.find((p) => p.id === socket.id);
    if (!player || !player.isAlive || player.votedFor) return;

    player.votedFor = suspectId;
    broadcastRoomState(roomId);

    const alivePlayers = room.players.filter((p) => p.isAlive);
    const allVoted = alivePlayers.every((p) => p.votedFor !== null);
    if (allVoted) {
      if (room.timerInterval) clearInterval(room.timerInterval);
      resolveVotingPhase(roomId);
    }
  });

  // 11. Disconnect
  socket.on('disconnect', () => {
    console.log(`[Socket Disconnected] ID: ${socket.id}`);
    rooms.forEach((room, rId) => {
      const idx = room.players.findIndex((p) => p.id === socket.id);
      if (idx !== -1) {
        room.players.splice(idx, 1);
        if (room.hostId === socket.id && room.players.length > 0) {
          room.hostId = room.players[0].id;
        }
        if (room.players.length === 0) {
          if (room.timerInterval) clearInterval(room.timerInterval);
          if (room.launchCountdownTimeout) clearTimeout(room.launchCountdownTimeout);
          rooms.delete(rId);
        } else {
          if (room.phase === 'LOBBY' && room.players.length < 3 && room.launchCountdownTimeout) {
            clearTimeout(room.launchCountdownTimeout);
            room.launchCountdownTimeout = null;
            room.chatMessages.push({
              id: Date.now().toString(),
              sender: 'DREADNOUGHT AI',
              text: `⚠️ An operative disconnected. Game will stay in lobby until 3 players log in (${room.players.length}/3).`,
              system: true
            });
          }
          checkWinConditions(rId);
          broadcastRoomState(rId);
        }
      }
    });
  });
});

const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`🚀 Code Mafia Dreadnought Server listening on port ${PORT}`);
  });
}

module.exports = app;

