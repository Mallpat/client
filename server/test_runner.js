const { io } = require('../client/node_modules/socket.io-client');

async function test2DCodeMafia() {
  console.log('🧪 [Test] Connecting 2 astronauts to Code Mafia 2D Spaceship...');

  const p1 = io('http://localhost:5000', { reconnection: false });
  const p2 = io('http://localhost:5000', { reconnection: false });

  await new Promise((resolve) => {
    let connected = 0;
    const check = () => {
      connected++;
      if (connected === 2) resolve();
    };
    p1.on('connect', check);
    p2.on('connect', check);
  });

  console.log('✓ Both astronauts connected.');

  const roomId = 'test-ship-101';

  // 1. Join Room
  console.log('\n🧪 [Test] Joining spaceship airlock...');
  await new Promise((resolve) => {
    let updates = 0;
    p2.on('room_update', (data) => {
      updates++;
      if (data.players.length === 2) {
        console.log(`✓ Both players in lobby: ${data.players.map(p => `${p.username} (${p.color})`).join(', ')}`);
        resolve();
      }
    });

    p1.emit('join_room', { roomId, username: 'Crew_Red', color: '#ef4444' });
    p2.emit('join_room', { roomId, username: 'Crew_Blue', color: '#3b82f6' });
  });

  // 2. Start Game (Host is p1)
  console.log('\n🧪 [Test] Host launching mission (Day Phase 90s)...');
  await new Promise((resolve) => {
    let starts = 0;
    const onStart = (data) => {
      if (data.phase === 'DAY') {
        starts++;
        if (starts === 2) {
          console.log(`✓ Mission started! Phase: ${data.phase}, Terminals: ${data.terminals.length}, Timer: ${data.timer}s`);
          resolve();
        }
      }
    };
    p1.once('room_update', onStart);
    p2.once('room_update', onStart);

    p1.emit('start_game', { roomId });
  });

  // 3. Movement Sync Test
  console.log('\n🧪 [Test] Testing astronaut 2D movement sync...');
  await new Promise((resolve) => {
    p2.once('player_moved', (data) => {
      console.log(`✓ Player 2 received player_moved: x=${data.x}, y=${data.y}, isMoving=${data.isMoving}`);
      resolve();
    });

    p1.emit('player_move', {
      roomId,
      x: 640,
      y: 470,
      isMoving: true,
      facingLeft: false
    });
  });

  // 4. Test Terminal Execution (Terminal B: Arithmetic Bug)
  console.log('\n🧪 [Test] Running tests on Terminal B (Algorithm Lab)...');
  await new Promise((resolve) => {
    p1.once('terminal_test_results', (results) => {
      console.log(`✓ Terminal B evaluation: isSolved=${results.isSolved}, passed=${results.passedCount}/${results.total}`);
      if (results.isSolved) {
        console.log('✓ Terminal B successfully stabilized!');
        resolve();
      }
    });

    p1.emit('run_terminal_tests', {
      roomId,
      terminalId: 'terminal-b',
      userCode: 'function calculateSubsystemSum(a, b) { return a + b; }'
    });
  });

  // 5. Emergency Standup Call
  console.log('\n🧪 [Test] Player calling Emergency Standup from Cafeteria button...');
  await new Promise((resolve) => {
    let votingCount = 0;
    const checkVoting = (data) => {
      if (data.phase === 'VOTING') {
        votingCount++;
        if (votingCount === 2) {
          console.log(`✓ Emergency Standup triggered! Phase: ${data.phase}, Caller: ${data.emergencyCaller}`);
          resolve();
        }
      }
    };
    p1.once('room_update', checkVoting);
    p2.once('room_update', checkVoting);

    p2.emit('call_emergency', { roomId });
  });

  // 6. Standup Chat & Voting
  console.log('\n🧪 [Test] Testing Standup Discussion & Ballots...');
  await new Promise((resolve) => {
    p1.once('chat_message', (chat) => {
      console.log(`✓ Chat message received: [${chat.sender}] ${chat.text}`);
      resolve();
    });

    p2.emit('send_chat', { roomId, message: 'I saw Red in the Server Room right before the alarms sounded!' });
  });

  // Cast Votes
  console.log('\n🧪 [Test] Casting ballots against Crew_Blue...');
  await new Promise((resolve) => {
    p1.once('room_update', (data) => {
      if (data.lastEjection || data.phase === 'GAME_OVER') {
        console.log(`✓ Ballots resolved! Result: ${JSON.stringify(data.lastEjection)}`);
        resolve();
      }
    });

    p1.emit('cast_vote', { roomId, suspectId: p2.id });
    p2.emit('cast_vote', { roomId, suspectId: p2.id });
  });

  console.log('\n🎉 ALL 2D CODE MAFIA INTEGRATION TESTS COMPLETED SUCCESSFULLY!');
  p1.disconnect();
  p2.disconnect();
  process.exit(0);
}

test2DCodeMafia().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
