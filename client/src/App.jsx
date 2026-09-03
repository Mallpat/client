import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Volume2,
  Compass,
  MapPin,
  Settings,
  Sparkles,
  Sliders,
  Maximize2
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
  reconnectionAttempts: 15,
  reconnectionDelay: 1000
});

// =============================================================================
// 10 CYBER EXO-SUIT COLORWAYS & TACTICAL GEAR
// =============================================================================
const PLAYER_COLORS = [
  { name: 'Crimson Vanguard', hex: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)' },
  { name: 'Cobalt Striker', hex: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)' },
  { name: 'Emerald Matrix', hex: '#10b981', glow: 'rgba(16, 185, 129, 0.4)' },
  { name: 'Solar Pulse', hex: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)' },
  { name: 'Hyper Orange', hex: '#f97316', glow: 'rgba(249, 115, 22, 0.4)' },
  { name: 'Void Nebula', hex: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.4)' },
  { name: 'Neon Flamingo', hex: '#ec4899', glow: 'rgba(236, 72, 153, 0.4)' },
  { name: 'Quantum Cyan', hex: '#06b6d4', glow: 'rgba(6, 182, 212, 0.4)' },
  { name: 'Arctic Frost', hex: '#e2e8f0', glow: 'rgba(226, 232, 240, 0.4)' },
  { name: 'Stealth Obsidian', hex: '#475569', glow: 'rgba(71, 85, 105, 0.4)' }
];

const VISOR_COLORS = [
  { name: 'Cyber Cyan', hex: '#06b6d4' },
  { name: 'Laser Gold', hex: '#f59e0b' },
  { name: 'Toxic Lime', hex: '#10b981' },
  { name: 'Plasma Red', hex: '#ef4444' },
  { name: 'Ultraviolet', hex: '#a855f7' }
];

const OPERATIVE_TITLES = [
  'Lead Architect',
  'Quantum Engineer',
  'Security Specialist',
  'Systems Hacker',
  'Chief Navigator',
  'Bio-Technician',
  'Cyber Infiltrator'
];

const RANDOM_NAMES = [
  'Vanguard_One',
  'Aether_Prime',
  'Ghost_Zero',
  'Spectre_9',
  'Nova_Pulse',
  'Cipher_X',
  'Apex_Runner',
  'Titan_Core'
];

// Map Dimensions (Dreadnought Megastructure)
const MAP_WIDTH = 2400;
const MAP_HEIGHT = 1800;

export default function App() {
  // Connection & Room state
  const [connected, setConnected] = useState(socket.connected);
  const [inRoom, setInRoom] = useState(false);
  const [roomId, setRoomId] = useState('spaceship-01');
  const [username, setUsername] = useState(() => {
    return RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
  });
  const [selectedColor, setSelectedColor] = useState(PLAYER_COLORS[0].hex);
  const [selectedVisor, setSelectedVisor] = useState(VISOR_COLORS[0].hex);
  const [selectedTitle, setSelectedTitle] = useState(OPERATIVE_TITLES[0]);
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [serverUrlInput, setServerUrlInput] = useState(SERVER_URL || '');
  const [showWardrobe, setShowWardrobe] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(true);

  // Authoritative State from Server
  const [phase, setPhase] = useState('LOBBY'); // 'LOBBY' | 'DAY' | 'NIGHT' | 'VOTING' | 'GAME_OVER'
  const [timer, setTimer] = useState(90);
  const [hostId, setHostId] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [myRole, setMyRole] = useState('DEV'); // 'DEV' | 'MAFIA' | 'PENDING'
  const [fellowMafia, setFellowMafia] = useState([]);
  const [players, setPlayers] = useState([]);
  const [terminals, setTerminals] = useState([]);
  const [solvedCount, setSolvedCount] = useState(0);
  const [totalTerminals, setTotalTerminals] = useState(6);
  const [imposterSetting, setImposterSetting] = useState('auto');
  const [calculatedImposters, setCalculatedImposters] = useState(1);
  const [chatMessages, setChatMessages] = useState([]);
  const [lastEjection, setLastEjection] = useState(null);
  const [gameWinner, setGameWinner] = useState(null);
  const [winReason, setWinReason] = useState(null);
  const [emergencyCaller, setEmergencyCaller] = useState(null);

  // Local Player & Canvas state
  const [localPos, setLocalPos] = useState({ x: 1200, y: 900 });
  const [activeTerminal, setActiveTerminal] = useState(null); // terminal opened in IDE modal
  const [terminalCode, setTerminalCode] = useState('');
  const [testResults, setTestResults] = useState(null);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [votedSuspect, setVotedSuspect] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [copiedRoom, setCopiedRoom] = useState(false);
  const [nearbyAction, setNearbyAction] = useState(null);

  const canvasRef = useRef(null);
  const keysPressed = useRef({});
  const walkCycleRef = useRef(0);
  const facingLeftRef = useRef(false);
  const playersRef = useRef([]);
  const chatBottomRef = useRef(null);
  const lastMoveEmitTime = useRef(0);
  const particlesRef = useRef([]);

  // Sync players ref for canvas loop
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
      setTotalTerminals(data.totalTerminals || 6);
      setImposterSetting(data.imposterSetting || 'auto');
      setCalculatedImposters(data.calculatedImposters || 1);
      setChatMessages(data.chatMessages || []);
      setLastEjection(data.lastEjection);
      setGameWinner(data.gameWinner);
      setWinReason(data.winReason);
      setEmergencyCaller(data.emergencyCaller);

      // Sync local player position if uninitialized
      const self = data.players.find((p) => p.id === socket.id);
      if (self && !keysPressed.current['w'] && !keysPressed.current['s'] && !keysPressed.current['a'] && !keysPressed.current['d']) {
        // Sync gently without overriding active local user inputs
      }
    });

    socket.on('timer_tick', ({ timer: newTimer }) => {
      setTimer(newTimer);
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

    socket.on('chat_message', (msg) => {
      setChatMessages((prev) => [...prev, msg]);
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    });

    socket.on('error_message', (msg) => {
      alert(`[ERROR] ${msg}`);
    });

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('room_update');
      socket.off('timer_tick');
      socket.off('player_moved');
      socket.off('terminal_test_results');
      socket.off('chat_message');
      socket.off('error_message');
    };
  }, []);

  // Keyboard Movement Listener (Enabled in LOBBY, DAY, and NIGHT)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't capture WASD if typing in input or editor
      if (
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA' ||
        activeTerminal !== null
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright'].includes(key)) {
        keysPressed.current[key] = true;
      }

      // Proximity Action with [E]
      if (key === 'e' && nearbyAction) {
        if (nearbyAction.type === 'terminal') {
          const term = terminals.find((t) => t.id === nearbyAction.id);
          if (term) {
            setActiveTerminal(term);
            setTerminalCode(term.code || term.starterCode);
            setTestResults(null);
          }
        } else if (nearbyAction.type === 'emergency') {
          if (phase === 'DAY') {
            socket.emit('call_emergency', { roomId });
          }
        } else if (nearbyAction.type === 'wardrobe') {
          setShowWardrobe(true);
        }
      }

      // Sabotage Action with [Q] (Mafia only in Night phase)
      if (key === 'q' && myRole === 'MAFIA' && phase === 'NIGHT' && nearbyAction && nearbyAction.type === 'terminal') {
        socket.emit('sabotage_terminal', { roomId, terminalId: nearbyAction.id });
      }

      // Toggle Mini-Map with [M]
      if (key === 'm') {
        setShowMiniMap((prev) => !prev);
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright'].includes(key)) {
        keysPressed.current[key] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeTerminal, nearbyAction, terminals, myRole, phase, roomId]);

  // =========================================================================
  // HIGH-RESOLUTION PROCEDURAL VECTOR GRAPHICS & CANVAS ENGINE (60 FPS)
  // =========================================================================
  useEffect(() => {
    let animationFrameId;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Resize canvas to responsive viewport (up to 960x640)
    canvas.width = 960;
    canvas.height = 640;

    // Movement physics & collision boundaries
    const SPEED = 4.2;

    const render = () => {
      // 1. Movement Calculations
      let dx = 0;
      let dy = 0;
      const k = keysPressed.current;

      if (k['w'] || k['arrowup']) dy -= 1;
      if (k['s'] || k['arrowdown']) dy += 1;
      if (k['a'] || k['arrowleft']) dx -= 1;
      if (k['d'] || k['arrowright']) dx += 1;

      const isMoving = (dx !== 0 || dy !== 0) && activeTerminal === null && phase !== 'VOTING' && phase !== 'GAME_OVER';

      if (isMoving) {
        if (dx < 0) facingLeftRef.current = true;
        if (dx > 0) facingLeftRef.current = false;

        // Normalize diagonal speed
        if (dx !== 0 && dy !== 0) {
          dx *= 0.7071;
          dy *= 0.7071;
        }

        walkCycleRef.current += 0.22;

        setLocalPos((prev) => {
          // Clamp to dreadnought outer boundaries
          const nextX = Math.max(120, Math.min(MAP_WIDTH - 120, prev.x + dx * SPEED));
          const nextY = Math.max(120, Math.min(MAP_HEIGHT - 120, prev.y + dy * SPEED));

          // Throttle socket move emit to 30Hz
          const now = Date.now();
          if (now - lastMoveEmitTime.current > 33) {
            lastMoveEmitTime.current = now;
            socket.emit('player_move', {
              roomId,
              x: Math.round(nextX),
              y: Math.round(nextY),
              isMoving: true,
              facingLeft: facingLeftRef.current
            });
          }

          return { x: nextX, y: nextY };
        });
      } else if (lastMoveEmitTime.current !== 0) {
        // Broadcast stop state once
        lastMoveEmitTime.current = 0;
        socket.emit('player_move', {
          roomId,
          x: Math.round(localPos.x),
          y: Math.round(localPos.y),
          isMoving: false,
          facingLeft: facingLeftRef.current
        });
      }

      // 2. Camera Viewport Tracking (Centered on local player, clamped to map)
      const cameraX = Math.max(0, Math.min(MAP_WIDTH - canvas.width, localPos.x - canvas.width / 2));
      const cameraY = Math.max(0, Math.min(MAP_HEIGHT - canvas.height, localPos.y - canvas.height / 2));

      // 3. Render Starfield Background
      ctx.fillStyle = '#05070d';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(-cameraX, -cameraY);

      // Deep Space Starfield & Cosmic Dust
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let i = 0; i < 180; i++) {
        const starX = (i * 137.5) % MAP_WIDTH;
        const starY = (i * 97.3) % MAP_HEIGHT;
        const starSize = (i % 3 === 0) ? 2 : 1;
        ctx.fillRect(starX, starY, starSize, starSize);
      }

      // =======================================================================
      // DRAW PROCEDURAL 2400 x 1800 DREADNOUGHT SECTORS & HIGH-GRAPHIC PROPS
      // =======================================================================
      const time = Date.now() / 1000;

      // Outer Hull Silhouette
      ctx.fillStyle = '#0b0f19';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.rect(100, 100, MAP_WIDTH - 200, MAP_HEIGHT - 200);
      ctx.stroke();
      ctx.fill();

      // Sector 1: Command Bridge (North: x: 850-1550, y: 100-550)
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.fillRect(850, 100, 700, 450);
      ctx.strokeRect(850, 100, 700, 450);

      // Holographic 3D Star-Chart Projector (Terminal 1 at 1200, 240)
      ctx.save();
      ctx.translate(1200, 240);
      // Projector Pedestal
      ctx.beginPath();
      ctx.arc(0, 0, 48, 0, Math.PI * 2);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Rotating Hologram Wireframe Globe
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 32, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(0, 0, 32, Math.abs(Math.cos(time)) * 32, time, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(0, 0, Math.abs(Math.sin(time)) * 32, 32, -time, 0, Math.PI * 2);
      ctx.stroke();

      // Orbiting Data Glint
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(Math.cos(time * 2) * 36, Math.sin(time * 2) * 36, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Sector 2: AI & Quantum Mainframe (North-West: x: 200-750, y: 150-600)
      ctx.fillStyle = '#090d16';
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 4;
      ctx.fillRect(200, 150, 550, 450);
      ctx.strokeRect(200, 150, 550, 450);

      // Server Monoliths with Data Lights (Terminal 2 at 550, 320)
      for (let r = 0; r < 3; r++) {
        const sx = 260 + r * 90;
        ctx.fillStyle = '#1e1e2d';
        ctx.fillRect(sx, 220, 50, 240);
        ctx.strokeStyle = '#4f46e5';
        ctx.lineWidth = 2;
        ctx.strokeRect(sx, 220, 50, 240);

        // Blinking bus lights
        for (let b = 0; b < 6; b++) {
          const isBlink = Math.sin(time * 5 + r + b) > 0;
          ctx.fillStyle = isBlink ? '#10b981' : '#312e81';
          ctx.fillRect(sx + 8, 235 + b * 34, 10, 8);
          ctx.fillStyle = !isBlink ? '#38bdf8' : '#1e1b4b';
          ctx.fillRect(sx + 28, 235 + b * 34, 10, 8);
        }
      }

      // Spinning Mainframe Cooling Fans
      ctx.save();
      ctx.translate(550, 320);
      ctx.beginPath();
      ctx.arc(0, 0, 42, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 3;
      ctx.stroke();
      // Fan Blades
      for (let f = 0; f < 4; f++) {
        const bladeAngle = time * 6 + (f * Math.PI) / 2;
        ctx.fillStyle = '#4338ca';
        ctx.beginPath();
        ctx.arc(Math.cos(bladeAngle) * 20, Math.sin(bladeAngle) * 20, 10, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Sector 3: Communications & Sensor Array (North-East: x: 1650-2200, y: 150-600)
      ctx.fillStyle = '#0c1322';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 4;
      ctx.fillRect(1650, 150, 550, 450);
      ctx.strokeRect(1650, 150, 550, 450);

      // Rotating Radar Terminal (Terminal 3 at 1850, 320)
      ctx.save();
      ctx.translate(1850, 320);
      ctx.beginPath();
      ctx.arc(0, 0, 46, 0, Math.PI * 2);
      ctx.fillStyle = '#0b1329';
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Radar Sweep Line
      const sweepAngle = time * 2;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(sweepAngle) * 44, Math.sin(sweepAngle) * 44);
      ctx.stroke();

      // Oscilloscope Grid Rings
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Sector 4: Security & Surveillance Vault (West: x: 150-700, y: 750-1250)
      ctx.fillStyle = '#14141d';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 4;
      ctx.fillRect(150, 750, 550, 500);
      ctx.strokeRect(150, 750, 550, 500);

      // Curved Surveillance Wall (Terminal 4 at 380, 950)
      ctx.save();
      ctx.translate(380, 950);
      ctx.beginPath();
      ctx.arc(0, 0, 50, 0, Math.PI * 2);
      ctx.fillStyle = '#1a1016';
      ctx.fill();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.stroke();
      // Holographic Security Eye
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 20, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(Math.cos(time * 3) * 6, Math.sin(time * 3) * 6, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Sector 5: Cybernetics & Bio-Lab (East: x: 1700-2250, y: 750-1250)
      ctx.fillStyle = '#061a1e';
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 4;
      ctx.fillRect(1700, 750, 550, 500);
      ctx.strokeRect(1700, 750, 550, 500);

      // Bubbling Cryo-Stasis Chamber (Terminal 5 at 2000, 950)
      ctx.save();
      ctx.translate(2000, 950);
      ctx.beginPath();
      ctx.arc(0, 0, 50, 0, Math.PI * 2);
      ctx.fillStyle = '#032420';
      ctx.fill();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.stroke();

      // DNA Double-Helix Projection
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2;
      for (let d = -25; d <= 25; d += 10) {
        const offset = Math.sin(time * 3 + d * 0.15) * 14;
        ctx.beginPath();
        ctx.moveTo(d, -offset);
        ctx.lineTo(d, offset);
        ctx.stroke();
        ctx.fillStyle = '#10b981';
        ctx.fillRect(d - 2, -offset - 2, 4, 4);
        ctx.fillRect(d - 2, offset - 2, 4, 4);
      }
      ctx.restore();

      // Sector 6: Quantum Hyper-Reactor Core (South: x: 850-1550, y: 1250-1750)
      ctx.fillStyle = '#110c1c';
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 4;
      ctx.fillRect(850, 1250, 700, 500);
      ctx.strokeRect(850, 1250, 700, 500);

      // Swirling Plasma Reactor Core (Terminal 6 at 1200, 1550)
      ctx.save();
      ctx.translate(1200, 1550);
      // Outer containment
      ctx.beginPath();
      ctx.arc(0, 0, 68, 0, Math.PI * 2);
      ctx.fillStyle = '#0f0a1e';
      ctx.fill();
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Counter-rotating magnetic rings
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, 0, 52, 22, time * 1.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#c084fc';
      ctx.beginPath();
      ctx.ellipse(0, 0, 52, 22, -time * 1.5, 0, Math.PI * 2);
      ctx.stroke();

      // Pulsing Plasma Sphere
      const plasmaPulse = Math.sin(time * 4) * 5;
      const plasmaGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, 28 + plasmaPulse);
      plasmaGrad.addColorStop(0, '#ffffff');
      plasmaGrad.addColorStop(0.4, '#c084fc');
      plasmaGrad.addColorStop(1, 'rgba(139, 92, 246, 0.1)');
      ctx.fillStyle = plasmaGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 28 + plasmaPulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Central Hub / Grand Atrium (Center: x: 850-1550, y: 650-1150)
      ctx.fillStyle = '#0b1120';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 4;
      ctx.fillRect(850, 650, 700, 500);
      ctx.strokeRect(850, 650, 700, 500);

      // Connecting Corridors Floor Tiles & Chevrons
      ctx.fillStyle = 'rgba(51, 65, 85, 0.4)';
      ctx.fillRect(700, 320, 150, 100);  // West to Center-North
      ctx.fillRect(1550, 320, 100, 100); // Center-North to East
      ctx.fillRect(700, 900, 150, 100);  // West to Center
      ctx.fillRect(1550, 900, 150, 100); // Center to East
      ctx.fillRect(1150, 550, 100, 100); // North to Center
      ctx.fillRect(1150, 1150, 100, 100);// Center to South

      // Central Emergency Quarantine Lockdown Beacon at (1200, 900)
      ctx.save();
      ctx.translate(1200, 900);
      ctx.beginPath();
      ctx.arc(0, 0, 60, 0, Math.PI * 2);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 4;
      ctx.stroke();

      const pulseEmergency = Math.sin(time * 4) * 6;
      ctx.beginPath();
      ctx.arc(0, 0, 24 + pulseEmergency, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.fillStyle = '#dc2626';
      ctx.fill();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.font = "bold 9px 'JetBrains Mono', monospace";
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('STANDUP', 0, 4);
      ctx.restore();

      // Decontamination Mirror & Wardrobe Pod at (1050, 750)
      ctx.save();
      ctx.translate(1050, 750);
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(-35, -45, 70, 90);
      ctx.strokeStyle = '#818cf8';
      ctx.lineWidth = 3;
      ctx.strokeRect(-35, -45, 70, 90);

      // Sweeping Laser Scan Line
      const scanY = Math.sin(time * 3) * 35;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-30, scanY);
      ctx.lineTo(30, scanY);
      ctx.stroke();

      ctx.font = "bold 9px 'JetBrains Mono', monospace";
      ctx.fillStyle = '#c7d2fe';
      ctx.textAlign = 'center';
      ctx.fillText('WARDROBE', 0, 58);
      ctx.restore();

      // Room Name Banners
      ctx.font = "bold 13px 'JetBrains Mono', monospace";
      ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
      ctx.textAlign = 'center';
      ctx.fillText('COMMAND BRIDGE [SECTOR 1]', 1200, 135);
      ctx.fillText('AI MAINFRAME [SECTOR 2]', 475, 180);
      ctx.fillText('COMMS & SENSORS [SECTOR 3]', 1925, 180);
      ctx.fillText('SECURITY VAULT [SECTOR 4]', 425, 780);
      ctx.fillText('BIO-CYBER LAB [SECTOR 5]', 1975, 780);
      ctx.fillText('QUANTUM REACTOR [SECTOR 6]', 1200, 1280);
      ctx.fillText('CENTRAL ASSEMBLY ATRIUM', 1200, 680);

      // =======================================================================
      // DRAW 6 ACTIVE TERMINAL STATUS BLIPS
      // =======================================================================
      terminals.forEach((term) => {
        const isNearby = Math.hypot(localPos.x - term.x, localPos.y - term.y) < 75;
        const color = term.solved ? '#10b981' : (term.sabotaged ? '#ef4444' : '#f59e0b');

        // Glowing interactive aura
        ctx.beginPath();
        ctx.arc(term.x, term.y, 45, 0, Math.PI * 2);
        ctx.fillStyle = isNearby ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.04)';
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = isNearby ? 3 : 1.5;
        ctx.stroke();

        // Terminal Console Body
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(term.x - 22, term.y - 16, 44, 32);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(term.x - 22, term.y - 16, 44, 32);

        // Terminal Screen
        ctx.fillStyle = color;
        ctx.font = "bold 8px 'JetBrains Mono', monospace";
        ctx.textAlign = 'center';
        ctx.fillText(term.solved ? 'STABLE' : (term.sabotaged ? 'SABOTAGED' : 'DEBUG'), term.x, term.y + 3);
      });

      // =======================================================================
      // DRAW ORIGINAL CYBERNETIC OPERATIVES (Zero "Among Us" assets)
      // =======================================================================
      // Combine remote players and local player
      const allRoster = [...playersRef.current];
      if (!allRoster.some((p) => p.id === socket.id)) {
        allRoster.push({
          id: socket.id,
          username,
          color: selectedColor,
          visorColor: selectedVisor,
          operativeTitle: selectedTitle,
          x: localPos.x,
          y: localPos.y,
          isMoving,
          facingLeft: facingLeftRef.current,
          role: myRole,
          isAlive: true
        });
      }

      // Sort by Y for depth layering
      allRoster.sort((a, b) => a.y - b.y);

      allRoster.forEach((p) => {
        const isLocal = p.id === socket.id;
        const px = isLocal ? localPos.x : p.x;
        const py = isLocal ? localPos.y : p.y;
        const isFacingLeft = isLocal ? facingLeftRef.current : p.facingLeft;
        const isPlMoving = isLocal ? isMoving : p.isMoving;
        const pVisor = p.visorColor || '#06b6d4';
        const pColor = p.color || '#3b82f6';
        const pWalk = isPlMoving ? Math.sin(time * 12) * 4 : 0;

        ctx.save();
        ctx.translate(px, py);
        if (isFacingLeft) ctx.scale(-1, 1);

        // Shadow
        ctx.beginPath();
        ctx.ellipse(0, 20, 18, 7, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fill();

        // 1. Rear Jetpack Module & Thruster Particles
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-18, -12, 8, 24);
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-18, -12, 8, 24);

        if (isPlMoving) {
          // Thruster flame exhaust
          ctx.fillStyle = 'rgba(56, 189, 248, 0.8)';
          ctx.beginPath();
          ctx.moveTo(-18, 12);
          ctx.lineTo(-24 - Math.random() * 6, 16 + Math.random() * 4);
          ctx.lineTo(-14, 12);
          ctx.fill();
        }

        // 2. Mechanical Armored Legs
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-8 + pWalk, 8, 7, 14); // Left leg
        ctx.fillRect(2 - pWalk, 8, 7, 14);  // Right leg
        ctx.fillStyle = pColor;
        ctx.fillRect(-9 + pWalk, 18, 9, 5); // Left boot armor
        ctx.fillRect(1 - pWalk, 18, 9, 5);  // Right boot armor

        // 3. Segmented Ballistic Chestplate (Trapezoidal Exo-Suit)
        ctx.fillStyle = pColor;
        ctx.beginPath();
        ctx.moveTo(-14, -14);
        ctx.lineTo(14, -14);
        ctx.lineTo(11, 10);
        ctx.lineTo(-11, 10);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Center Power Core Reactor
        ctx.fillStyle = pVisor;
        ctx.beginPath();
        ctx.arc(0, -2, 4, 0, Math.PI * 2);
        ctx.fill();

        // Armored Shoulder Pauldrons
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-17, -14, 6, 10);
        ctx.fillRect(11, -14, 6, 10);

        // 4. Tactical Combat Helmet & Curved AR Hex-Visor
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(0, -24, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = pColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Glowing AR Curved Visor
        ctx.fillStyle = pVisor;
        ctx.shadowColor = pVisor;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(4, -24, 9, -Math.PI / 3, Math.PI / 3);
        ctx.lineTo(4, -20);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0; // Reset blur

        ctx.restore();

        // Nametag & Class Title (Drawn without scale inversion)
        ctx.font = "bold 10px 'JetBrains Mono', monospace";
        ctx.textAlign = 'center';

        const isMafiaTeammate = myRole === 'MAFIA' && (p.role === 'MAFIA' || fellowMafia.includes(p.username));
        ctx.fillStyle = isMafiaTeammate ? '#ef4444' : '#f8fafc';
        ctx.fillText(p.username + (isLocal ? ' (YOU)' : ''), px, py - 42);

        ctx.font = "8px 'JetBrains Mono', monospace";
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`[${p.operativeTitle || 'Operative'}]`, px, py - 32);
      });

      // =======================================================================
      // NIGHT PHASE: FLASHLIGHT FOG-OF-WAR (Developers) vs NIGHT VISION (Mafia)
      // =======================================================================
      if (phase === 'NIGHT') {
        if (myRole === 'MAFIA') {
          // Mafia: High-tech green night-vision HUD overlay
          ctx.fillStyle = 'rgba(16, 185, 129, 0.14)';
          ctx.fillRect(cameraX, cameraY, canvas.width, canvas.height);
          // Scanlines
          ctx.fillStyle = 'rgba(16, 185, 129, 0.05)';
          for (let y = 0; y < canvas.height; y += 4) {
            ctx.fillRect(cameraX, cameraY + y, canvas.width, 2);
          }
        } else {
          // Developers: Darkness mask with 135px circular vision cut-out
          const maskCanvas = document.createElement('canvas');
          maskCanvas.width = canvas.width;
          maskCanvas.height = canvas.height;
          const maskCtx = maskCanvas.getContext('2d');

          maskCtx.fillStyle = 'rgba(3, 7, 18, 0.96)';
          maskCtx.fillRect(0, 0, canvas.width, canvas.height);

          maskCtx.globalCompositeOperation = 'destination-out';
          const screenX = localPos.x - cameraX;
          const screenY = localPos.y - cameraY;

          const flashlightGrad = maskCtx.createRadialGradient(screenX, screenY, 30, screenX, screenY, 140);
          flashlightGrad.addColorStop(0, 'rgba(0,0,0,1)');
          flashlightGrad.addColorStop(0.8, 'rgba(0,0,0,0.85)');
          flashlightGrad.addColorStop(1, 'rgba(0,0,0,0)');

          maskCtx.fillStyle = flashlightGrad;
          maskCtx.beginPath();
          maskCtx.arc(screenX, screenY, 140, 0, Math.PI * 2);
          maskCtx.fill();

          ctx.drawImage(maskCanvas, cameraX, cameraY);
        }
      }

      ctx.restore(); // Restore camera translation

      // =======================================================================
      // PROXIMITY ACTION DETECTION (Within 70px)
      // =======================================================================
      let foundAction = null;

      // Check Terminals
      terminals.forEach((term) => {
        const dist = Math.hypot(localPos.x - term.x, localPos.y - term.y);
        if (dist < 70) {
          foundAction = {
            type: 'terminal',
            id: term.id,
            name: term.name,
            solved: term.solved
          };
        }
      });

      // Check Emergency Beacon (1200, 900)
      if (!foundAction && Math.hypot(localPos.x - 1200, localPos.y - 900) < 70) {
        foundAction = {
          type: 'emergency',
          name: 'Central Lockdown Beacon'
        };
      }

      // Check Wardrobe Pod (1050, 750)
      if (!foundAction && Math.hypot(localPos.x - 1050, localPos.y - 750) < 70) {
        foundAction = {
          type: 'wardrobe',
          name: 'Decontamination Wardrobe Pod'
        };
      }

      setNearbyAction(foundAction);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [localPos, terminals, myRole, phase, roomId, username, selectedColor, selectedVisor, selectedTitle]);

  // =========================================================================
  // VIEW: AIRLOCK LOGIN (Entry / Server Config)
  // =========================================================================
  if (!inRoom) {
    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          backgroundColor: '#05070d',
          backgroundImage: 'radial-gradient(circle at 50% 30%, #1e1b4b 0%, #030712 100%)',
          color: '#f8fafc',
          fontFamily: "'JetBrains Mono', Consolas, monospace, sans-serif",
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px', zIndex: 2 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '20px',
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: '#38bdf8',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '1px',
              marginBottom: '14px',
              boxShadow: '0 0 15px rgba(56, 189, 248, 0.2)'
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: connected ? '#10b981' : '#ef4444' }} />
            2400x1800 DREADNOUGHT // MULTIPLAYER ARENA
          </div>

          <h1 style={{ fontSize: '46px', fontWeight: 900, letterSpacing: '-1px', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <span style={{ color: '#38bdf8', textShadow: '0 0 20px rgba(56, 189, 248, 0.5)' }}>CODE</span>
            <span style={{ color: '#ef4444', textShadow: '0 0 20px rgba(239, 68, 68, 0.6)' }}>MAFIA</span>
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', maxWidth: '480px', lineHeight: '1.5' }}>
            Explore the 8-room dreadnought, stabilize 6 real-world engineering terminals in Monaco IDE, survive the 30s blackout, and unmask the cyber infiltrators!
          </p>
        </div>

        <div
          style={{
            width: '100%',
            maxWidth: '460px',
            backgroundColor: 'rgba(15, 23, 42, 0.94)',
            backdropFilter: 'blur(16px)',
            border: '1px solid #334155',
            borderRadius: '14px',
            padding: '28px',
            boxSizing: 'border-box',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px rgba(56, 189, 248, 0.15)',
            zIndex: 2
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '14px', marginBottom: '18px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#f8fafc', letterSpacing: '1px' }}>
              SPACESHIP AIRLOCK REGISTRATION
            </span>
            <span style={{ fontSize: '10px', color: '#38bdf8', fontWeight: 700 }}>2D CANVAS V2</span>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!roomId.trim() || !username.trim()) return;
              if (!connected) {
                setShowServerConfig(true);
                alert("⚠️ Cannot Board: Game Server Offline!\n\nYour game frontend is running on Vercel, but it cannot connect to the backend WebSocket server.\n\n👉 Deploy your backend to Render.com and paste your Render URL into 'Server URL' below!");
                return;
              }
              socket.emit('join_room', {
                roomId: roomId.trim(),
                username: username.trim(),
                color: selectedColor,
                visorColor: selectedVisor,
                operativeTitle: selectedTitle
              });
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
                <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>OPERATIVE CALLSIGN</label>
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
                EXO-SUIT COLORWAY
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                {PLAYER_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setSelectedColor(c.hex)}
                    style={{
                      width: '100%',
                      height: '28px',
                      borderRadius: '6px',
                      backgroundColor: c.hex,
                      border: selectedColor === c.hex ? '3px solid #ffffff' : '2px solid #000000',
                      boxShadow: selectedColor === c.hex ? `0 0 12px ${c.hex}` : 'none',
                      cursor: 'pointer'
                    }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Room Code */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', fontWeight: 600, marginBottom: '6px' }}>
                SPACESHIP SECTOR CODE
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
              {connected ? 'ENTER DREADNOUGHT WAITING DECK ➔' : '⚠️ BACKEND OFFLINE (CLICK FOR HELP)'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: MAIN 2D ARENA (Lobby, Day, Night, or Emergency)
  // =========================================================================
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: '#05070d',
        color: '#f8fafc',
        fontFamily: "'JetBrains Mono', Consolas, monospace, sans-serif",
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Top Cyber Navigation Bar */}
      <header
        style={{
          height: '56px',
          backgroundColor: '#090d16',
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          zIndex: 10
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px', fontWeight: 900, color: '#38bdf8' }}>CODE</span>
            <span style={{ fontSize: '18px', fontWeight: 900, color: '#ef4444' }}>MAFIA</span>
            <span style={{ fontSize: '10px', color: '#64748b', marginLeft: '4px' }}>// DREADNOUGHT</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#0f172a', padding: '4px 10px', borderRadius: '6px', border: '1px solid #1e293b' }}>
            <Radio size={14} color="#10b981" />
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Sector:</span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8' }}>{roomId}</span>
          </div>

          {/* Phase Badge */}
          <div
            style={{
              padding: '4px 12px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 800,
              backgroundColor:
                phase === 'LOBBY'
                  ? '#1e293b'
                  : phase === 'DAY'
                  ? 'rgba(56, 189, 248, 0.2)'
                  : phase === 'NIGHT'
                  ? 'rgba(139, 92, 246, 0.25)'
                  : 'rgba(239, 68, 68, 0.25)',
              border:
                phase === 'LOBBY'
                  ? '1px solid #475569'
                  : phase === 'DAY'
                  ? '1px solid #38bdf8'
                  : phase === 'NIGHT'
                  ? '1px solid #a855f7'
                  : '1px solid #ef4444',
              color:
                phase === 'LOBBY'
                  ? '#cbd5e1'
                  : phase === 'DAY'
                  ? '#38bdf8'
                  : phase === 'NIGHT'
                  ? '#c084fc'
                  : '#f87171',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {phase === 'LOBBY' && 'WAITING DECK'}
            {phase === 'DAY' && 'DAY SPRINT // FULL SHIP POWER'}
            {phase === 'NIGHT' && 'NIGHT BLACKOUT // 30s POWER FAILURE'}
            {phase === 'VOTING' && 'EMERGENCY STANDUP LOCKDOWN'}
            {phase === 'GAME_OVER' && 'MISSION DEBRIEF'}
          </div>
        </div>

        {/* Center: Live Timer & Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {phase !== 'LOBBY' && phase !== 'GAME_OVER' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} color={timer < 15 ? '#ef4444' : '#38bdf8'} />
              <span style={{ fontSize: '18px', fontWeight: 800, color: timer < 15 ? '#ef4444' : '#ffffff' }}>
                {timer}s
              </span>
            </div>
          )}

          {/* Subsystems Integrity (Fixed / Total) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>INTEGRITY:</span>
            <div style={{ width: '120px', height: '10px', backgroundColor: '#1e293b', borderRadius: '5px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${(solvedCount / totalTerminals) * 100}%`,
                  height: '100%',
                  backgroundColor: solvedCount === totalTerminals ? '#10b981' : '#38bdf8',
                  transition: 'width 0.4s ease'
                }}
              />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8' }}>
              {solvedCount}/{totalTerminals}
            </span>
          </div>
        </div>

        {/* Right Controls: Wardrobe & Mini-map Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setShowWardrobe(true)}
            style={{
              padding: '6px 12px',
              backgroundColor: '#1e1b4b',
              border: '1px solid #6366f1',
              borderRadius: '6px',
              color: '#c7d2fe',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Sparkles size={13} color="#818cf8" /> WARDROBE
          </button>

          <button
            onClick={() => setShowMiniMap(!showMiniMap)}
            style={{
              padding: '6px 12px',
              backgroundColor: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: '#94a3b8',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Compass size={13} color="#38bdf8" /> {showMiniMap ? 'HIDE MAP' : 'MINI-MAP'}
          </button>

          {/* Role Pill */}
          {phase !== 'LOBBY' && (
            <div
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 800,
                backgroundColor: myRole === 'MAFIA' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                border: myRole === 'MAFIA' ? '1px solid #ef4444' : '1px solid #10b981',
                color: myRole === 'MAFIA' ? '#f87171' : '#34d399'
              }}
            >
              {myRole === 'MAFIA' ? 'ROLE: INFILTRATOR' : 'ROLE: DEVELOPER'}
            </div>
          )}
        </div>
      </header>

      {/* Main Canvas Play Area */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <canvas
          ref={canvasRef}
          style={{
            width: '960px',
            height: '640px',
            borderRadius: '12px',
            border: '1px solid #1e293b',
            boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
          }}
        />

        {/* Floating Contextual Interaction Pill */}
        {nearbyAction && activeTerminal === null && phase !== 'VOTING' && (
          <div
            style={{
              position: 'absolute',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '12px 24px',
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              border: nearbyAction.type === 'emergency' ? '2px solid #ef4444' : '2px solid #38bdf8',
              borderRadius: '30px',
              boxShadow: '0 0 25px rgba(56, 189, 248, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              zIndex: 15
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc' }}>
              {nearbyAction.name}
            </span>

            {nearbyAction.type === 'terminal' && (
              <button
                onClick={() => {
                  const term = terminals.find((t) => t.id === nearbyAction.id);
                  if (term) {
                    setActiveTerminal(term);
                    setTerminalCode(term.code || term.starterCode);
                    setTestResults(null);
                  }
                }}
                style={{
                  padding: '6px 14px',
                  backgroundColor: '#0284c7',
                  border: 'none',
                  borderRadius: '20px',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                [E] OPEN MONACO IDE
              </button>
            )}

            {nearbyAction.type === 'terminal' && myRole === 'MAFIA' && phase === 'NIGHT' && (
              <button
                onClick={() => socket.emit('sabotage_terminal', { roomId, terminalId: nearbyAction.id })}
                style={{
                  padding: '6px 14px',
                  backgroundColor: '#dc2626',
                  border: 'none',
                  borderRadius: '20px',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                [Q] SABOTAGE
              </button>
            )}

            {nearbyAction.type === 'wardrobe' && (
              <button
                onClick={() => setShowWardrobe(true)}
                style={{
                  padding: '6px 14px',
                  backgroundColor: '#6366f1',
                  border: 'none',
                  borderRadius: '20px',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                [E] CUSTOMIZE SUIT
              </button>
            )}

            {nearbyAction.type === 'emergency' && (
              <button
                onClick={() => {
                  if (phase === 'DAY') socket.emit('call_emergency', { roomId });
                }}
                style={{
                  padding: '6px 14px',
                  backgroundColor: '#dc2626',
                  border: 'none',
                  borderRadius: '20px',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                [E] CALL EMERGENCY MEETING
              </button>
            )}
          </div>
        )}

        {/* LOBBY WAITING DECK OVERLAY (Launch & Settings Deck) */}
        {phase === 'LOBBY' && (
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              width: '320px',
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              backdropFilter: 'blur(12px)',
              border: '1px solid #334155',
              borderRadius: '10px',
              padding: '16px',
              zIndex: 15
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#38bdf8' }}>
                SPACESHIP ROSTER ({players.length})
              </span>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                Host: {players.find((p) => p.id === hostId)?.username || 'Connecting...'}
              </span>
            </div>

            {/* Imposter Scaling Info & Setting */}
            <div style={{ padding: '8px 10px', backgroundColor: '#090d16', borderRadius: '6px', border: '1px solid #1e293b', marginBottom: '12px', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', marginBottom: '4px' }}>
                <span>Imposter Scaling:</span>
                <span style={{ color: '#ef4444', fontWeight: 700 }}>{calculatedImposters} Infiltrator(s)</span>
              </div>
              {isHost && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                  <label style={{ fontSize: '10px', color: '#64748b' }}>Imposter Mode:</label>
                  <select
                    value={imposterSetting}
                    onChange={(e) => socket.emit('set_game_settings', { roomId, imposterSetting: e.target.value })}
                    style={{ flex: 1, padding: '4px 6px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '4px', color: '#fff', fontSize: '10px' }}
                  >
                    <option value="auto">Auto (Dynamic Scale)</option>
                    <option value="1">1 Infiltrator</option>
                    <option value="2">2 Infiltrators</option>
                    <option value="3">3 Infiltrators</option>
                  </select>
                </div>
              )}
            </div>

            {/* Player Badges */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '140px', overflowY: 'auto', marginBottom: '14px' }}>
              {players.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 10px',
                    backgroundColor: '#090d16',
                    borderRadius: '6px',
                    border: p.id === socket.id ? '1px solid #38bdf8' : '1px solid #1e293b'
                  }}
                >
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: p.color }} />
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#f8fafc', flex: 1 }}>
                    {p.username} {p.id === socket.id && '(YOU)'}
                  </span>
                  <span style={{ fontSize: '9px', color: '#64748b' }}>{p.operativeTitle || 'Operative'}</span>
                </div>
              ))}
            </div>

            {/* Start Button (Host only) */}
            {isHost ? (
              <button
                onClick={() => socket.emit('start_game', { roomId })}
                disabled={players.length < 2}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: players.length >= 2 ? '#0284c7' : '#334155',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 800,
                  letterSpacing: '1px',
                  cursor: players.length >= 2 ? 'pointer' : 'not-allowed',
                  boxShadow: players.length >= 2 ? '0 0 15px rgba(2, 132, 199, 0.5)' : 'none'
                }}
              >
                {players.length >= 2 ? 'INITIATE SPACESHIP MISSION ➔' : 'NEED 2+ OPERATIVES TO LAUNCH'}
              </button>
            ) : (
              <div style={{ textAlign: 'center', fontSize: '11px', color: '#94a3b8', padding: '8px' }}>
                Waiting for host to launch mission...
              </div>
            )}
          </div>
        )}

        {/* REAL-TIME MINI-MAP HUD (Top Right) */}
        {showMiniMap && (
          <div
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              width: '180px',
              height: '135px',
              backgroundColor: 'rgba(9, 13, 22, 0.9)',
              border: '1px solid #334155',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.7)',
              zIndex: 15,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Map Rooms Outline in miniature */}
            <div style={{ position: 'absolute', inset: 0, opacity: 0.35 }}>
              <div style={{ position: 'absolute', left: '35%', top: '5%', width: '30%', height: '25%', border: '1px solid #38bdf8' }} /> {/* Bridge */}
              <div style={{ position: 'absolute', left: '8%', top: '8%', width: '22%', height: '25%', border: '1px solid #6366f1' }} />  {/* AI */}
              <div style={{ position: 'absolute', left: '70%', top: '8%', width: '22%', height: '25%', border: '1px solid #f59e0b' }} /> {/* Comms */}
              <div style={{ position: 'absolute', left: '6%', top: '42%', width: '22%', height: '28%', border: '1px solid #ef4444' }} />  {/* Vault */}
              <div style={{ position: 'absolute', left: '72%', top: '42%', width: '22%', height: '28%', border: '1px solid #10b981' }} /> {/* Bio */}
              <div style={{ position: 'absolute', left: '35%', top: '36%', width: '30%', height: '28%', border: '1px solid #64748b' }} /> {/* Atrium */}
              <div style={{ position: 'absolute', left: '35%', top: '70%', width: '30%', height: '25%', border: '1px solid #8b5cf6' }} /> {/* Reactor */}
            </div>

            {/* Terminal Status Blips */}
            {terminals.map((t) => (
              <div
                key={t.id}
                style={{
                  position: 'absolute',
                  left: `${(t.x / MAP_WIDTH) * 180 - 3}px`,
                  top: `${(t.y / MAP_HEIGHT) * 135 - 3}px`,
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: t.solved ? '#10b981' : (t.sabotaged ? '#ef4444' : '#f59e0b')
                }}
              />
            ))}

            {/* Local Player Blip */}
            <div
              style={{
                position: 'absolute',
                left: `${(localPos.x / MAP_WIDTH) * 180 - 4}px`,
                top: `${(localPos.y / MAP_HEIGHT) * 135 - 4}px`,
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                border: '2px solid #38bdf8',
                boxShadow: '0 0 8px #38bdf8'
              }}
            />

            <div style={{ position: 'absolute', bottom: '4px', right: '6px', fontSize: '8px', color: '#64748b' }}>
              RADAR // 2400x1800
            </div>
          </div>
        )}
      </div>

      {/* =====================================================================
          WARDROBE / OPERATIVE CUSTOMIZER MODAL
          ===================================================================== */}
      {showWardrobe && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(5, 7, 13, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100
          }}
        >
          <div
            style={{
              width: '460px',
              backgroundColor: '#0f172a',
              border: '1px solid #38bdf8',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.9), 0 0 30px rgba(56, 189, 248, 0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '12px', marginBottom: '18px' }}>
              <span style={{ fontSize: '14px', fontWeight: 800, color: '#38bdf8' }}>
                TACTICAL WARDROBE // ARMOR CUSTOMIZER
              </span>
              <button
                onClick={() => setShowWardrobe(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Suit Colors */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', fontWeight: 600, marginBottom: '8px' }}>
                EXO-SUIT ARMOR COLORWAY
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                {PLAYER_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => {
                      setSelectedColor(c.hex);
                      socket.emit('update_appearance', { roomId, color: c.hex, visorColor: selectedVisor, operativeTitle: selectedTitle });
                    }}
                    style={{
                      height: '32px',
                      borderRadius: '6px',
                      backgroundColor: c.hex,
                      border: selectedColor === c.hex ? '3px solid #ffffff' : '2px solid #000000',
                      boxShadow: selectedColor === c.hex ? `0 0 12px ${c.hex}` : 'none',
                      cursor: 'pointer'
                    }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Visor Glow */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', fontWeight: 600, marginBottom: '8px' }}>
                TACTICAL AR VISOR GLOW
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {VISOR_COLORS.map((v) => (
                  <button
                    key={v.hex}
                    type="button"
                    onClick={() => {
                      setSelectedVisor(v.hex);
                      socket.emit('update_appearance', { roomId, color: selectedColor, visorColor: v.hex, operativeTitle: selectedTitle });
                    }}
                    style={{
                      flex: 1,
                      height: '28px',
                      borderRadius: '6px',
                      backgroundColor: v.hex,
                      border: selectedVisor === v.hex ? '3px solid #ffffff' : '2px solid #000000',
                      boxShadow: selectedVisor === v.hex ? `0 0 10px ${v.hex}` : 'none',
                      cursor: 'pointer'
                    }}
                    title={v.name}
                  />
                ))}
              </div>
            </div>

            {/* Operative Title */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', fontWeight: 600, marginBottom: '8px' }}>
                OPERATIVE SPECIALIZATION CLASS
              </label>
              <select
                value={selectedTitle}
                onChange={(e) => {
                  setSelectedTitle(e.target.value);
                  socket.emit('update_appearance', { roomId, color: selectedColor, visorColor: selectedVisor, operativeTitle: e.target.value });
                }}
                style={{ width: '100%', padding: '8px 12px', backgroundColor: '#090d16', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
              >
                {OPERATIVE_TITLES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowWardrobe(false)}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#0284c7',
                border: 'none',
                borderRadius: '6px',
                color: '#fff',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              SAVE & CLOSE WARDROBE
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          MONACO IDE MODAL (Terminal Debugging)
          ===================================================================== */}
      {activeTerminal && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(5, 7, 13, 0.92)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            zIndex: 90
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '900px',
              height: '85vh',
              backgroundColor: '#090d16',
              border: '1px solid #38bdf8',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 35px rgba(56, 189, 248, 0.25)'
            }}
          >
            {/* Terminal Header */}
            <div
              style={{
                height: '48px',
                backgroundColor: '#0f172a',
                borderBottom: '1px solid #1e293b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Terminal size={18} color="#38bdf8" />
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc' }}>
                  {activeTerminal.name}
                </span>
                <span style={{ fontSize: '10px', color: '#64748b' }}>({activeTerminal.roomName})</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => {
                    setIsRunningTests(true);
                    socket.emit('run_terminal_tests', {
                      roomId,
                      terminalId: activeTerminal.id,
                      userCode: terminalCode
                    });
                  }}
                  disabled={isRunningTests}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    backgroundColor: '#0284c7',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: isRunningTests ? 'wait' : 'pointer'
                  }}
                >
                  <Play size={14} /> {isRunningTests ? 'EVALUATING...' : 'RUN TEST SUITE ➔'}
                </button>

                <button
                  onClick={() => setActiveTerminal(null)}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Split View: Spec / Editor */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
              {/* Left Column: Spec & Test Results */}
              <div style={{ width: '340px', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', backgroundColor: '#090d16' }}>
                <div style={{ padding: '16px', borderBottom: '1px solid #1e293b', flex: 1, overflowY: 'auto' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#38bdf8' }}>MISSION SPECIFICATION:</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#cbd5e1', lineHeight: '1.5' }}>
                    {activeTerminal.description}
                  </p>

                  {/* Test Results Output */}
                  {testResults && (
                    <div style={{ marginTop: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: testResults.isSolved ? '#10b981' : '#ef4444' }}>
                          TESTS: {testResults.passedCount} / {testResults.total} PASSED
                        </span>
                        {testResults.isSolved && (
                          <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 700 }}>STABILIZED!</span>
                        )}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {testResults.logs?.map((l, i) => (
                          <div
                            key={i}
                            style={{
                              padding: '8px',
                              borderRadius: '6px',
                              backgroundColor: l.passed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              border: l.passed ? '1px solid #059669' : '1px solid #dc2626',
                              fontSize: '11px'
                            }}
                          >
                            <div style={{ fontWeight: 700, color: l.passed ? '#10b981' : '#f87171' }}>
                              Test #{l.testNumber}: {l.passed ? 'PASSED' : 'FAILED'}
                            </div>
                            <div style={{ color: '#94a3b8', fontSize: '10px', marginTop: '2px' }}>Input: {l.input}</div>
                            <div style={{ color: '#cbd5e1', fontSize: '10px' }}>Expected: {l.expected}</div>
                            {l.output && <div style={{ color: '#38bdf8', fontSize: '10px' }}>Got: {l.output}</div>}
                            {l.error && <div style={{ color: '#f87171', fontSize: '10px' }}>Error: {l.error}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Monaco IDE */}
              <div style={{ flex: 1, height: '100%' }}>
                <Editor
                  height="100%"
                  theme="vs-dark"
                  language="javascript"
                  value={terminalCode}
                  onChange={(val) => setTerminalCode(val || '')}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    fontFamily: "'JetBrains Mono', Consolas, monospace",
                    scrollBeyondLastLine: false,
                    padding: { top: 12 }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          EMERGENCY STANDUP MODAL (Voting & Debate Screen)
          ===================================================================== */}
      {phase === 'VOTING' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(5, 7, 13, 0.95)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '24px',
            zIndex: 95
          }}
        >
          {/* Voting Header */}
          <div style={{ textAlign: 'center', marginBottom: '18px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#f87171', fontSize: '12px', fontWeight: 800, marginBottom: '8px' }}>
              <AlertTriangle size={14} /> EMERGENCY LOCKDOWN MEETING // TIME REMAINING: {timer}s
            </div>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: '#f8fafc' }}>
              DEDUCE THE INFILTRATORS
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
              Caller: <span style={{ color: '#38bdf8' }}>{emergencyCaller || 'Station Power Grid'}</span>. Cast your ballot or skip vote.
            </p>
          </div>

          {/* Voting Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', width: '100%', maxWidth: '840px', marginBottom: '20px' }}>
            {players.filter((p) => p.isAlive).map((suspect) => {
              const hasVoted = Boolean(suspect.votedFor);
              return (
                <div
                  key={suspect.id}
                  style={{
                    padding: '16px',
                    backgroundColor: votedSuspect === suspect.id ? '#1e293b' : '#0f172a',
                    border: votedSuspect === suspect.id ? '2px solid #38bdf8' : '1px solid #334155',
                    borderRadius: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    position: 'relative'
                  }}
                >
                  <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: suspect.color }} />
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc' }}>
                    {suspect.username} {suspect.id === socket.id && '(YOU)'}
                  </span>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>
                    {hasVoted ? '✓ Ballot Cast' : 'Thinking...'}
                  </span>

                  {suspect.id !== socket.id && !votedSuspect && (
                    <button
                      onClick={() => {
                        setVotedSuspect(suspect.id);
                        socket.emit('cast_vote', { roomId, suspectId: suspect.id });
                      }}
                      style={{
                        width: '100%',
                        padding: '8px',
                        marginTop: '4px',
                        backgroundColor: '#dc2626',
                        border: 'none',
                        borderRadius: '6px',
                        color: '#fff',
                        fontSize: '11px',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      VOTE SUSPECT 🎯
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Skip Vote Button */}
          {!votedSuspect && (
            <button
              onClick={() => {
                setVotedSuspect('SKIP');
                socket.emit('cast_vote', { roomId, suspectId: 'SKIP' });
              }}
              style={{
                padding: '10px 24px',
                backgroundColor: '#334155',
                border: '1px solid #64748b',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                marginBottom: '16px'
              }}
            >
              SKIP BALLOT / INSUFFICIENT EVIDENCE
            </button>
          )}

          {/* Live Standup Debate Comms Chat */}
          <div style={{ width: '100%', maxWidth: '840px', height: '160px', backgroundColor: '#090d16', border: '1px solid #1e293b', borderRadius: '8px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ flex: 1, padding: '10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {chatMessages.map((msg, idx) => (
                <div key={idx} style={{ fontSize: '11px' }}>
                  <span style={{ color: msg.color || '#38bdf8', fontWeight: 700 }}>[{msg.sender}]: </span>
                  <span style={{ color: msg.system ? '#f59e0b' : '#cbd5e1' }}>{msg.text}</span>
                </div>
              ))}
              <div ref={chatBottomRef} />
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!chatInput.trim()) return;
                socket.emit('send_chat', { roomId, message: chatInput });
                setChatInput('');
              }}
              style={{ display: 'flex', borderTop: '1px solid #1e293b' }}
            >
              <input
                type="text"
                placeholder="State your defense or report suspicious activity..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                style={{ flex: 1, padding: '8px 12px', backgroundColor: '#0f172a', border: 'none', color: '#fff', fontSize: '12px' }}
              />
              <button
                type="submit"
                style={{ padding: '0 16px', backgroundColor: '#0284c7', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                TRANSMIT
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          GAME OVER / MISSION DEBRIEF MODAL
          ===================================================================== */}
      {phase === 'GAME_OVER' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(5, 7, 13, 0.96)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 110
          }}
        >
          <div
            style={{
              width: '540px',
              backgroundColor: '#0f172a',
              border: gameWinner === 'DEVELOPERS' ? '2px solid #10b981' : '2px solid #ef4444',
              borderRadius: '16px',
              padding: '32px',
              textAlign: 'center',
              boxShadow: gameWinner === 'DEVELOPERS' ? '0 0 50px rgba(16, 185, 129, 0.3)' : '0 0 50px rgba(239, 68, 68, 0.3)'
            }}
          >
            <Trophy size={48} color={gameWinner === 'DEVELOPERS' ? '#10b981' : '#ef4444'} style={{ margin: '0 auto 12px auto' }} />
            <h2 style={{ fontSize: '32px', fontWeight: 900, color: gameWinner === 'DEVELOPERS' ? '#10b981' : '#ef4444', margin: '0 0 8px 0' }}>
              {gameWinner === 'DEVELOPERS' ? 'MISSION SUCCESS // CREW VICTORY' : 'MISSION FAILED // INFILTRATORS WON'}
            </h2>
            <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.5', margin: '0 0 20px 0' }}>
              {winReason}
            </p>

            {/* Unmasking Roster */}
            <div style={{ backgroundColor: '#090d16', border: '1px solid #1e293b', borderRadius: '8px', padding: '12px', marginBottom: '24px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', marginBottom: '8px' }}>
                SECRET ROLES UNMASKED:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {players.map((p) => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', padding: '4px 8px' }}>
                    <span style={{ color: p.color, fontWeight: 700 }}>{p.username}</span>
                    <span style={{ color: p.role === 'MAFIA' ? '#f87171' : '#34d399', fontWeight: 800 }}>
                      {p.role === 'MAFIA' ? 'INFILTRATOR (MAFIA)' : 'CREW DEVELOPER'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {isHost && (
              <button
                onClick={() => socket.emit('start_game', { roomId })}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: '#0284c7',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  letterSpacing: '1px'
                }}
              >
                REMATCH // PLAY AGAIN ➔
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}