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

  // 1. Join Airlock & Waiting Deck with Avengers Characters
  console.log('\n🧪 [Test 1] Joining Spaceship Waiting Deck with Avengers Heroes...');
  await new Promise((resolve) => {
    const checkRoster = (data) => {
      if (data.players && data.players.length === 4) {
        p4.off('room_update', checkRoster);
        console.log(`✓ 4 Avengers heroes in waiting deck: ${data.players.map(p => `${p.username} (${p.characterId})`).join(', ')}`);
        console.log(`✓ Default room movement speed: ${data.playerSpeed}x`);
        console.log(`✓ Calculated Imposters for 4 players: ${data.calculatedImposters}`);
        if (!data.players.every(p => p.characterId)) {
          throw new Error('Some players missing characterId!');
        }
        resolve();
      }
    };
    p4.on('room_update', checkRoster);

    p1.emit('join_room', { roomId, username: 'Iron_Man', characterId: 'ironman', color: '#dc2626', visorColor: '#38bdf8', operativeTitle: 'Genius Engineer' });
    setTimeout(() => p2.emit('join_room', { roomId, username: 'Cap_Rogers', characterId: 'cap', color: '#2563eb', visorColor: '#ffffff', operativeTitle: 'Tactical Vanguard' }), 50);
    setTimeout(() => p3.emit('join_room', { roomId, username: 'Thor_Odinson', characterId: 'thor', color: '#38bdf8', visorColor: '#facc15', operativeTitle: 'High-Voltage Specialist' }), 100);
    setTimeout(() => p4.emit('join_room', { roomId, username: 'Bruce_Hulk', characterId: 'hulk', color: '#16a34a', visorColor: '#4ade80', operativeTitle: 'Gamma Specialist' }), 150);
  });

  // 2. Test Admin Speed Calibration
  console.log('\n🧪 [Test 2] Host calibrating Operative Movement Speed to 3.2x...');
  await new Promise((resolve) => {
    const onSpeedUpdate = (data) => {
      if (data.playerSpeed === 3.2) {
        p3.off('room_update', onSpeedUpdate);
        console.log(`✓ Admin speed successfully synced to all operatives: playerSpeed = ${data.playerSpeed}x`);
        resolve();
      }
    };
    p3.on('room_update', onSpeedUpdate);

    // Host p1 sets speed to 3.2
    p1.emit('set_game_settings', {
      roomId,
      imposterSetting: 'auto',
      playerSpeed: 3.2
    });
  });

  // 3. Test Wardrobe Appearance Customization in Lobby (Hero switch to Spider-Man)
  console.log('\n🧪 [Test 3] Testing real-time Wardrobe Customization (Switching hero to Spider-Man)...');
  await new Promise((resolve) => {
    const onUpdate = (data) => {
      const updatedP2 = data.players.find(p => p.id === p2.id);
      if (updatedP2 && updatedP2.characterId === 'spiderman') {
        p1.off('room_update', onUpdate);
        console.log(`✓ Player 2 hero switch broadcasted to all: Hero=${updatedP2.characterId}, Title=${updatedP2.operativeTitle}`);
        resolve();
      }
    };
    p1.on('room_update', onUpdate);

    p2.emit('update_appearance', {
      roomId,
      characterId: 'spiderman',
      color: '#dc2626',
      visorColor: '#ffffff',
      operativeTitle: 'Web-Slinging Infiltrator'
    });
  });

  // 3. Test Lobby Movement Synchronization
  console.log('\n🧪 [Test 3] Testing 2D movement sync inside Waiting Deck...');
  await new Promise((resolve) => {
    p3.once('player_moved', (data) => {
      if (data.id === p1.id) {
        console.log(`✓ Player 3 received Player 1 lobby movement: x=${data.x}, y=${data.y}, moving=${data.isMoving}`);
        resolve();
      }
    });

    p1.emit('player_move', {
      roomId,
      x: 1050, // Walking up to Wardrobe Pod
      y: 750,
      isMoving: true,
      facingLeft: false
    });
  });

  // 4. Host Launches Spaceship Mission
  console.log('\n🧪 [Test 4] Host initiating Spaceship Mission (Day Sprint 90s)...');
  await new Promise((resolve) => {
    const onDayPhase = (data) => {
      if (data.phase === 'DAY') {
        p2.off('room_update', onDayPhase);
        console.log(`✓ Mission launched! Phase: ${data.phase}, Total Terminals: ${data.totalTerminals}, Timer: ${data.timer}s`);
        resolve();
      }
    };
    p2.on('room_update', onDayPhase);

    p1.emit('start_game', { roomId });
  });

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
