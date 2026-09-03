import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { io } from 'socket.io-client';
import {
  Terminal,
  Zap,
  Play,
  Clock,
  Trophy,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
  LogOut,
  Cpu,
  Layers,
  Dices,
  Flame,
  Shield,
  Skull,
  Send,
  MessageSquare,
  Users,
  Radio,
  Crown,
  Eye,
  X,
  Volume2
} from 'lucide-react';

const getInitialServerUrl = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('code_mafia_server_url');
    if (saved) return saved;
    if (import.meta.env.VITE_SERVER_URL) return import.meta.env.VITE_SERVER_URL;
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
  }
  return import.meta.env.VITE_SERVER_URL || '';
};

const SERVER_URL = getInitialServerUrl();
const socket = io(SERVER_URL || 'http://localhost:5000', {
  autoConnect: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000
});

const PLAYER_COLORS = [
  { name: 'Red', hex: '#ef4444' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Green', hex: '#10b981' },
  { name: 'Yellow', hex: '#f59e0b' },
  { name: 'Orange', hex: '#f97316' },
  { name: 'Purple', hex: '#8b5cf6' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Cyan', hex: '#06b6d4' }
];

const RANDOM_NAMES = [
  'Crew_Red',
  'Crew_Blue',
  'Astro_Green',
  'Astro_Cyan',
  'Pilot_Gold',
  'Eng_Purple',
  'Cadet_Orange',
  'Nova_Pink'
];

export default function App() {
  // Connection & Room state
  const [connected, setConnected] = useState(socket.connected);
  const [inRoom, setInRoom] = useState(false);
  const [roomId, setRoomId] = useState('spaceship-01');
  const [username, setUsername] = useState(() => {
    return RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
  });
  const [selectedColor, setSelectedColor] = useState(PLAYER_COLORS[0].hex);
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [serverUrlInput, setServerUrlInput] = useState(SERVER_URL || '');

  // Authoritative State from Server
  const [phase, setPhase] = useState('LOBBY'); // 'LOBBY' | 'DAY' | 'NIGHT' | 'VOTING' | 'GAME_OVER'
  const [timer, setTimer] = useState(90);
  const [hostId, setHostId] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [myRole, setMyRole] = useState('DEV'); // 'DEV' | 'MAFIA'
  const [fellowMafia, setFellowMafia] = useState([]);
  const [players, setPlayers] = useState([]);
  const [terminals, setTerminals] = useState([]);
  const [solvedCount, setSolvedCount] = useState(0);
  const [totalTerminals, setTotalTerminals] = useState(3);
  const [chatMessages, setChatMessages] = useState([]);
  const [lastEjection, setLastEjection] = useState(null);
  const [gameWinner, setGameWinner] = useState(null);
  const [winReason, setWinReason] = useState(null);
  const [emergencyCaller, setEmergencyCaller] = useState(null);

  // Local Player & Canvas state
  const [localPos, setLocalPos] = useState({ x: 600, y: 450 });
  const [activeTerminal, setActiveTerminal] = useState(null); // terminal opened in IDE modal
  const [terminalCode, setTerminalCode] = useState('');
  const [testResults, setTestResults] = useState(null);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [votedSuspect, setVotedSuspect] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [copiedRoom, setCopiedRoom] = useState(false);
  const [nearbyAction, setNearbyAction] = useState(null); // { type: 'terminal' | 'emergency', id: string, name: string }

  const canvasRef = useRef(null);
  const keysPressed = useRef({});
  const walkCycleRef = useRef(0);
  const facingLeftRef = useRef(false);
  const playersRef = useRef([]);
  const chatBottomRef = useRef(null);
  const lastMoveEmitTime = useRef(0);

  // Sync players ref for high-speed canvas render loop
  useEffect(() => {
    playersRef.current = players;
  }, [players]);

  // Socket event listeners
  useEffect(() => {
    function onConnect() {
      setConnected(true);
    }
    function onDisconnect() {
      setConnected(false);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    socket.on('room_update', (data) => {
      setPhase(data.phase);
      setTimer(data.timer);
      setHostId(data.hostId);
      setIsHost(data.isHost);
      setMyRole(data.myRole || 'DEV');
      setFellowMafia(data.fellowMafia || []);
      setPlayers(data.players || []);
      setTerminals(data.terminals || []);
      setSolvedCount(data.solvedCount || 0);
      setTotalTerminals(data.totalTerminals || 3);
      setChatMessages(data.chatMessages || []);
      setLastEjection(data.lastEjection);
      setGameWinner(data.gameWinner);
      setWinReason(data.winReason);
      setEmergencyCaller(data.emergencyCaller);

      // Sync local player position if game just started or spawned
      const me = (data.players || []).find((p) => p.id === socket.id);
      if (me && (data.phase === 'DAY' || data.phase === 'LOBBY')) {
        // If local position is uninitialized or at spawn
        if (Math.abs(localPos.x - 600) < 5 && Math.abs(localPos.y - 450) < 5) {
          setLocalPos({ x: me.x, y: me.y });
        }
      }

      // Close terminal modal if phase transitioned to VOTING or GAME_OVER
      if (data.phase === 'VOTING' || data.phase === 'GAME_OVER') {
        setActiveTerminal(null);
      }

      if (data.phase !== 'VOTING') {
        setVotedSuspect(null);
      }
    });

    socket.on('timer_tick', ({ timer: updatedTimer }) => {
      setTimer(updatedTimer);
    });

    socket.on('player_moved', ({ id, x, y, isMoving, facingLeft }) => {
      setPlayers((prev) =>
        prev.map((p) => (p.id === id ? { ...p, x, y, isMoving, facingLeft } : p))
      );
    });

    socket.on('terminal_test_results', (results) => {
      setIsRunningTests(false);
      setTestResults(results);
    });

    socket.on('chat_message', (chatItem) => {
      setChatMessages((prev) => [...prev, chatItem]);
    });

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('room_update');
      socket.off('timer_tick');
      socket.off('player_moved');
      socket.off('terminal_test_results');
      socket.off('chat_message');
    };
  }, [localPos.x, localPos.y]);

  // Auto scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Handle Keyboard Movement Inputs (WASD / Arrows / E / Q)
  useEffect(() => {
    function onKeyDown(e) {
      // Don't intercept inputs if user is typing in chat or Monaco editor
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || document.activeElement?.closest('.monaco-editor')) {
        return;
      }

      keysPressed.current[e.key.toLowerCase()] = true;

      // [E] Key - Interact with nearest Terminal or Emergency Button
      if (e.key.toLowerCase() === 'e') {
        handleInteract();
      }

      // [Q] Key - Sabotage nearest Terminal (Mafia only during Night)
      if (e.key.toLowerCase() === 'q') {
        handleSabotage();
      }

      // Escape - Close Terminal Modal
      if (e.key === 'Escape') {
        setActiveTerminal(null);
      }
    }

    function onKeyUp(e) {
      keysPressed.current[e.key.toLowerCase()] = false;
    }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [nearbyAction, activeTerminal, myRole, phase, inRoom, terminals]);

  // Movement & Interaction check tick
  useEffect(() => {
    if (!inRoom || (phase !== 'DAY' && phase !== 'NIGHT') || activeTerminal) return;

    const interval = setInterval(() => {
      const keys = keysPressed.current;
      let dx = 0;
      let dy = 0;
      const speed = 4.2;

      if (keys['w'] || keys['arrowup']) dy -= speed;
      if (keys['s'] || keys['arrowdown']) dy += speed;
      if (keys['a'] || keys['arrowleft']) {
        dx -= speed;
        facingLeftRef.current = true;
      }
      if (keys['d'] || keys['arrowright']) {
        dx += speed;
        facingLeftRef.current = false;
      }

      const isMoving = dx !== 0 || dy !== 0;
      if (isMoving) {
        walkCycleRef.current += 0.25;

        // Diagonal normalization
        if (dx !== 0 && dy !== 0) {
          dx *= 0.7071;
          dy *= 0.7071;
        }

        // Apply spaceship wall bounds: Map width 1200, height 900
        const newX = Math.max(90, Math.min(1110, localPos.x + dx));
        const newY = Math.max(80, Math.min(820, localPos.y + dy));

        setLocalPos({ x: newX, y: newY });

        // Throttle movement network broadcast (approx 30fps)
        const now = Date.now();
        if (now - lastMoveEmitTime.current > 33) {
          lastMoveEmitTime.current = now;
          socket.emit('player_move', {
            roomId,
            x: newX,
            y: newY,
            isMoving: true,
            facingLeft: facingLeftRef.current
          });
        }
      } else {
        const now = Date.now();
        if (now - lastMoveEmitTime.current > 150) {
          lastMoveEmitTime.current = now;
          socket.emit('player_move', {
            roomId,
            x: localPos.x,
            y: localPos.y,
            isMoving: false,
            facingLeft: facingLeftRef.current
          });
        }
      }

      // Check distance to interactive elements
      // 1. Terminals
      let detectedAction = null;
      terminals.forEach((term) => {
        const dist = Math.hypot(term.x - localPos.x, term.y - localPos.y);
        if (dist <= 65) {
          detectedAction = {
            type: 'terminal',
            id: term.id,
            name: term.name,
            solved: term.solved
          };
        }
      });

      // 2. Emergency Console (Cafeteria center: 600, 450)
      const emergencyDist = Math.hypot(600 - localPos.x, 450 - localPos.y);
      if (emergencyDist <= 65) {
        detectedAction = {
          type: 'emergency',
          id: 'cafeteria-emergency',
          name: 'Emergency Standup Button'
        };
      }

      setNearbyAction(detectedAction);
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [inRoom, phase, localPos, activeTerminal, roomId, terminals]);

  // Main 2D Canvas Procedural Rendering Engine
  useEffect(() => {
    if (!inRoom || (phase !== 'DAY' && phase !== 'NIGHT')) return;

    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const viewportW = 900;
    const viewportH = 600;
    const mapW = 1200;
    const mapH = 900;

    function renderFrame() {
      // 1. Calculate Camera offset following local player
      const cameraX = Math.max(0, Math.min(mapW - viewportW, localPos.x - viewportW / 2));
      const cameraY = Math.max(0, Math.min(mapH - viewportH, localPos.y - viewportH / 2));

      ctx.save();
      // Clear viewport
      ctx.fillStyle = '#05070e';
      ctx.fillRect(0, 0, viewportW, viewportH);

      // Translate by camera
      ctx.translate(-cameraX, -cameraY);

      // ====================================================
      // PROCEDURAL MAP DRAWING: ROOMS & HALLWAYS
      // ====================================================

      // Deep space border with stars
      ctx.fillStyle = '#03050a';
      ctx.fillRect(0, 0, mapW, mapH);

      // Draw starry background dots
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let s = 10; s < mapW; s += 90) {
        for (let t = 15; t < mapH; t += 85) {
          ctx.fillRect((s * 13) % mapW, (t * 17) % mapH, 1.5, 1.5);
        }
      }

      // Hallway Floors
      ctx.fillStyle = '#111827';
      // North Hallway (Cafeteria to Server Room)
      ctx.fillRect(550, 200, 100, 160);
      // East Hallway (Cafeteria to Lab)
      ctx.fillRect(720, 410, 140, 80);
      // West Hallway (Cafeteria to Security)
      ctx.fillRect(340, 410, 140, 80);

      // Hallway Hazard Chevrons (Yellow/Black)
      ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
      ctx.fillRect(560, 260, 80, 8);
      ctx.fillRect(560, 290, 80, 8);
      ctx.fillRect(750, 420, 8, 60);
      ctx.fillRect(790, 420, 8, 60);
      ctx.fillRect(370, 420, 8, 60);
      ctx.fillRect(410, 420, 8, 60);

      // Room 1: Server Room (North: x 450 to 750, y 60 to 220)
      ctx.fillStyle = '#091e3a';
      ctx.strokeStyle = '#1e3a8a';
      ctx.lineWidth = 4;
      ctx.fillRect(450, 60, 300, 160);
      ctx.strokeRect(450, 60, 300, 160);

      // Room 1 Details: Server Racks on wall with blinking LEDs
      for (let rx = 470; rx < 730; rx += 50) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(rx, 65, 38, 28);
        ctx.fillStyle = (Date.now() + rx) % 1000 > 500 ? '#10b981' : '#38bdf8';
        ctx.fillRect(rx + 6, 72, 5, 4);
        ctx.fillStyle = (Date.now() + rx * 2) % 800 > 400 ? '#ef4444' : '#10b981';
        ctx.fillRect(rx + 16, 72, 5, 4);
      }

      // Room 2: Algorithm Lab (East: x 820 to 1130, y 320 to 580)
      ctx.fillStyle = '#0c1a2e';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 4;
      ctx.fillRect(820, 320, 310, 260);
      ctx.strokeRect(820, 320, 310, 260);

      // Room 2 Details: Glowing holographic lab consoles
      ctx.fillStyle = '#034561';
      ctx.fillRect(1040, 360, 70, 45);
      ctx.fillRect(1040, 490, 70, 45);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.fillRect(1045, 365, 60, 35);
      ctx.fillRect(1045, 495, 60, 35);

      // Room 3: Security Vault (West: x 70 to 380, y 320 to 580)
      ctx.fillStyle = '#1e1e24';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 4;
      ctx.fillRect(70, 320, 310, 260);
      ctx.strokeRect(70, 320, 310, 260);

      // Room 3 Details: Surveillance monitors
      ctx.fillStyle = '#090d16';
      ctx.fillRect(85, 350, 40, 180);
      ctx.fillStyle = '#334155';
      ctx.fillRect(90, 370, 30, 30);
      ctx.fillRect(90, 420, 30, 30);
      ctx.fillRect(90, 470, 30, 30);

      // Central Cafeteria (Center: x 450 to 750, y 320 to 580)
      ctx.fillStyle = '#1a2333';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 4;
      ctx.fillRect(450, 320, 300, 260);
      ctx.strokeRect(450, 320, 300, 260);

      // Room Labels
      ctx.font = "bold 13px 'JetBrains Mono', monospace";
      ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.fillText('SERVER ROOM [NORTH]', 530, 90);
      ctx.fillText('ALGORITHM LAB [EAST]', 890, 350);
      ctx.fillText('SECURITY VAULT [WEST]', 140, 350);
      ctx.fillText('CENTRAL CAFETERIA', 540, 350);

      // Cafeteria Emergency Round Table & Red Dome Button
      ctx.beginPath();
      ctx.arc(600, 450, 52, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Red Emergency Button Dome
      const pulseEmergency = Math.sin(Date.now() / 250) * 4;
      ctx.beginPath();
      ctx.arc(600, 450, 18 + pulseEmergency, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(600, 450, 18, 0, Math.PI * 2);
      ctx.fillStyle = '#dc2626';
      ctx.fill();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label on table
      ctx.font = "bold 9px 'JetBrains Mono', monospace";
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('EMERGENCY', 600, 447);
      ctx.fillText('STANDUP', 600, 458);

      // ====================================================
      // DRAW TERMINALS & ACTIVATION ZONES
      // ====================================================
      terminals.forEach((term) => {
        const pulse = Math.sin(Date.now() / 300) * 3;
        const ringRadius = 55 + pulse;

        // Activation floor circle
        ctx.beginPath();
        ctx.arc(term.x, term.y, ringRadius, 0, Math.PI * 2);
        ctx.fillStyle = term.solved
          ? 'rgba(16, 185, 129, 0.15)'
          : term.sabotaged
          ? 'rgba(239, 68, 68, 0.2)'
          : 'rgba(56, 189, 248, 0.15)';
        ctx.fill();
        ctx.strokeStyle = term.solved
          ? '#10b981'
          : term.sabotaged
          ? '#ef4444'
          : '#38bdf8';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Terminal Physical Console Desk
        ctx.fillStyle = '#090d16';
        ctx.fillRect(term.x - 22, term.y - 18, 44, 36);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.strokeRect(term.x - 22, term.y - 18, 44, 36);

        // Terminal Screen Glow
        ctx.fillStyle = term.solved ? '#10b981' : term.sabotaged ? '#ef4444' : '#38bdf8';
        ctx.fillRect(term.x - 16, term.y - 14, 32, 20);

        // Status Badge floating
        ctx.font = "bold 10px 'JetBrains Mono', monospace";
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(
          term.solved ? 'STABILIZED ✓' : term.sabotaged ? 'SABOTAGED ⚠️' : 'ONLINE [E]',
          term.x,
          term.y - 28
        );
      });

      // ====================================================
      // DRAW ASTRONAUT CHARACTERS
      // ====================================================

      // Helper to draw an Among Us style vector astronaut
      function drawAstronaut(pX, pY, pColor, isMoving, isFacingLeft, pName, pIsMafia, isDead, isMe) {
        if (isDead) {
          // Deceased bone/ghost avatar
          ctx.beginPath();
          ctx.arc(pX, pY, 14, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(148, 163, 184, 0.3)';
          ctx.fill();
          ctx.font = "bold 10px 'JetBrains Mono', monospace";
          ctx.fillStyle = '#94a3b8';
          ctx.textAlign = 'center';
          ctx.fillText(`💀 ${pName}`, pX, pY - 20);
          return;
        }

        const bob = isMoving ? Math.sin(walkCycleRef.current) * 3 : 0;
        const curY = pY + bob;

        ctx.save();
        ctx.translate(pX, curY);

        // Character drop shadow
        ctx.beginPath();
        ctx.ellipse(0, 16 - bob, 14, 6, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fill();

        // Direction multiplier
        const dir = isFacingLeft ? -1 : 1;

        // 1. Oxygen Tank Backpack
        ctx.fillStyle = pColor;
        ctx.beginPath();
        ctx.roundRect(-16 * dir, -12, 8, 22, 4);
        ctx.fill();
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // 2. Main Capsule Torso & Head
        ctx.fillStyle = pColor;
        ctx.beginPath();
        ctx.roundRect(-12, -18, 24, 30, [12, 12, 6, 6]);
        ctx.fill();
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // 3. Legs
        const legOffset = isMoving ? Math.sin(walkCycleRef.current) * 4 : 0;
        // Left leg
        ctx.fillStyle = pColor;
        ctx.beginPath();
        ctx.roundRect(-10, 10, 8, 8 + legOffset, 3);
        ctx.fill();
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Right leg
        ctx.beginPath();
        ctx.roundRect(2, 10, 8, 8 - legOffset, 3);
        ctx.fill();
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 4. Glass Visor (Cyan/White reflection)
        ctx.beginPath();
        ctx.roundRect(isFacingLeft ? -14 : -2, -13, 16, 11, 6);
        ctx.fillStyle = '#67e8f9';
        ctx.fill();
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Visor White Highlight Specular
        ctx.beginPath();
        ctx.ellipse(isFacingLeft ? -8 : 4, -10, 4, 2, -0.3, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // 5. Nametag & Role Banner
        ctx.font = "bold 11px 'JetBrains Mono', monospace";
        ctx.textAlign = 'center';

        // Nametag background pill
        ctx.fillStyle = 'rgba(3, 7, 18, 0.75)';
        const tagText = `${pName}${isMe ? ' (You)' : ''}`;
        const tagWidth = ctx.measureText(tagText).width + 12;
        ctx.beginPath();
        ctx.roundRect(-tagWidth / 2, -34, tagWidth, 16, 4);
        ctx.fill();

        // Nametag Color (Red if fellow Mafia)
        if (pIsMafia) {
          ctx.fillStyle = '#f87171';
          ctx.fillText(`🔪 ${tagText}`, 0, -22);
        } else {
          ctx.fillStyle = '#f8fafc';
          ctx.fillText(tagText, 0, -22);
        }

        ctx.restore();
      }

      // Draw Remote Players
      playersRef.current.forEach((p) => {
        if (p.id !== socket.id) {
          const isTargetMafia = myRole === 'MAFIA' && p.role === 'MAFIA';
          drawAstronaut(
            p.x,
            p.y,
            p.color || '#3b82f6',
            p.isMoving,
            p.facingLeft,
            p.username,
            isTargetMafia,
            !p.isAlive,
            false
          );
        }
      });

      // Draw Local Player
      const me = playersRef.current.find((p) => p.id === socket.id);
      const isLocalMafia = myRole === 'MAFIA';
      drawAstronaut(
        localPos.x,
        localPos.y,
        me?.color || selectedColor,
        keysPressed.current['w'] || keysPressed.current['s'] || keysPressed.current['a'] || keysPressed.current['d'],
        facingLeftRef.current,
        me?.username || username,
        isLocalMafia,
        false,
        true
      );

      // ====================================================
      // NIGHT PHASE: FLASHLIGHT / FOG OF WAR
      // ====================================================
      if (phase === 'NIGHT') {
        if (myRole !== 'MAFIA') {
          // Developer Fog of War: 130px Flashlight cut-out
          ctx.save();
          // Create blackout mask covering entire map
          const darknessCanvas = document.createElement('canvas');
          darknessCanvas.width = mapW;
          darknessCanvas.height = mapH;
          const dCtx = darknessCanvas.getContext('2d');

          dCtx.fillStyle = 'rgba(3, 7, 18, 0.98)';
          dCtx.fillRect(0, 0, mapW, mapH);

          // Cut out circular beam centered on player
          dCtx.globalCompositeOperation = 'destination-out';
          const flashlightGrad = dCtx.createRadialGradient(
            localPos.x,
            localPos.y,
            30,
            localPos.x,
            localPos.y,
            135
          );
          flashlightGrad.addColorStop(0, 'rgba(0, 0, 0, 1.0)');
          flashlightGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.85)');
          flashlightGrad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');

          dCtx.fillStyle = flashlightGrad;
          dCtx.beginPath();
          dCtx.arc(localPos.x, localPos.y, 135, 0, Math.PI * 2);
          dCtx.fill();

          // Draw the darkness mask onto the main map
          ctx.drawImage(darknessCanvas, 0, 0);
          ctx.restore();
        } else {
          // Mafia Night Vision tint
          ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
          ctx.fillRect(0, 0, mapW, mapH);
        }
      }

      ctx.restore();

      animId = requestAnimationFrame(renderFrame);
    }

    animId = requestAnimationFrame(renderFrame);
    return () => cancelAnimationFrame(animId);
  }, [inRoom, phase, localPos, terminals, myRole, selectedColor, username]);

  // Handle [E] Interaction
  const handleInteract = () => {
    if (!nearbyAction) return;

    if (nearbyAction.type === 'terminal') {
      const term = terminals.find((t) => t.id === nearbyAction.id);
      if (term) {
        setActiveTerminal(term);
        setTerminalCode(term.code);
        setTestResults(null);
      }
    } else if (nearbyAction.type === 'emergency') {
      // Trigger emergency standup
      socket.emit('call_emergency', { roomId });
    }
  };

  // Handle [Q] Sabotage (Mafia only during Night)
  const handleSabotage = () => {
    if (myRole !== 'MAFIA' || phase !== 'NIGHT' || !nearbyAction || nearbyAction.type !== 'terminal') return;
    socket.emit('sabotage_terminal', { roomId, terminalId: nearbyAction.id });
  };

  // Run Terminal Tests in Sandbox
  const handleRunTerminalTests = () => {
    if (!activeTerminal || isRunningTests) return;
    setIsRunningTests(true);
    socket.emit('run_terminal_tests', {
      roomId,
      terminalId: activeTerminal.id,
      userCode: terminalCode
    });
  };

  // Start game (Host only)
  const handleStartGame = () => {
    if (!isHost || players.length < 2) return;
    socket.emit('start_game', { roomId });
  };

  // Cast Standup Vote
  const handleCastVote = (suspectId) => {
    if (phase !== 'VOTING' || votedSuspect) return;
    setVotedSuspect(suspectId);
    socket.emit('cast_vote', { roomId, suspectId });
  };

  // Send Standup Chat
  const handleSendChat = (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;
    socket.emit('send_chat', { roomId, message: chatInput.trim() });
    setChatInput('');
  };

  const handleRestartGame = () => {
    if (!isHost) return;
    socket.emit('restart_game', { roomId });
  };

  const handleLeaveRoom = () => {
    window.location.reload();
  };

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopiedRoom(true);
    setTimeout(() => setCopiedRoom(false), 2000);
  };

  // Global styled CSS rules for animations & custom scrollbars
  const inlineGlobalStyles = `
    @keyframes sirenPulse {
      0%, 100% { background-color: rgba(220, 38, 38, 0.95); box-shadow: 0 0 35px rgba(220, 38, 38, 0.8); }
      50% { background-color: rgba(127, 29, 29, 0.95); box-shadow: 0 0 15px rgba(220, 38, 38, 0.3); }
    }
    @keyframes alertStrobe {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }
    .cb-scroll::-webkit-scrollbar {
      width: 5px;
      height: 5px;
    }
    .cb-scroll::-webkit-scrollbar-track {
      background: #090d16;
    }
    .cb-scroll::-webkit-scrollbar-thumb {
      background: #1e293b;
      border-radius: 3px;
    }
    .cb-scroll::-webkit-scrollbar-thumb:hover {
      background: #334155;
    }
  `;

  // =========================================================================
  // VIEW: PRE-ROOM LOBBY SCREEN (Color Picker & Gateway)
  // =========================================================================
  if (!inRoom) {
    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          backgroundColor: '#050813',
          backgroundImage: `
            linear-gradient(to right, rgba(56, 189, 248, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(56, 189, 248, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px',
          color: '#f8fafc',
          fontFamily: "'JetBrains Mono', Consolas, monospace, sans-serif",
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          boxSizing: 'border-box',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <style>{inlineGlobalStyles}</style>

        {/* Ambient Glow */}
        <div style={{ position: 'absolute', top: '-10%', left: '15%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(239, 68, 68, 0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '15%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ textAlign: 'center', marginBottom: '24px', zIndex: 2 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '9999px',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#f87171',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              marginBottom: '14px',
              boxShadow: '0 0 15px rgba(239, 68, 68, 0.2)'
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: connected ? '#10b981' : '#ef4444' }} />
            2D TOP-DOWN MULTIPLAYER SOCIAL DEDUCTION
          </div>

          <h1 style={{ fontSize: '42px', fontWeight: 900, letterSpacing: '-1px', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <span style={{ color: '#38bdf8', textShadow: '0 0 20px rgba(56, 189, 248, 0.5)' }}>CODE</span>
            <span style={{ color: '#ef4444', textShadow: '0 0 20px rgba(239, 68, 68, 0.6)' }}>MAFIA</span>
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', maxWidth: '440px', lineHeight: '1.5' }}>
            Walk the spaceship, fix terminals in Monaco IDE, survive the 30s Night Blackout, and deduce the traitors during Emergency Standups!
          </p>
        </div>

        {/* Entry Card */}
        <div
          style={{
            width: '100%',
            maxWidth: '440px',
            backgroundColor: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(16px)',
            border: '1px solid #334155',
            borderRadius: '14px',
            padding: '28px',
            boxSizing: 'border-box',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px rgba(239, 68, 68, 0.15)',
            zIndex: 2
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '14px', marginBottom: '18px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#f8fafc', letterSpacing: '1px' }}>
              SPACESHIP AIRLOCK
            </span>
            <span style={{ fontSize: '10px', color: '#64748b' }}>CANVAS 2D ENGINE</span>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!roomId.trim() || !username.trim()) return;
              if (!connected) {
                setShowServerConfig(true);
                alert("⚠️ Cannot Board: Game Server Offline!\n\nYour game frontend is running on Vercel, but it cannot connect to the backend WebSocket server.\n\n👉 Deploy your backend to Render.com (free 2-minute setup) and paste your live Render URL into the 'Server URL' field below!");
                return;
              }
              socket.emit('join_room', { roomId: roomId.trim(), username: username.trim(), color: selectedColor });
              setInRoom(true);
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            {/* Server Connection Status Banner */}
            <div style={{
              padding: '10px 12px',
              borderRadius: '8px',
              backgroundColor: connected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.15)',
              border: connected ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              fontSize: '11px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: connected ? '#10b981' : '#f87171', fontWeight: 700 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: connected ? '#10b981' : '#ef4444' }} />
                  {connected ? 'GAME SERVER ONLINE' : 'GAME SERVER OFFLINE'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowServerConfig(!showServerConfig)}
                  style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '11px', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                >
                  {showServerConfig ? 'Close' : '⚙️ Server URL'}
                </button>
              </div>
              {!connected && !showServerConfig && (
                <div style={{ color: '#cbd5e1', fontSize: '10px', lineHeight: '1.4' }}>
                  Target: <span style={{ color: '#f87171', fontFamily: 'monospace' }}>{SERVER_URL || 'None'}</span>. Click <b style={{ color: '#38bdf8' }}>⚙️ Server URL</b> to enter your Render backend link.
                </div>
              )}
              {showServerConfig && (
                <div style={{ marginTop: '4px', display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    placeholder="https://your-server.onrender.com"
                    value={serverUrlInput}
                    onChange={(e) => setServerUrlInput(e.target.value)}
                    style={{ flex: 1, padding: '6px 8px', backgroundColor: '#090d16', border: '1px solid #334155', borderRadius: '4px', color: '#fff', fontSize: '11px', fontFamily: 'monospace' }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!serverUrlInput.trim()) return;
                      const formatted = serverUrlInput.trim().replace(/\/$/, '');
                      localStorage.setItem('code_mafia_server_url', formatted);
                      window.location.reload();
                    }}
                    style={{ padding: '6px 12px', backgroundColor: '#0284c7', border: 'none', borderRadius: '4px', color: '#fff', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Connect
                  </button>
                </div>
              )}
            </div>

            {/* Callsign */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>ASTRONAUT CALLSIGN</label>
                <button
                  type="button"
                  onClick={() => setUsername(RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)])}
                  style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
                >
                  <Dices size={12} /> Randomize
                </button>
              </div>
              <input
                type="text"
                required
                maxLength={18}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', backgroundColor: '#090d16', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '13px', fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
            </div>

            {/* Suit Color Picker */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', fontWeight: 600, marginBottom: '6px' }}>
                SUIT COLOR
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '6px' }}>
                {PLAYER_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setSelectedColor(c.hex)}
                    style={{
                      width: '100%',
                      aspectRatio: '1/1',
                      borderRadius: '6px',
                      backgroundColor: c.hex,
                      border: selectedColor === c.hex ? '3px solid #ffffff' : '2px solid #000000',
                      boxShadow: selectedColor === c.hex ? '0 0 10px #ffffff' : 'none',
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Room Frequency */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', fontWeight: 600, marginBottom: '6px' }}>
                SPACESHIP CODE
              </label>
              <input
                type="text"
                required
                maxLength={24}
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', backgroundColor: '#090d16', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '13px', fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              disabled={!roomId.trim() || !username.trim()}
              style={{
                width: '100%',
                padding: '14px',
                marginTop: '4px',
                background: connected
                  ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                  : 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                border: connected ? '1px solid #38bdf8' : '1px solid #ef4444',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 800,
                letterSpacing: '1px',
                fontFamily: 'inherit',
                cursor: (!roomId.trim() || !username.trim()) ? 'not-allowed' : 'pointer',
                boxShadow: connected ? '0 0 20px rgba(56, 189, 248, 0.4)' : '0 0 15px rgba(239, 68, 68, 0.4)'
              }}
            >
              {connected ? 'BOARD SHIP AIRLOCK ➔' : '⚠️ BACKEND OFFLINE (CLICK FOR HELP)'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: WAITING LOBBY (Host Controls & Roster)
  // =========================================================================
  if (phase === 'LOBBY') {
    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          backgroundColor: '#070a14',
          color: '#f8fafc',
          fontFamily: "'JetBrains Mono', Consolas, monospace, sans-serif",
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          boxSizing: 'border-box'
        }}
      >
        <style>{inlineGlobalStyles}</style>

        <div
          style={{
            width: '100%',
            maxWidth: '680px',
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid #334155',
            borderRadius: '16px',
            padding: '32px',
            boxSizing: 'border-box',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 35px rgba(56, 189, 248, 0.15)'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '16px', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>SPACESHIP AIRLOCK</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                <span style={{ fontSize: '20px', fontWeight: 800, color: '#38bdf8' }}>{roomId}</span>
                <button onClick={handleCopyRoomId} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}>
                  {copiedRoom ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
            <button onClick={handleLeaveRoom} style={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#94a3b8', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>
              <LogOut size={13} style={{ display: 'inline', marginRight: '4px' }} /> Exit Airlock
            </button>
          </div>

          {/* Roster */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700 }}>CREW MANIFEST ({players.length} Astronauts)</span>
              <span style={{ fontSize: '11px', color: players.length >= 2 ? '#10b981' : '#f59e0b' }}>
                {players.length >= 2 ? 'Ready to Launch' : 'Need at least 2 players to start'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
              {players.map((p) => (
                <div
                  key={p.id}
                  style={{
                    backgroundColor: p.id === socket.id ? '#0c1a30' : '#090d16',
                    border: `1px solid ${p.id === socket.id ? '#38bdf8' : '#1e293b'}`,
                    borderRadius: '8px',
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: p.color || '#3b82f6', border: '2px solid #000' }} />
                    <span style={{ fontSize: '12px', fontWeight: 600, color: p.id === socket.id ? '#38bdf8' : '#f8fafc' }}>
                      {p.username} {p.id === socket.id && '(You)'}
                    </span>
                  </div>
                  {p.id === hostId && <Crown size={14} color="#f59e0b" />}
                </div>
              ))}
            </div>
          </div>

          {/* Host Launch CTA */}
          {isHost ? (
            <button
              onClick={handleStartGame}
              disabled={players.length < 2}
              style={{
                width: '100%',
                padding: '14px',
                background: players.length >= 2 ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#334155',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 800,
                letterSpacing: '1px',
                cursor: players.length >= 2 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: players.length >= 2 ? '0 0 20px rgba(16, 185, 129, 0.4)' : 'none'
              }}
            >
              <Zap size={16} fill="currentColor" />
              LAUNCH SPACESHIP MISSION (START GAME) ➔
            </button>
          ) : (
            <div style={{ textAlign: 'center', padding: '14px', color: '#94a3b8', fontSize: '12px' }}>
              <Clock size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
              Awaiting commander to initiate mission launch...
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: ACTIVE 2D GAMEPLAY CANVAS & HUD (Day & Night Phases)
  // =========================================================================
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: '#020617',
        color: '#f8fafc',
        fontFamily: "'JetBrains Mono', Consolas, monospace, sans-serif",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <style>{inlineGlobalStyles}</style>

      {/* TOP ARENA HUD */}
      <header
        style={{
          width: '900px',
          height: '56px',
          backgroundColor: '#090d16',
          border: '1px solid #1e293b',
          borderBottom: 'none',
          borderRadius: '10px 10px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 18px',
          boxSizing: 'border-box',
          zIndex: 20
        }}
      >
        {/* Left: Role Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: myRole === 'MAFIA' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
              border: `1px solid ${myRole === 'MAFIA' ? '#ef4444' : '#10b981'}`,
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 800,
              color: myRole === 'MAFIA' ? '#f87171' : '#34d399'
            }}
          >
            {myRole === 'MAFIA' ? <Skull size={14} /> : <Shield size={14} />}
            <span>{myRole === 'MAFIA' ? 'TRAITOR: MAFIA' : 'CREW: DEVELOPER'}</span>
          </div>

          {myRole === 'MAFIA' && fellowMafia.length > 1 && (
            <span style={{ fontSize: '10px', color: '#fca5a5' }}>
              (Allies: {fellowMafia.filter((m) => m !== username).join(', ')})
            </span>
          )}
        </div>

        {/* Center: Phase & Countdown Timer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: '4px',
              backgroundColor: phase === 'NIGHT' ? '#311010' : '#082f49',
              color: phase === 'NIGHT' ? '#f87171' : '#38bdf8',
              border: `1px solid ${phase === 'NIGHT' ? '#dc2626' : '#0284c7'}`
            }}
          >
            {phase === 'NIGHT' ? '🌑 NIGHT BLACKOUT' : '☀️ DAY SPRINT'}
          </span>

          <div
            style={{
              fontSize: '13px',
              fontWeight: 800,
              color: phase === 'NIGHT' || timer <= 15 ? '#ef4444' : '#38bdf8',
              backgroundColor: '#0f172a',
              padding: '4px 10px',
              borderRadius: '6px',
              border: '1px solid #334155'
            }}
          >
            00:{timer < 10 ? `0${timer}` : timer}
          </div>
        </div>

        {/* Right: Ship Integrity Progress Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700 }}>
              SHIP INTEGRITY: {solvedCount} / {totalTerminals} FIXED
            </span>
            <div style={{ width: '130px', height: '6px', backgroundColor: '#020617', borderRadius: '3px', overflow: 'hidden', marginTop: '3px', border: '1px solid #1e293b' }}>
              <div
                style={{
                  height: '100%',
                  width: `${(solvedCount / totalTerminals) * 100}%`,
                  backgroundColor: solvedCount === totalTerminals ? '#10b981' : '#38bdf8',
                  boxShadow: solvedCount === totalTerminals ? '0 0 8px #10b981' : 'none',
                  transition: 'width 0.3s'
                }}
              />
            </div>
          </div>

          <button onClick={handleLeaveRoom} title="Exit" style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0 }}>
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* 2D CANVAS VIEWPORT (900 x 600) */}
      <div
        style={{
          width: '900px',
          height: '600px',
          position: 'relative',
          border: '2px solid #1e293b',
          borderRadius: '0 0 10px 10px',
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)'
        }}
      >
        <canvas ref={canvasRef} width={900} height={600} style={{ display: 'block' }} />

        {/* Floating Action Hint / Button inside canvas */}
        {nearbyAction && (
          <div
            style={{
              position: 'absolute',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '10px',
              zIndex: 30
            }}
          >
            {nearbyAction.type === 'terminal' && (
              <button
                onClick={handleInteract}
                style={{
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: '1px solid #38bdf8',
                  borderRadius: '8px',
                  padding: '10px 18px',
                  fontSize: '12px',
                  fontWeight: 800,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 0 20px rgba(56, 189, 248, 0.5)'
                }}
              >
                <Terminal size={16} />
                <span>USE TERMINAL [E]</span>
              </button>
            )}

            {nearbyAction.type === 'terminal' && myRole === 'MAFIA' && phase === 'NIGHT' && (
              <button
                onClick={handleSabotage}
                style={{
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: '1px solid #ef4444',
                  borderRadius: '8px',
                  padding: '10px 18px',
                  fontSize: '12px',
                  fontWeight: 800,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 0 20px rgba(239, 68, 68, 0.7)'
                }}
              >
                <Flame size={16} />
                <span>SABOTAGE TERMINAL [Q]</span>
              </button>
            )}

            {nearbyAction.type === 'emergency' && (
              <button
                onClick={handleInteract}
                style={{
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: '1px solid #ef4444',
                  borderRadius: '8px',
                  padding: '10px 18px',
                  fontSize: '12px',
                  fontWeight: 800,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 0 25px rgba(239, 68, 68, 0.8)'
                }}
              >
                <AlertTriangle size={16} />
                <span>CALL EMERGENCY STANDUP [E]</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* =========================================================================
          TERMINAL IDE MODAL (Monaco Editor & Test Specs)
          ========================================================================= */}
      {activeTerminal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(5, 7, 15, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 40,
            padding: '24px'
          }}
        >
          <div
            style={{
              width: '920px',
              height: '82vh',
              backgroundColor: '#090d16',
              border: '2px solid #0284c7',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 0 40px rgba(2, 132, 199, 0.4)',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                height: '48px',
                backgroundColor: '#0f172a',
                borderBottom: '1px solid #1e293b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 16px',
                flexShrink: 0
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Terminal size={16} color="#38bdf8" />
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc' }}>
                  {activeTerminal.name} ({activeTerminal.roomName})
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: activeTerminal.solved ? '#064e3b' : '#7f1d1d',
                    color: activeTerminal.solved ? '#34d399' : '#f87171'
                  }}
                >
                  {activeTerminal.solved ? 'STABILIZED ✓' : 'UNRESOLVED'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={handleRunTerminalTests}
                  disabled={isRunningTests}
                  style={{
                    backgroundColor: '#10b981',
                    color: '#020617',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 14px',
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: isRunningTests ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)'
                  }}
                >
                  {isRunningTests ? <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Play size={12} fill="currentColor" />}
                  <span>RUN TEST SUITE ➔</span>
                </button>

                <button onClick={() => setActiveTerminal(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body: Monaco Editor (Left) & Diagnostics (Right) */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
              <div style={{ flex: 1, borderRight: '1px solid #1e293b' }}>
                <Editor
                  height="100%"
                  theme="vs-dark"
                  defaultLanguage="javascript"
                  value={terminalCode}
                  onChange={(val) => setTerminalCode(val || '')}
                  options={{
                    fontSize: 14,
                    fontFamily: "'JetBrains Mono', Consolas, monospace",
                    minimap: { enabled: false },
                    lineNumbers: 'on',
                    automaticLayout: true,
                    padding: { top: 12, bottom: 12 }
                  }}
                />
              </div>

              {/* Right Diagnostic Specs */}
              <div style={{ width: '380px', backgroundColor: '#0b0f19', padding: '16px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 800, marginBottom: '6px' }}>
                  MISSION OBJECTIVE
                </div>
                <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.5', margin: '0 0 16px 0' }}>
                  {activeTerminal.description}
                </p>

                <div style={{ fontSize: '11px', color: '#e2e8f0', fontWeight: 700, marginBottom: '8px' }}>
                  SANDBOX TEST EXECUTION
                </div>

                {!testResults ? (
                  <div style={{ padding: '16px', border: '1px dashed #1e293b', borderRadius: '6px', textAlign: 'center', color: '#64748b', fontSize: '11px' }}>
                    Click "RUN TEST SUITE" to evaluate your solution.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: testResults.isSolved ? '#34d399' : '#f87171', marginBottom: '4px' }}>
                      {testResults.isSolved ? '✓ ALL TESTS PASSED! TERMINAL STABILIZED' : `✗ ${testResults.passedCount} / ${testResults.total} TESTS PASSED`}
                    </div>

                    {testResults.testLogs.map((log) => (
                      <div
                        key={log.index}
                        style={{
                          backgroundColor: log.passed ? 'rgba(6, 78, 59, 0.3)' : 'rgba(127, 29, 29, 0.3)',
                          border: `1px solid ${log.passed ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                          borderRadius: '6px',
                          padding: '8px 10px',
                          fontSize: '11px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: log.passed ? '#34d399' : '#f87171' }}>
                          {log.passed ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                          <span>Test #{log.index}: {log.passed ? 'PASSED' : 'FAILED'}</span>
                        </div>
                        <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>
                          Input: {JSON.stringify(log.input)}
                        </div>
                        <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                          Expected: {JSON.stringify(log.expected)}
                        </div>
                        {!log.passed && (
                          <div style={{ fontSize: '10px', color: '#fca5a5' }}>
                            {log.error ? `Error: ${log.error}` : `Received: ${JSON.stringify(log.received)}`}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          EMERGENCY STANDUP / VOTING MODAL (Conference Table & Chat)
          ========================================================================= */}
      {phase === 'VOTING' && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(3, 7, 18, 0.95)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: '24px'
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '920px',
              height: '85vh',
              backgroundColor: '#090d16',
              border: '2px solid #ef4444',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 0 50px rgba(239, 68, 68, 0.5)',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '14px 20px',
                backgroundColor: '#dc2626',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontWeight: 800,
                fontSize: '13px',
                letterSpacing: '1px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} />
                <span>🚨 EMERGENCY STANDUP: WHO IS THE MAFIA? ({emergencyCaller}) 🚨</span>
              </div>
              <div style={{ backgroundColor: 'rgba(0,0,0,0.5)', padding: '4px 12px', borderRadius: '9999px', fontSize: '12px' }}>
                VOTING CLOCK: {timer}s
              </div>
            </div>

            {/* Ejection Notice if just concluded */}
            {lastEjection && (
              <div
                style={{
                  backgroundColor: lastEjection.isMafia ? '#064e3b' : '#7f1d1d',
                  color: '#ffffff',
                  padding: '12px 20px',
                  textAlign: 'center',
                  fontSize: '13px',
                  fontWeight: 800,
                  borderBottom: '1px solid #334155'
                }}
              >
                {lastEjection.wasEjected ? (
                  <span>
                    🚀 {lastEjection.username} was ejected into deep space. They{' '}
                    <strong style={{ textDecoration: 'underline' }}>
                      {lastEjection.isMafia ? 'WERE THE MAFIA!' : 'WERE NOT THE MAFIA!'}
                    </strong>
                  </span>
                ) : (
                  <span>⚖️ {lastEjection.reason}</span>
                )}
              </div>
            )}

            {/* Split Content: Suspects Lineup (Left) vs Comms Discussion (Right) */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
              {/* Suspect Voting Lineup */}
              <div className="cb-scroll" style={{ flex: 1, padding: '20px', borderRight: '1px solid #1e293b', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, marginBottom: '4px' }}>
                  CAST BALLOT AGAINST SUSPECT:
                </div>

                {players.map((p) => {
                  const isTargetMe = p.id === socket.id;
                  const isVoted = votedSuspect === p.id;
                  return (
                    <div
                      key={p.id}
                      style={{
                        backgroundColor: isVoted ? 'rgba(239, 68, 68, 0.2)' : '#0d1424',
                        border: `1px solid ${isVoted ? '#ef4444' : '#1e293b'}`,
                        borderRadius: '8px',
                        padding: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        opacity: p.isAlive ? 1 : 0.4
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: p.color || '#3b82f6', border: '2px solid #000' }} />
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: p.isAlive ? '#f8fafc' : '#94a3b8' }}>
                            {p.username} {isTargetMe && '(You)'}
                          </div>
                          <div style={{ fontSize: '10px', color: '#64748b' }}>
                            {p.isAlive ? 'ACTIVE ON SHIP' : 'DECEASED'}
                          </div>
                        </div>
                      </div>

                      {p.isAlive && !votedSuspect && (
                        <button
                          onClick={() => handleCastVote(p.id)}
                          style={{
                            backgroundColor: '#dc2626',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '11px',
                            fontWeight: 800,
                            cursor: 'pointer'
                          }}
                        >
                          VOTE TO EJECT
                        </button>
                      )}

                      {p.votedFor && (
                        <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 700 }}>
                          VOTED ✓
                        </span>
                      )}
                    </div>
                  );
                })}

                {/* Skip Vote Option */}
                {!votedSuspect && (
                  <button
                    onClick={() => handleCastVote('SKIP')}
                    style={{
                      marginTop: '6px',
                      padding: '10px',
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#94a3b8',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    SKIP VOTE (INSUFFICIENT EVIDENCE)
                  </button>
                )}

                {votedSuspect && (
                  <div style={{ textAlign: 'center', padding: '10px', color: '#10b981', fontSize: '11px', fontWeight: 700 }}>
                    BALLOT SUBMITTED! Waiting for remaining crew...
                  </div>
                )}
              </div>

              {/* Standup Comms Chat */}
              <div style={{ width: '380px', display: 'flex', flexDirection: 'column', backgroundColor: '#070a14' }}>
                <div style={{ padding: '10px 16px', borderBottom: '1px solid #1e293b', fontSize: '11px', color: '#64748b', fontWeight: 700 }}>
                  STANDUP_DEBATE_CHANNEL
                </div>

                <div className="cb-scroll" style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {chatMessages.length === 0 && (
                    <span style={{ color: '#475569', fontSize: '11px' }}>Discuss suspicious behavior, sabotage alibis, and findings...</span>
                  )}
                  {chatMessages.map((msg) => (
                    <div key={msg.id} style={{ fontSize: '11px', lineHeight: '1.4' }}>
                      <span style={{ color: msg.color || '#38bdf8', fontWeight: 700 }}>{msg.sender}:</span>{' '}
                      <span style={{ color: '#94a3b8' }}>{msg.text}</span>
                    </div>
                  ))}
                  <div ref={chatBottomRef} />
                </div>

                {/* Chat Input */}
                <form onSubmit={handleSendChat} style={{ padding: '12px', borderTop: '1px solid #1e293b', display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Argue or present your alibi..."
                    style={{ flex: 1, backgroundColor: '#090d16', border: '1px solid #334155', borderRadius: '6px', padding: '8px 10px', color: '#fff', fontSize: '11px', outline: 'none' }}
                  />
                  <button type="submit" disabled={!chatInput.trim()} style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', padding: '0 12px', cursor: 'pointer' }}>
                    <Send size={13} />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          GAME OVER / VICTORY OVERLAY
          ========================================================================= */}
      {phase === 'GAME_OVER' && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(3, 7, 18, 0.96)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 60,
            padding: '24px'
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '540px',
              backgroundColor: '#0d1424',
              border: `2px solid ${gameWinner === 'DEVELOPERS' ? '#10b981' : '#ef4444'}`,
              borderRadius: '16px',
              padding: '32px',
              textAlign: 'center',
              boxShadow: `0 0 60px ${gameWinner === 'DEVELOPERS' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.5)'}`
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: gameWinner === 'DEVELOPERS' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                border: `2px solid ${gameWinner === 'DEVELOPERS' ? '#10b981' : '#ef4444'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: gameWinner === 'DEVELOPERS' ? '#10b981' : '#ef4444'
              }}
            >
              {gameWinner === 'DEVELOPERS' ? <Shield size={32} /> : <Skull size={32} />}
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#f8fafc', margin: '0 0 10px 0' }}>
              {gameWinner === 'DEVELOPERS' ? (
                <span style={{ color: '#10b981' }}>CREW VICTORY: SHIP SECURED!</span>
              ) : (
                <span style={{ color: '#ef4444' }}>MAFIA VICTORY: SHIP COMPROMISED!</span>
              )}
            </h2>

            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5', margin: '0 0 20px 0' }}>
              {winReason}
            </p>

            {/* True Role Unmasked Table */}
            <div style={{ backgroundColor: '#070a14', border: '1px solid #1e293b', borderRadius: '8px', padding: '12px', marginBottom: '24px', textAlign: 'left' }}>
              <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, marginBottom: '8px' }}>
                CREW ALLEGIANCES REVEALED:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {players.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 10px',
                      backgroundColor: '#0d1424',
                      borderRadius: '6px',
                      fontSize: '11px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: p.color || '#3b82f6' }} />
                      <span style={{ color: p.isAlive ? '#fff' : '#64748b' }}>
                        {p.username} {p.id === socket.id && '(You)'}
                      </span>
                    </div>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontWeight: 800,
                        fontSize: '10px',
                        backgroundColor: p.role === 'MAFIA' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                        color: p.role === 'MAFIA' ? '#f87171' : '#34d399',
                        border: `1px solid ${p.role === 'MAFIA' ? '#ef4444' : '#10b981'}`
                      }}
                    >
                      {p.role === 'MAFIA' ? 'MAFIA TRAITOR' : 'CREW DEVELOPER'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {isHost && (
                <button
                  onClick={handleRestartGame}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    border: '1px solid #38bdf8',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  PLAY AGAIN
                </button>
              )}
              <button
                onClick={handleLeaveRoom}
                style={{
                  flex: isHost ? 'none' : 1,
                  padding: '12px 18px',
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#94a3b8',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                LEAVE SHIP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}