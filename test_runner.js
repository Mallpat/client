const { io } = require('../client/node_modules/socket.io-client');

async function testDreadnoughtEdition() {
  console.log('🚀 [Test] Connecting 4 Cyber Operatives to Code Mafia Dreadnought (2400x1800)...');

  const p1 = io('http://localhost:5000', { reconnection: false });
  const p2 = io('http://localhost:5000', { reconnection: false });
  const p3 = io('http://localhost:5000', { reconnection: false });
  const p4 = io('http://localhost:5000', { reconnection: false });

  await new Promise((resolve) => {
    let connected = 0;
    const check = () => {
      connected++;
      if (connected === 4) resolve();
    };
    p1.on('connect', check);
    p2.on('connect', check);
    p3.on('connect', check);
    p4.on('connect', check);
  });

  console.log('✓ All 4 operatives connected to backend socket.');

  const roomId = 'dreadnought-test-' + Date.now();

  // 1. Join Airlock & Waiting Deck with 2 Players (Must Stay in Lobby)
  console.log('\n🧪 [Test 1] 2 Players Joining Waiting Deck (Should stay in LOBBY)...');
  await new Promise((resolve) => {
    const checkRoster = (data) => {
      if (data.players && data.players.length === 2) {
        p2.off('room_update', checkRoster);
        console.log(`✓ 2 Avengers in lobby: ${data.players.map(p => `${p.username} (${p.characterId})`).join(', ')}`);
        console.log(`✓ Current phase: ${data.phase} (Must be LOBBY)`);
        if (data.phase !== 'LOBBY') {
          throw new Error('Game started prematurely before 3 players!');
        }
        resolve();
      }
    };
    p2.on('room_update', checkRoster);

    p1.emit('join_room', { roomId, username: 'Iron_Man', characterId: 'ironman', color: '#dc2626', visorColor: '#38bdf8', operativeTitle: 'Genius Engineer' });
    setTimeout(() => p2.emit('join_room', { roomId, username: 'Cap_Rogers', characterId: 'cap', color: '#2563eb', visorColor: '#ffffff', operativeTitle: 'Tactical Vanguard' }), 50);
  });

  // 2. Test Host start blocked with fewer than 3 players
  console.log('\n🧪 [Test 2] Host attempting to launch with only 2 players (Must be rejected)...');
  await new Promise((resolve) => {
    p1.once('error_message', (msg) => {
      console.log(`✓ Server correctly rejected early launch: "${msg}"`);
      resolve();
    });
    p1.emit('start_game', { roomId });
  });

  // 3. Test Admin Speed Calibration in Lobby
  console.log('\n🧪 [Test 3] Host calibrating Operative Movement Speed to 3.2x...');
  await new Promise((resolve) => {
    const onSpeedUpdate = (data) => {
      if (data.playerSpeed === 3.2) {
        p2.off('room_update', onSpeedUpdate);
        console.log(`✓ Admin speed successfully synced to all operatives: playerSpeed = ${data.playerSpeed}x`);
        resolve();
      }
    };
    p2.on('room_update', onSpeedUpdate);

    // Host p1 sets speed to 3.2
    p1.emit('set_game_settings', {
      roomId,
      imposterSetting: 'auto',
      playerSpeed: 3.2
    });
  });

  // 4. 3rd Player Joins -> Triggers Redirection to Main Battle Map!
  console.log('\n🧪 [Test 4] 3rd Player Joining Lobby -> Auto-deploying squad to main map...');
  await new Promise((resolve) => {
    const onDayPhase = (data) => {
      if (data.phase === 'DAY') {
        p3.off('room_update', onDayPhase);
        console.log(`✓ 3rd Player joined! Successfully redirected to main map! Phase: ${data.phase}, Timer: ${data.timer}s`);
        console.log(`✓ Operative Spawns: ${data.players.map(p => `${p.username} at (${p.x}, ${p.y})`).join(', ')}`);
        resolve();
      }
    };
    p3.on('room_update', onDayPhase);

    // 3rd player joins
    p3.emit('join_room', { roomId, username: 'Thor_Odinson', characterId: 'thor', color: '#38bdf8', visorColor: '#facc15', operativeTitle: 'High-Voltage Specialist' });
  });

  // 5. 4th Player joins active mission
  p4.emit('join_room', { roomId, username: 'Bruce_Hulk', characterId: 'hulk', color: '#16a34a', visorColor: '#4ade80', operativeTitle: 'Gamma Specialist' });

  // 5. Test Terminal 1 (Hyperspace Matrix Rotation in Command Bridge)
  console.log('\n🧪 [Test 5] Running sandboxed tests on Terminal 1 (Command Bridge)...');
  await new Promise((resolve) => {
    p1.once('terminal_test_results', (res) => {
      console.log(`✓ Terminal 1 evaluation: solved=${res.isSolved}, passed=${res.passedCount}/${res.total}`);
      if (res.isSolved) {
        console.log('✓ Hyperspace Matrix rotated successfully!');
        resolve();
      }
    });

    const fixedCode = `
      function rotateMatrix90(matrix) {
        const n = matrix.length;
        const result = Array.from({ length: n }, () => Array(n).fill(0));
        for (let r = 0; r < n; r++) {
          for (let c = 0; c < n; c++) {
            result[c][n - 1 - r] = matrix[r][c];
          }
        }
        return result;
      }
    `;

    p1.emit('run_terminal_tests', {
      roomId,
      terminalId: 'terminal-1',
      userCode: fixedCode
    });
  });

  // 6. Test Terminal 4 (Cryptographic Checksum Validator in Security Vault)
  console.log('\n🧪 [Test 6] Running sandboxed tests on Terminal 4 (Security Vault)...');
  await new Promise((resolve) => {
    p2.once('terminal_test_results', (res) => {
      console.log(`✓ Terminal 4 evaluation: solved=${res.isSolved}, passed=${res.passedCount}/${res.total}`);
      if (res.isSolved) {
        console.log('✓ Security Checksum validated successfully!');
        resolve();
      }
    });

    const fixedCode = `
      function validateSecurityChecksum(str) {
        let sum = 0;
        for (let i = 0; i < str.length; i++) {
          sum += str.charCodeAt(i);
        }
        return sum % 2 === 0;
      }
    `;

    p2.emit('run_terminal_tests', {
      roomId,
      terminalId: 'terminal-4',
      userCode: fixedCode
    });
  });

  console.log('\n🎉 ALL HACKATHON DREADNOUGHT MULTIPLAYER TESTS PASSED 100%!');
  p1.disconnect();
  p2.disconnect();
  p3.disconnect();
  p4.disconnect();
  process.exit(0);
}

testDreadnoughtEdition().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
