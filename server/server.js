const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const vm = require('vm');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Code Mafia 2D Spaceship Server', timestamp: new Date().toISOString() });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// INITIAL TERMINAL CHALLENGES
function createInitialTerminals() {
  return [
    {
      id: 'terminal-a',
      name: 'Terminal A // Array Deduplication',
      roomName: 'Server Room (North)',
      x: 600,
      y: 140,
      solved: false,
      sabotaged: false,
      functionName: 'deduplicateAndSort',
      description: 'The telemetry log contains redundant packets. Write deduplicateAndSort(arr) to return a new array of numbers with duplicates removed, sorted in ascending numerical order.',
      starterCode: `function deduplicateAndSort(arr) {\n  // BUG: Mutates original array and fails on numerical order\n  return arr.sort();\n}`,
      code: `function deduplicateAndSort(arr) {\n  // BUG: Mutates original array and fails on numerical order\n  return arr.sort();\n}`,
      tests: [
        { input: [[3, 1, 2, 3, 2]], expected: [1, 2, 3] },
        { input: [[10, 5, 10, 20, 1]], expected: [1, 5, 10, 20] },
        { input: [[42]], expected: [42] },
        { input: [[-5, 2, -5, 0, 10, -2]], expected: [-5, -2, 0, 2, 10] }
      ]
    },
    {
      id: 'terminal-b',
      name: 'Terminal B // Arithmetic Bug',
      roomName: 'Algorithm Lab (East)',
      x: 960,
      y: 450,
      solved: false,
      sabotaged: false,
      functionName: 'calculateSubsystemSum',
      description: 'The reactor power balancing formula is malfunctioning. Write calculateSubsystemSum(a, b) to return the exact mathematical sum of numbers a and b.',
      starterCode: `function calculateSubsystemSum(a, b) {\n  // BUG: Subtracts instead of adding\n  return a - b;\n}`,
      code: `function calculateSubsystemSum(a, b) {\n  // BUG: Subtracts instead of adding\n  return a - b;\n}`,
      tests: [
        { input: [12, 18], expected: 30 },
        { input: [-5, 5], expected: 0 },
        { input: [100, 250], expected: 350 },
        { input: [0, 0], expected: 0 },
        { input: [-40, -10], expected: -50 }
      ]
    },
    {
      id: 'terminal-c',
      name: 'Terminal C // Palindrome Validator',
      roomName: 'Security Vault (West)',
      x: 240,
      y: 450,
      solved: false,
      sabotaged: false,
      functionName: 'validatePassphrase',
      description: 'The security vault airlock requires a palindrome passphrase. Write validatePassphrase(str) to return true if str is a palindrome (ignoring casing, spaces, and non-alphanumeric chars), false otherwise.',
      starterCode: `function validatePassphrase(str) {\n  // BUG: Flawed length comparison\n  return str.length > 3;\n}`,
      code: `function validatePassphrase(str) {\n  // BUG: Flawed length comparison\n  return str.length > 3;\n}`,
      tests: [
        { input: ['racecar'], expected: true },
        { input: ['hello world'], expected: false },
        { input: ['A man, a plan, a canal: Panama'], expected: true },
        { input: ['Madam'], expected: true },
        { input: ['12321'], expected: true },
        { input: ['CodeBreach'], expected: false }
      ]
    }
  ];
}

const PLAYER_COLORS = [
  '#ef4444', // Red
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Yellow
  '#f97316', // Orange
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4'  // Cyan
];

// Room state storage: roomId -> room
const rooms = new Map();

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
          index: idx + 1,
          passed: true,
          input: test.input,
          expected: test.expected,
          received: result
        });
      } else {
        testLogs.push({
          index: idx + 1,
          passed: false,
          input: test.input,
          expected: test.expected,
          received: result
        });
      }
    } catch (err) {
      testLogs.push({
        index: idx + 1,
        passed: false,
        input: test.input,
        expected: test.expected,
        received: null,
        error: err.message
      });
    }
  });

  const isSolved = passedCount === terminal.tests.length;
  return { isSolved, passedCount, total: terminal.tests.length, testLogs };
}

function broadcastRoomState(roomId) {
  const room = rooms.get(roomId);
  if (!room) return;

  const solvedCount = room.terminals.filter((t) => t.solved).length;

  room.players.forEach((player) => {
    const isMafia = player.role === 'MAFIA';
    let fellowMafia = [];
    if (isMafia) {
      fellowMafia = room.players.filter((p) => p.role === 'MAFIA').map((p) => p.username);
    }

    // Sanitize players: only reveal true role if game over, or dead, or fellow mafia
    const sanitizedPlayers = room.players.map((p) => {
      const showRole = room.phase === 'GAME_OVER' || !p.isAlive || p.id === player.id || (isMafia && p.role === 'MAFIA');
      return {
        id: p.id,
        username: p.username,
        color: p.color,
        x: p.x,
        y: p.y,
        isMoving: p.isMoving,
        facingLeft: p.facingLeft,
        isAlive: p.isAlive,
        isHost: p.id === room.hostId,
        votedFor: room.phase === 'VOTING' ? (p.votedFor ? 'VOTED' : null) : p.votedFor,
        role: showRole ? p.role : 'UNKNOWN'
      };
    });

    io.to(player.id).emit('room_update', {
      roomId: room.id,
      phase: room.phase,
      timer: room.timer,
      hostId: room.hostId,
      isHost: player.id === room.hostId,
      myRole: player.role,
      fellowMafia,
      players: sanitizedPlayers,
      terminals: room.terminals.map((t) => ({
        id: t.id,
        name: t.name,
        roomName: t.roomName,
        x: t.x,
        y: t.y,
        solved: t.solved,
        sabotaged: t.sabotaged,
        description: t.description,
        functionName: t.functionName,
        code: t.code,
        totalTests: t.tests.length
      })),
      solvedCount,
      totalTerminals: room.terminals.length,
      chatMessages: room.chatMessages,
      lastEjection: room.lastEjection,
      gameWinner: room.gameWinner,
      winReason: room.winReason,
      emergencyCaller: room.emergencyCaller
    });
  });
}

function checkWinConditions(roomId) {
  const room = rooms.get(roomId);
  if (!room || room.phase === 'GAME_OVER') return false;

  const alivePlayers = room.players.filter((p) => p.isAlive);
  const aliveMafia = alivePlayers.filter((p) => p.role === 'MAFIA');
  const aliveDevs = alivePlayers.filter((p) => p.role === 'DEV');
  const allTerminalsSolved = room.terminals.every((t) => t.solved);

  // Condition 1: All 3 terminals fixed -> Developers win!
  if (allTerminalsSolved) {
    room.phase = 'GAME_OVER';
    room.gameWinner = 'DEVELOPERS';
    room.winReason = 'All 3 ship terminals stabilized! System 100% operational.';
    if (room.timerInterval) clearInterval(room.timerInterval);
    broadcastRoomState(roomId);
    return true;
  }

  // Condition 2: All Mafia members ejected -> Developers win!
  if (aliveMafia.length === 0) {
    room.phase = 'GAME_OVER';
    room.gameWinner = 'DEVELOPERS';
    room.winReason = 'All Mafia infiltrators have been expelled from the spaceship!';
    if (room.timerInterval) clearInterval(room.timerInterval);
    broadcastRoomState(roomId);
    return true;
  }

  // Condition 3: Mafia reaches parity or majority -> Mafia wins!
  if (aliveMafia.length >= aliveDevs.length) {
    room.phase = 'GAME_OVER';
    room.gameWinner = 'MAFIA';
    room.winReason = 'The Mafia reached parity and overwhelmed the remaining crew!';
    if (room.timerInterval) clearInterval(room.timerInterval);
    broadcastRoomState(roomId);
    return true;
  }

  return false;
}

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
    // Transition from DAY (90s) -> NIGHT (30s)
    startPhaseTimer(roomId, 'NIGHT', 30);
  } else if (expiredPhase === 'NIGHT') {
    // Transition from NIGHT (30s) -> VOTING (35s)
    room.emergencyCaller = 'Station Power Grid';
    room.players.forEach((p) => { p.votedFor = null; });
    startPhaseTimer(roomId, 'VOTING', 35);
  } else if (expiredPhase === 'VOTING') {
    // Voting timeout -> Tally votes
    tallyVotesAndConclude(roomId);
  }
}

function tallyVotesAndConclude(roomId) {
  const room = rooms.get(roomId);
  if (!room || room.phase !== 'VOTING') return;

  if (room.timerInterval) clearInterval(room.timerInterval);

  const voteCounts = {};
  let skipCount = 0;

  room.players.forEach((p) => {
    if (p.isAlive && p.votedFor) {
      if (p.votedFor === 'SKIP') {
        skipCount++;
      } else {
        voteCounts[p.votedFor] = (voteCounts[p.votedFor] || 0) + 1;
      }
    }
  });

  let maxVotes = 0;
  let topCandidate = null;
  let isTie = false;

  for (const [candidateId, count] of Object.entries(voteCounts)) {
    if (count > maxVotes) {
      maxVotes = count;
      topCandidate = candidateId;
      isTie = false;
    } else if (count === maxVotes) {
      isTie = true;
    }
  }

  let ejectionResult = null;

  if (skipCount >= maxVotes || isTie || !topCandidate) {
    ejectionResult = {
      wasEjected: false,
      reason: skipCount >= maxVotes ? 'The crew voted to skip ejection.' : 'The vote resulted in a tie. No one was ejected.'
    };
  } else {
    const suspect = room.players.find((p) => p.id === topCandidate);
    if (suspect && suspect.isAlive) {
      suspect.isAlive = false;
      const isMafia = suspect.role === 'MAFIA';
      ejectionResult = {
        wasEjected: true,
        username: suspect.username,
        role: suspect.role,
        isMafia,
        reason: `${suspect.username} was ejected into deep space.`
      };
    }
  }

  room.lastEjection = ejectionResult;
  const isGameOver = checkWinConditions(roomId);
  broadcastRoomState(roomId);

  if (!isGameOver) {
    // 5-second dramatic reveal before resuming Day phase
    setTimeout(() => {
      const freshRoom = rooms.get(roomId);
      if (!freshRoom || freshRoom.phase === 'GAME_OVER') return;

      freshRoom.emergencyCaller = null;
      freshRoom.players.forEach((p) => { p.votedFor = null; });
      startPhaseTimer(roomId, 'DAY', 90);
    }, 5000);
  }
}

io.on('connection', (socket) => {
  console.log(`[Socket Connected] ID: ${socket.id}`);

  // 1. Join Room
  socket.on('join_room', ({ roomId, username, color }) => {
    if (!roomId || !roomId.trim()) return;
    const cleanRoom = roomId.trim();
    const cleanName = (username && username.trim()) || `Astronaut_${socket.id.substring(0, 4)}`;

    socket.join(cleanRoom);

    if (!rooms.has(cleanRoom)) {
      rooms.set(cleanRoom, {
        id: cleanRoom,
        hostId: socket.id,
        phase: 'LOBBY',
        timer: 90,
        timerInterval: null,
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

    // Pick color
    const selectedColor = color || PLAYER_COLORS[room.players.length % PLAYER_COLORS.length];

    if (!player) {
      // Spawn in Cafeteria center
      const spawnOffset = (room.players.length * 40) % 160;
      player = {
        id: socket.id,
        username: cleanName,
        color: selectedColor,
        x: 560 + spawnOffset,
        y: 440 + (spawnOffset % 50),
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
    }

    broadcastRoomState(cleanRoom);
  });

  // 2. Start Game
  socket.on('start_game', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room || room.hostId !== socket.id) return;
    if (room.players.length < 2) {
      socket.emit('error_message', 'Need at least 2 players to start Code Mafia.');
      return;
    }

    // Reset Terminals
    room.terminals = createInitialTerminals();
    room.gameWinner = null;
    room.winReason = null;
    room.lastEjection = null;
    room.emergencyCaller = null;
    room.chatMessages = [];

    // Assign Roles: 1 Mafia per 3 players (at least 1)
    const mafiaCount = Math.max(1, Math.floor(room.players.length / 3));
    const shuffled = [...room.players].sort(() => 0.5 - Math.random());

    room.players.forEach((p, index) => {
      p.role = 'DEV';
      p.isAlive = true;
      p.votedFor = null;
      // Spawn in Cafeteria
      p.x = 540 + (index * 35);
      p.y = 440 + ((index % 2) * 40);
      p.isMoving = false;
      p.facingLeft = false;
    });

    for (let i = 0; i < mafiaCount; i++) {
      shuffled[i].role = 'MAFIA';
    }

    // Start in DAY phase (90s)
    startPhaseTimer(roomId, 'DAY', 90);
  });

  // 3. Player Movement (High Frequency)
  socket.on('player_move', ({ roomId, x, y, isMoving, facingLeft }) => {
    const room = rooms.get(roomId);
    if (!room || (room.phase !== 'DAY' && room.phase !== 'NIGHT')) return;

    const player = room.players.find((p) => p.id === socket.id);
    if (!player || !player.isAlive) return;

    player.x = x;
    player.y = y;
    player.isMoving = isMoving;
    player.facingLeft = facingLeft;

    // Broadcast to other players in room
    socket.to(roomId).emit('player_moved', {
      id: socket.id,
      x,
      y,
      isMoving,
      facingLeft
    });
  });

  // 4. Run Terminal Tests
  socket.on('run_terminal_tests', ({ roomId, terminalId, userCode }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const player = room.players.find((p) => p.id === socket.id);
    if (!player || !player.isAlive) return;

    const terminal = room.terminals.find((t) => t.id === terminalId);
    if (!terminal) return;

    terminal.code = userCode;
    const evalResult = evaluateTerminalInSandbox(terminal, userCode);

    if (evalResult.isSolved) {
      terminal.solved = true;
      terminal.sabotaged = false;
    }

    socket.emit('terminal_test_results', {
      terminalId,
      isSolved: evalResult.isSolved,
      passedCount: evalResult.passedCount,
      total: evalResult.total,
      testLogs: evalResult.testLogs
    });

    // Check if developers achieved win condition
    const isWon = checkWinConditions(roomId);
    if (!isWon) {
      broadcastRoomState(roomId);
    }
  });

  // 5. Sabotage Terminal (Mafia only during Night phase)
  socket.on('sabotage_terminal', ({ roomId, terminalId }) => {
    const room = rooms.get(roomId);
    if (!room || room.phase !== 'NIGHT') return;

    const player = room.players.find((p) => p.id === socket.id);
    if (!player || !player.isAlive || player.role !== 'MAFIA') return;

    const terminal = room.terminals.find((t) => t.id === terminalId);
    if (!terminal) return;

    // Revert solved status and inject a bug
    terminal.solved = false;
    terminal.sabotaged = true;
    terminal.code = terminal.starterCode + '\n// [SYSTEM FAULT: INJECTED SYNTAX MALFUNCTION]';

    io.to(roomId).emit('terminal_sabotaged', {
      terminalId,
      terminalName: terminal.name
    });

    broadcastRoomState(roomId);
  });

  // 6. Call Emergency Standup (Cafeteria button)
  socket.on('call_emergency', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room || (room.phase !== 'DAY' && room.phase !== 'NIGHT')) return;

    const player = room.players.find((p) => p.id === socket.id);
    if (!player || !player.isAlive) return;

    room.emergencyCaller = player.username;
    room.players.forEach((p) => { p.votedFor = null; });

    startPhaseTimer(roomId, 'VOTING', 35);
  });

  // 7. Cast Vote
  socket.on('cast_vote', ({ roomId, suspectId }) => {
    const room = rooms.get(roomId);
    if (!room || room.phase !== 'VOTING') return;

    const voter = room.players.find((p) => p.id === socket.id);
    if (!voter || !voter.isAlive || voter.votedFor) return;

    voter.votedFor = suspectId;

    // Check if all alive players voted
    const alivePlayers = room.players.filter((p) => p.isAlive);
    const allVoted = alivePlayers.every((p) => p.votedFor !== null);

    if (allVoted) {
      tallyVotesAndConclude(roomId);
    } else {
      broadcastRoomState(roomId);
    }
  });

  // 8. Meeting Chat
  socket.on('send_chat', ({ roomId, message }) => {
    const room = rooms.get(roomId);
    if (!room || !message || !message.trim()) return;

    const player = room.players.find((p) => p.id === socket.id);
    if (!player) return;

    const chatItem = {
      id: Math.random(),
      sender: player.username,
      color: player.color,
      isAlive: player.isAlive,
      text: message.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })
    };

    room.chatMessages.push(chatItem);
    if (room.chatMessages.length > 50) room.chatMessages.shift();

    io.to(roomId).emit('chat_message', chatItem);
  });

  // 9. Restart Game
  socket.on('restart_game', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room || room.hostId !== socket.id) return;

    if (room.timerInterval) clearInterval(room.timerInterval);
    room.phase = 'LOBBY';
    room.terminals = createInitialTerminals();
    room.gameWinner = null;
    room.winReason = null;
    room.lastEjection = null;
    room.emergencyCaller = null;
    room.chatMessages = [];
    room.players.forEach((p) => {
      p.isAlive = true;
      p.votedFor = null;
      p.role = 'DEV';
    });

    broadcastRoomState(roomId);
  });

  // 10. Disconnect
  socket.on('disconnect', () => {
    rooms.forEach((room, roomId) => {
      room.players = room.players.filter((p) => p.id !== socket.id);

      if (room.players.length === 0) {
        if (room.timerInterval) clearInterval(room.timerInterval);
        rooms.delete(roomId);
      } else {
        if (room.hostId === socket.id) {
          room.hostId = room.players[0].id;
        }
        if (room.phase === 'DAY' || room.phase === 'NIGHT' || room.phase === 'VOTING') {
          checkWinConditions(roomId);
        }
        broadcastRoomState(roomId);
      }
    });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`🚀 Code Mafia 2D Spaceship listening on :${PORT}`);
  console.log(`========================================`);
});