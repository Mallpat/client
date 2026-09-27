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
  Maximize2,
  Megaphone
} from 'lucide-react';
import {
  CREWMATE_COLORS,
  CREWMATE_HATS,
  getCrewmateColor,
  getHero,
  drawCrewmate,
  drawDeadBody,
  drawVent,
  drawVentArrow,
  drawDropshipLobby,
  drawRoleReveal,
  drawThanosSnap,
  VENTS,
  AVENGERS_HEROES,
  drawAvenger,
  drawFallenRelic
} from './amongus';
import {
  playVentSound,
  playEmergencyAlarm,
  playTaskCompleteSound,
  playKillSound,
  playVoteSound,
  playStepSound
} from './audio';
import { CrewmatePreview } from './CrewmatePreview';

// Safe canvas roundRect polyfill for broad browser compatibility
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r = 0) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
    return this;
  };
}

const PROD_SERVER_URL = 'https://code-mafia-server.onrender.com';

const getInitialServerUrl = () => {
  if (typeof window !== 'undefined') {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const saved = localStorage.getItem('code_mafia_server_url');
    
    if (saved && saved.trim()) {
      const trimmed = saved.trim().replace(/\/$/, '');
      // If deployed on Vercel/remote domain, disregard obsolete localhost URLs
      if (!isLocalhost && (trimmed.includes('localhost') || trimmed.includes('127.0.0.1'))) {
        localStorage.removeItem('code_mafia_server_url');
      } else {
        return trimmed;
      }
    }
    
    if (import.meta.env.VITE_SERVER_URL) {
      return import.meta.env.VITE_SERVER_URL.trim().replace(/\/$/, '');
    }
    
    if (isLocalhost) {
      return 'http://localhost:5000';
    }
    
    return PROD_SERVER_URL;
  }
  return import.meta.env.VITE_SERVER_URL || PROD_SERVER_URL;
};

const SERVER_URL = getInitialServerUrl();
const socket = io(SERVER_URL || PROD_SERVER_URL, {
  autoConnect: true,
  reconnectionAttempts: 30,
  reconnectionDelay: 1000,
  transports: ['websocket', 'polling']
});

// Backward-compatible fallback colorways
const PLAYER_COLORS = AVENGERS_HEROES.map((h) => ({
  name: h.name,
  hex: h.primaryColor,
  glow: h.glowColor
}));

const VISOR_COLORS = AVENGERS_HEROES.map((h) => ({
  name: h.name + ' Glow',
  hex: h.visorColor
}));

const OPERATIVE_TITLES = [
  'Crewmate',
  'Captain',
  'Engineer',
  'Scientist',
  'Detective',
  'Security Guard',
  'Medic',
  'Navigator',
  'Electrician'
];

const RANDOM_NAMES = [
  'RedSus',
  'Cyan',
  'Crewmate',
  'Detective',
  'Captain',
  'Navigator',
  'Engineer',
  'Scientist',
  'Ghost',
  'Skipper',
  'Sheriff',
  'Innocent'
];

// Map Dimensions (Expanded Dreadnought Megastructure: 3600 x 2700)
const MAP_WIDTH = 3600;
const MAP_HEIGHT = 2700;

// Walkable Starship Deck Regions (Rooms and Overlapping Corridors)
const WALKABLE_BOXES = [
  // Central Atrium & Waiting Deck
  { id: 'atrium', x1: 1340, y1: 1040, x2: 2260, y2: 1660 },

  // Sector 1: Command Bridge (North)
  { id: 'bridge', x1: 1340, y1: 180, x2: 2260, y2: 800 },
  // North Corridor (Bridge <-> Atrium)
  { id: 'corr_n', x1: 1720, y1: 760, x2: 1880, y2: 1080 },

  // Sector 2: AI & Quantum Mainframe (North-West)
  { id: 'mainframe', x1: 250, y1: 200, x2: 1050, y2: 850 },
  // North-West Corridor (Mainframe <-> Central North)
  { id: 'corr_nw', x1: 1010, y1: 560, x2: 1380, y2: 720 },

  // Sector 3: Communications & Sensor Array (North-East)
  { id: 'sensors', x1: 2550, y1: 200, x2: 3350, y2: 850 },
  // North-East Corridor (Central North <-> Sensors)
  { id: 'corr_ne', x1: 2220, y1: 560, x2: 2590, y2: 720 },

  // Sector 4: Security & Surveillance Vault (West)
  { id: 'vault', x1: 200, y1: 1100, x2: 1000, y2: 1850 },
  // West Corridor (Vault <-> Central Atrium)
  { id: 'corr_w', x1: 960, y1: 1320, x2: 1380, y2: 1480 },

  // Sector 5: Cybernetics & Bio-Lab (East)
  { id: 'biolab', x1: 2600, y1: 1100, x2: 3400, y2: 1850 },
  // East Corridor (Central Atrium <-> Bio-Lab)
  { id: 'corr_e', x1: 2220, y1: 1320, x2: 2640, y2: 1480 },

  // Sector 6: Quantum Hyper-Reactor Core (South)
  { id: 'reactor', x1: 1340, y1: 1900, x2: 2260, y2: 2550 },
  // South Corridor (Central Atrium <-> Reactor)
  { id: 'corr_s', x1: 1720, y1: 1620, x2: 1880, y2: 1940 },

  // West Auxiliary Corridor (Mainframe <-> Vault)
  { id: 'corr_aux_w', x1: 580, y1: 810, x2: 720, y2: 1140 },

  // East Auxiliary Corridor (Sensors <-> Bio-Lab)
  { id: 'corr_aux_e', x1: 2880, y1: 810, x2: 3020, y2: 1140 }
];

const CLIENT_TERMINALS = [
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

function evaluateTerminalLocally(terminal, userCode) {
  let passedCount = 0;
  const testLogs = [];

  terminal.tests.forEach((test, idx) => {
    try {
      const fn = new Function('return ' + userCode)();
      if (typeof fn !== 'function') {
        throw new Error("Function '" + terminal.functionName + "' is not defined.");
      }

      const inputCopy = JSON.parse(JSON.stringify(test.input));
      const result = fn(...inputCopy);
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

function isPositionWalkable(x, y, phase) {
  const R = 14; // Operative hit-box collision radius

  if (phase === 'LOBBY') {
    // Strictly restricted inside Dropship Waiting Room (Spacious 1400x860 cabin):
    if (x < 1140 || x > 2460 || y < 1010 || y > 1740) {
      return false;
    }
    // Prop Barrier: Customization Crate & Laptop Pod
    if (Math.hypot(x - 1550, y - 1250) < 36) return false;
    return true;
  }

  // Active Game (DAY / NIGHT): Must be inside at least one walkable room or corridor
  const inDeck = WALKABLE_BOXES.some(
    (b) => x >= b.x1 + R && x <= b.x2 - R && y >= b.y1 + R && y <= b.y2 - R
  );
  if (!inDeck) return false;

  // Specific solid prop obstacles & containment barriers across all sectors
  if (Math.hypot(x - 1800, y - 1350) < 46) return false; // Central Emergency Standup
  if (Math.hypot(x - 1800, y - 2250) < 60) return false; // Reactor Core Containment
  if (Math.hypot(x - 1800, y - 400) < 44) return false;  // Hologram Table Pedestal
  if (Math.hypot(x - 650, y - 500) < 40) return false;   // Mainframe Fan Pedestal
  if (Math.hypot(x - 2950, y - 500) < 42) return false;  // Radar Console Pedestal
  if (Math.hypot(x - 550, y - 1450) < 40) return false;  // Vault Console Pedestal
  if (Math.hypot(x - 3050, y - 1450) < 44) return false; // Bio-Lab Cryo-Stasis Chamber
  if (x >= 1515 && x <= 1585 && y >= 1105 && y <= 1195) return false; // Wardrobe Pod

  return true;
}

function EliminationCinematicModal({ cutscene, onClose }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 640;
    canvas.height = 380;

    const DURATION = 4800; // ms
    const startTime = cutscene.startTime || Date.now();

    const renderFrame = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, Math.max(0, elapsed / DURATION));
      const time = elapsed / 1000;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawThanosSnap(ctx, cutscene.characterId || 'red', progress, time, canvas.width, canvas.height);

      if (progress < 1) {
        animId = requestAnimationFrame(renderFrame);
      } else {
        setTimeout(onClose, 300);
      }
    };

    renderFrame();
    return () => cancelAnimationFrame(animId);
  }, [cutscene, onClose]);

  const colObj = getCrewmateColor(cutscene.characterId || 'red');

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 150
      }}
    >
      <div
        style={{
          width: '680px',
          backgroundColor: '#000000',
          borderRadius: '16px',
          padding: '16px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: '640px',
            height: '380px',
            borderRadius: '10px',
            backgroundColor: '#000000',
            border: '2px solid #1e293b',
            boxShadow: '0 0 40px rgba(0,0,0,1)'
          }}
        />

        <div style={{ marginTop: '14px', width: '100%' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 900, color: colObj.hex, margin: '0 0 8px 0', textShadow: '0 0 10px rgba(0,0,0,0.8)' }}>
            {cutscene.username}
          </h2>
          <div
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              backgroundColor: cutscene.wasMafia ? 'rgba(239, 68, 68, 0.2)' : 'rgba(56, 189, 248, 0.15)',
              border: cutscene.wasMafia ? '1px solid #ef4444' : '1px solid #38bdf8',
              color: cutscene.wasMafia ? '#fca5a5' : '#7dd3fc',
              fontSize: '14px',
              fontWeight: 800,
              display: 'inline-block'
            }}
          >
            {cutscene.message || (cutscene.wasMafia ? `${cutscene.username} was An Impostor.` : `${cutscene.username} was not An Impostor.`)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  // Connection & Room state
  const [connected, setConnected] = useState(socket.connected);
  const [inRoom, setInRoom] = useState(false);
  const [roomId, setRoomId] = useState('spaceship-01');
  const [username, setUsername] = useState(() => {
    return RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
  });

  // Among Us Crewmate Character & Hat State
  const [selectedHero, setSelectedHero] = useState(() => {
    return localStorage.getItem('amongus_color') || localStorage.getItem('code_mafia_hero') || 'red';
  });
  const [selectedHat, setSelectedHat] = useState(() => {
    return localStorage.getItem('amongus_hat') || 'none';
  });
  const selectedHeroObj = useMemo(() => getHero(selectedHero), [selectedHero]);

  const [selectedColor, setSelectedColor] = useState(selectedHeroObj.primaryColor);
  const [selectedVisor, setSelectedVisor] = useState(selectedHeroObj.visorColor);
  const [selectedTitle, setSelectedTitle] = useState(selectedHeroObj.roleTitle);

  // Movement Speed (Synced from Admin/Server, balanced default 2.4)
  const [playerSpeed, setPlayerSpeed] = useState(2.4);
  const playerSpeedRef = useRef(2.4);
  const [showAdminSpeedModal, setShowAdminSpeedModal] = useState(false);

  // Elimination Dramatic Cutscene State
  const [eliminationCutscene, setEliminationCutscene] = useState(null);

  const [showServerConfig, setShowServerConfig] = useState(false);
  const [serverUrlInput, setServerUrlInput] = useState(SERVER_URL || PROD_SERVER_URL);
  const [showWardrobe, setShowWardrobe] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(true);

  // Authoritative State from Server
  const [phase, setPhase] = useState('LOBBY'); // 'LOBBY' | 'DAY' | 'NIGHT' | 'VOTING' | 'GAME_OVER'
  const [timer, setTimer] = useState(600); // 10 minutes (600s) code sprint
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

  // Local Player & Canvas state (Spawn at 1800, 1420 to prevent landing inside table barrier)
  const [localPos, setLocalPos] = useState({ x: 1800, y: 1420 });
  const [activeTerminal, setActiveTerminal] = useState(null); // terminal opened in IDE modal
  const [terminalCode, setTerminalCode] = useState('');
  const [testResults, setTestResults] = useState(null);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [votedSuspect, setVotedSuspect] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [copiedRoom, setCopiedRoom] = useState(false);
  const [nearbyAction, setNearbyAction] = useState(null);
  const [isSoloMode, setIsSoloMode] = useState(false);

  const startSoloSimulation = () => {
    const heroObj = getHero(selectedHero);
    setIsSoloMode(true);
    setPhase('DAY');
    setTimer(600); // 10 minutes (600s) code sprint
    setIsHost(true);
    setMyRole('DEV');
    setTotalTerminals(6);
    setSolvedCount(0);
    setTerminals(CLIENT_TERMINALS);
    setLocalPos({ x: 1800, y: 1420 });
    setRoleReveal({
      startTime: Date.now(),
      role: 'DEV',
      fellowMafia: [],
      hero: selectedHero,
      hat: selectedHat,
      username: username.trim() || 'RedSus'
    });
    roleRevealRef.current = Date.now();
    playEmergencyAlarm();
    setPlayers([
      {
        id: 'local_player',
        username: username.trim() || 'RedSus',
        color: heroObj.primaryColor,
        visorColor: heroObj.visorColor,
        operativeTitle: selectedTitle || heroObj.roleTitle,
        characterId: selectedHero,
        hatId: selectedHat,
        x: 1800,
        y: 1420,
        isMoving: false,
        facingLeft: false,
        role: 'DEV',
        isAlive: true,
        votedFor: null
      },
      {
        id: 'bot_blue',
        username: 'Blue',
        color: '#132ed1',
        visorColor: '#98d0e1',
        operativeTitle: 'Crewmate',
        characterId: 'blue',
        hatId: 'redcap',
        x: 1720,
        y: 1300,
        isMoving: false,
        facingLeft: false,
        role: 'DEV',
        isAlive: true,
        votedFor: null
      },
      {
        id: 'bot_cyan',
        username: 'Cyan',
        color: '#38fedc',
        visorColor: '#98d0e1',
        operativeTitle: 'Crewmate',
        characterId: 'cyan',
        hatId: 'sprout',
        x: 1880,
        y: 1300,
        isMoving: false,
        facingLeft: true,
        role: 'DEV',
        isAlive: true,
        votedFor: null
      }
    ]);
    setChatMessages([
      {
        id: 'init_msg_1',
        sender: 'DREADNOUGHT AI',
        text: '🛸 SOLO SIMULATION ONLINE: All 6 sector engineering terminals active. Explore the dreadnought and fix subsystems!',
        system: true
      },
      {
        id: 'init_msg_2',
        sender: 'Steve_Rogers',
        color: '#2563eb',
        text: 'I will monitor the Central Atrium. Stark, check the Bridge matrix rotation in Sector 1!',
        system: false
      }
    ]);
    setInRoom(true);
  };

  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const keysPressed = useRef({});
  const walkCycleRef = useRef(0);
  const facingLeftRef = useRef(false);
  const playersRef = useRef([]);
  const chatBottomRef = useRef(null);
  const lastMoveEmitTime = useRef(0);
  const particlesRef = useRef([]);

  // Impostor Venting State & Refs
  const [isVented, setIsVented] = useState(false);
  const isVentedRef = useRef(false);
  const [currentVentId, setCurrentVentId] = useState(null);
  const currentVentIdRef = useRef(null);
  const ventAnimMap = useRef({});

  // Role Reveal Intro State & Ref
  const [roleReveal, setRoleReveal] = useState(null);
  const roleRevealRef = useRef(null);

  const triggerVentAnimation = (ventId) => {
    ventAnimMap.current[ventId] = {
      startTime: Date.now(),
      duration: 380
    };
    playVentSound();
  };

  const handleEnterVent = (vent) => {
    if (myRole !== 'MAFIA') return;
    triggerVentAnimation(vent.id);
    setIsVented(true);
    isVentedRef.current = true;
    setCurrentVentId(vent.id);
    currentVentIdRef.current = vent.id;
    setLocalPos({ x: vent.x, y: vent.y });
    socket.emit('player_move', {
      roomId,
      x: vent.x,
      y: vent.y,
      isMoving: false,
      facingLeft: facingLeftRef.current,
      isVented: true
    });
  };

  const handleExitVent = () => {
    if (!isVentedRef.current || !currentVentIdRef.current) return;
    const vent = VENTS.find((v) => v.id === currentVentIdRef.current);
    if (vent) {
      triggerVentAnimation(vent.id);
      setLocalPos({ x: vent.x, y: vent.y + 24 });
    }
    setIsVented(false);
    isVentedRef.current = false;
    setCurrentVentId(null);
    currentVentIdRef.current = null;
    socket.emit('player_move', {
      roomId,
      x: localPos.x,
      y: localPos.y + 24,
      isMoving: false,
      facingLeft: facingLeftRef.current,
      isVented: false
    });
  };

  const handleVentTravel = (targetVentId) => {
    const target = VENTS.find((v) => v.id === targetVentId);
    if (!target) return;
    if (currentVentIdRef.current) {
      triggerVentAnimation(currentVentIdRef.current);
    }
    triggerVentAnimation(target.id);
    setCurrentVentId(target.id);
    currentVentIdRef.current = target.id;
    setLocalPos({ x: target.x, y: target.y });
    socket.emit('player_move', {
      roomId,
      x: target.x,
      y: target.y,
      isMoving: false,
      facingLeft: facingLeftRef.current,
      isVented: true
    });
  };

  // Sync players ref and playerSpeed ref for canvas loop
  useEffect(() => {
    playersRef.current = players;
  }, [players]);

  useEffect(() => {
    playerSpeedRef.current = playerSpeed;
  }, [playerSpeed]);

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
      setPhase((prevPhase) => {
        // When transitioning from LOBBY to DAY, trigger 3.5s Role Reveal Screen and redirect player
        if (prevPhase === 'LOBBY' && data.phase === 'DAY') {
          setRoleReveal({
            startTime: Date.now(),
            role: data.myRole || 'DEV',
            fellowMafia: data.fellowMafia || [],
            hero: selectedHero,
            hat: selectedHat,
            username: username.trim() || 'Player'
          });
          roleRevealRef.current = Date.now();
          playEmergencyAlarm();
          const self = (data.players || []).find((p) => p.id === socket.id);
          if (self && self.x && self.y) {
            setLocalPos({ x: self.x, y: self.y });
          }
        }
        if (prevPhase !== 'VOTING' && data.phase === 'VOTING') {
          playEmergencyAlarm();
        }
        return data.phase;
      });
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

      if (data.playerSpeed) {
        setPlayerSpeed(data.playerSpeed);
        playerSpeedRef.current = data.playerSpeed;
      }

      if (data.lastEjection && data.lastEjection.ejected) {
        setEliminationCutscene({
          username: data.lastEjection.username,
          characterId: data.lastEjection.characterId || 'red',
          wasMafia: data.lastEjection.wasMafia,
          message: data.lastEjection.message,
          startTime: Date.now()
        });
      }

      // Sync local player position if uninitialized
      const self = data.players.find((p) => p.id === socket.id);
      if (self && !keysPressed.current['w'] && !keysPressed.current['s'] && !keysPressed.current['a'] && !keysPressed.current['d']) {
        // Sync gently without overriding active local user inputs
      }
    });

    socket.on('timer_tick', ({ timer: newTimer }) => {
      setTimer(newTimer);
    });

    socket.on('player_moved', ({ id, x, y, isMoving, facingLeft, isVented }) => {
      setPlayers((prev) =>
        prev.map((p) => (p.id === id ? { ...p, x, y, isMoving, facingLeft, isVented } : p))
      );
    });

    socket.on('terminal_test_results', (results) => {
      setIsRunningTests(false);
      setTestResults(results);
      if (results && results.isSolved) {
        playTaskCompleteSound();
      }
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

  // Solo Simulation 10-Minute Code Sprint Timer (10:00 Countdown)
  useEffect(() => {
    if (!isSoloMode || phase === 'LOBBY' || phase === 'GAME_OVER') return;
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isSoloMode, phase]);

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
        if (!isVentedRef.current) {
          keysPressed.current[key] = true;
        } else {
          // Inside vent: A/Left Arrow travels to first connected vent; D/Right Arrow travels to next connected vent
          const curVent = VENTS.find((v) => v.id === currentVentIdRef.current);
          if (curVent && curVent.connections.length > 0) {
            if (['a', 'arrowleft'].includes(key)) {
              handleVentTravel(curVent.connections[0]);
            } else if (['d', 'arrowright'].includes(key)) {
              handleVentTravel(curVent.connections[curVent.connections.length - 1]);
            }
          }
        }
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
            playEmergencyAlarm();
            socket.emit('call_emergency', { roomId });
          }
        } else if (nearbyAction.type === 'wardrobe') {
          setShowWardrobe(true);
        } else if (nearbyAction.type === 'vent' && myRole === 'MAFIA') {
          const nearbyVent = VENTS.find((v) => v.id === nearbyAction.id);
          if (nearbyVent) handleEnterVent(nearbyVent);
        }
      }

      // Sabotage Action with [Q] (Mafia only in Night phase)
      if (key === 'q' && myRole === 'MAFIA' && phase === 'NIGHT' && nearbyAction && nearbyAction.type === 'terminal') {
        playKillSound();
        socket.emit('sabotage_terminal', { roomId, terminalId: nearbyAction.id });
      }

      // Report Dead Body / Call Meeting with [R]
      if (key === 'r' && phase === 'DAY') {
        playEmergencyAlarm();
        socket.emit('call_emergency', { roomId });
      }

      // Vent Action with [V] (Authentic Impostor Vent enter/exit)
      if (key === 'v' && myRole === 'MAFIA') {
        if (isVentedRef.current) {
          handleExitVent();
        } else {
          const nearbyVent = VENTS.find((v) => Math.hypot(localPos.x - v.x, localPos.y - v.y) < 85);
          if (nearbyVent) {
            handleEnterVent(nearbyVent);
          }
        }
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

    // Dynamic responsive viewport sizing (full-bleed for laptop & desktop)
    const updateSize = () => {
      const container = containerRef.current || canvas.parentElement;
      if (container) {
        const rect = container.getBoundingClientRect();
        const w = Math.floor(rect.width) || window.innerWidth;
        const h = Math.floor(rect.height) || (window.innerHeight - 56);
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
        }
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    // Movement physics & collision boundaries (Balanced default 2.4, controlled by Admin)
    const SPEED = playerSpeedRef.current || 2.4;
    const ZOOM = 0.82;

    const render = () => {
      try {
        const time = Date.now() / 1000;

        // 1. Movement Calculations
        let dx = 0;
        let dy = 0;
        const k = keysPressed.current;

      if (k['w'] || k['arrowup']) dy -= 1;
      if (k['s'] || k['arrowdown']) dy += 1;
      if (k['a'] || k['arrowleft']) dx -= 1;
      if (k['d'] || k['arrowright']) dx += 1;

      const isMoving = !isVentedRef.current && (dx !== 0 || dy !== 0) && activeTerminal === null && phase !== 'VOTING' && phase !== 'GAME_OVER';

      if (isMoving) {
        playStepSound();
        if (dx < 0) facingLeftRef.current = true;
        if (dx > 0) facingLeftRef.current = false;

        // Normalize diagonal speed
        if (dx !== 0 && dy !== 0) {
          dx *= 0.7071;
          dy *= 0.7071;
        }

        walkCycleRef.current += 0.22;

        setLocalPos((prev) => {
          let nextX = prev.x;
          let nextY = prev.y;

          const targetX = prev.x + dx * SPEED;
          const targetY = prev.y + dy * SPEED;

          if (isPositionWalkable(targetX, targetY, phase)) {
            nextX = targetX;
            nextY = targetY;
          } else {
            // Slide along X axis if possible
            if (isPositionWalkable(targetX, prev.y, phase)) {
              nextX = targetX;
            }
            // Slide along Y axis if possible
            if (isPositionWalkable(prev.x, targetY, phase)) {
              nextY = targetY;
            }
          }

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

      // 2. Camera Viewport Tracking (Spacious Laptop Viewport with Zoom Factor 0.82)
      const viewWidth = canvas.width / ZOOM;
      const viewHeight = canvas.height / ZOOM;

      const cameraX = Math.max(0, Math.min(MAP_WIDTH - viewWidth, localPos.x - viewWidth / 2));
      const cameraY = Math.max(0, Math.min(MAP_HEIGHT - viewHeight, localPos.y - viewHeight / 2));

      // 3. Render Deep Space Background
      const bgGrad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height));
      bgGrad.addColorStop(0, '#040a18');
      bgGrad.addColorStop(0.5, '#030810');
      bgGrad.addColorStop(1, '#020508');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.scale(ZOOM, ZOOM);
      ctx.translate(-cameraX, -cameraY);

      // Nebula clouds (large atmospheric blobs)
      const nebulaPositions = [
        { x: 900, y: 600, r: 400, c1: 'rgba(6,182,212,0.04)', c2: 'rgba(0,0,0,0)' },
        { x: 2700, y: 400, r: 350, c1: 'rgba(245,158,11,0.04)', c2: 'rgba(0,0,0,0)' },
        { x: 1800, y: 2100, r: 500, c1: 'rgba(139,92,246,0.05)', c2: 'rgba(0,0,0,0)' },
        { x: 3200, y: 1500, r: 320, c1: 'rgba(16,185,129,0.04)', c2: 'rgba(0,0,0,0)' },
        { x: 400, y: 1800, r: 380, c1: 'rgba(239,68,68,0.03)', c2: 'rgba(0,0,0,0)' },
      ];
      nebulaPositions.forEach(n => {
        const ng = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
        ng.addColorStop(0, n.c1); ng.addColorStop(1, n.c2);
        ctx.fillStyle = ng;
        ctx.fillRect(n.x - n.r, n.y - n.r, n.r * 2, n.r * 2);
      });

      // Layered starfield: 500+ stars with twinkling
      for (let i = 0; i < 500; i++) {
        const starX = (i * 137.508 + 23) % MAP_WIDTH;
        const starY = (i * 97.319 + 11) % MAP_HEIGHT;
        const twinkle = 0.3 + Math.sin(time * 2 + i * 0.7) * 0.35 + 0.35;
        const starSize = i % 20 === 0 ? 3 : i % 5 === 0 ? 2 : i % 2 === 0 ? 1.5 : 1;
        const hue = i % 10 === 0 ? 190 : i % 7 === 0 ? 60 : 0;
        ctx.fillStyle = `hsla(${hue}, 40%, 90%, ${twinkle * 0.7})`;
        ctx.beginPath();
        ctx.arc(starX, starY, starSize * 0.5, 0, Math.PI * 2);
        ctx.fill();
        // Bright star cross-glint
        if (i % 20 === 0) {
          ctx.strokeStyle = `rgba(255,255,255,${twinkle * 0.5})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(starX - 6, starY); ctx.lineTo(starX + 6, starY);
          ctx.moveTo(starX, starY - 6); ctx.lineTo(starX, starY + 6);
          ctx.stroke();
        }
      }

      // =======================================================================
      // DRAW EXPANDED 3600 x 2700 DREADNOUGHT MEGASTRUCTURE SECTORS & PROPS
      // =======================================================================

      // -----------------------------------------------------------------------
      // OUTER DREADNOUGHT HULL ARMOR (multi-layer with beveled edges)
      // -----------------------------------------------------------------------
      // Outer hull shadow
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 40;
      ctx.fillStyle = '#04080f';
      ctx.strokeStyle = '#0f1f3a';
      ctx.lineWidth = 24;
      ctx.beginPath();
      ctx.roundRect(80, 80, MAP_WIDTH - 160, MAP_HEIGHT - 160, 20);
      ctx.stroke();
      ctx.fill();
      ctx.shadowBlur = 0;

      // Hull inner bevel line
      ctx.strokeStyle = 'rgba(6,182,212,0.08)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(96, 96, MAP_WIDTH - 192, MAP_HEIGHT - 192, 16);
      ctx.stroke();

      // Corner reinforcement plates
      const cornerColor = '#0f1f3a';
      for (const [cx2, cy2, sx, sy] of [
        [80, 80, 1, 1], [MAP_WIDTH-80, 80, -1, 1],
        [80, MAP_HEIGHT-80, 1, -1], [MAP_WIDTH-80, MAP_HEIGHT-80, -1, -1]
      ]) {
        ctx.fillStyle = cornerColor;
        ctx.beginPath();
        ctx.moveTo(cx2, cy2);
        ctx.lineTo(cx2 + sx * 120, cy2);
        ctx.lineTo(cx2, cy2 + sy * 120);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(6,182,212,0.15)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // -----------------------------------------------------------------------
      // TACTICAL CORRIDORS with gradient floors and chevron markings
      // -----------------------------------------------------------------------
      const corridors = [
        { x: 1720, y: 760,  w: 160, h: 320, dir: 'v' },
        { x: 1720, y: 1620, w: 160, h: 320, dir: 'v' },
        { x: 960,  y: 1320, w: 420, h: 160, dir: 'h' },
        { x: 2220, y: 1320, w: 420, h: 160, dir: 'h' },
        { x: 1010, y: 560,  w: 370, h: 160, dir: 'h' },
        { x: 2220, y: 560,  w: 370, h: 160, dir: 'h' },
        { x: 580,  y: 810,  w: 140, h: 330, dir: 'v' },
        { x: 2880, y: 810,  w: 140, h: 330, dir: 'v' },
      ];
      corridors.forEach(({ x, y, w, h, dir }) => {
        // Floor gradient
        const cg = ctx.createLinearGradient(x, y, dir === 'h' ? x + w : x, dir === 'v' ? y + h : y);
        cg.addColorStop(0,   '#081323');
        cg.addColorStop(0.5, '#0d1f38');
        cg.addColorStop(1,   '#081323');
        ctx.fillStyle = cg;
        ctx.fillRect(x, y, w, h);
        // Border
        ctx.strokeStyle = 'rgba(51,65,85,0.7)';
        ctx.lineWidth = 5;
        ctx.strokeRect(x, y, w, h);
        // Center line stripe
        ctx.strokeStyle = 'rgba(6,182,212,0.1)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([12, 8]);
        ctx.beginPath();
        if (dir === 'h') {
          ctx.moveTo(x, y + h / 2); ctx.lineTo(x + w, y + h / 2);
        } else {
          ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w / 2, y + h);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Floor Chevron Directional Markings
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.22)';
      ctx.lineWidth = 2;
      for (let cy2 = 800; cy2 < 1040; cy2 += 36) {
        ctx.beginPath();
        ctx.moveTo(1778, cy2); ctx.lineTo(1800, cy2 - 14); ctx.lineTo(1822, cy2);
        ctx.stroke();
      }
      for (let cy2 = 1680; cy2 < 1900; cy2 += 36) {
        ctx.beginPath();
        ctx.moveTo(1778, cy2); ctx.lineTo(1800, cy2 + 14); ctx.lineTo(1822, cy2);
        ctx.stroke();
      }

      // =======================================================================
      // SECTOR 1: COMMAND BRIDGE (North: 1340-2260, y: 180-800)
      // =======================================================================
      const bridgeGrad = ctx.createLinearGradient(1340, 180, 2260, 800);
      bridgeGrad.addColorStop(0, '#060f22');
      bridgeGrad.addColorStop(0.5, '#0d1f3c');
      bridgeGrad.addColorStop(1, '#060f22');
      ctx.fillStyle = bridgeGrad;
      ctx.fillRect(1340, 180, 920, 620);
      // Glowing cyan border
      ctx.save();
      ctx.shadowColor = '#06b6d4'; ctx.shadowBlur = 16;
      ctx.strokeStyle = '#0891b2'; ctx.lineWidth = 8;
      ctx.strokeRect(1340, 180, 920, 620);
      ctx.strokeStyle = 'rgba(6,182,212,0.3)'; ctx.lineWidth = 2;
      ctx.strokeRect(1346, 186, 908, 608);
      ctx.restore();

      // Floor grid pattern
      ctx.strokeStyle = 'rgba(6,182,212,0.06)';
      ctx.lineWidth = 1;
      for (let gx = 1380; gx < 2260; gx += 60) {
        ctx.beginPath(); ctx.moveTo(gx, 180); ctx.lineTo(gx, 800); ctx.stroke();
      }
      for (let gy = 220; gy < 800; gy += 60) {
        ctx.beginPath(); ctx.moveTo(1340, gy); ctx.lineTo(2260, gy); ctx.stroke();
      }

      // Panoramic Forward Viewport
      const viewGrad = ctx.createLinearGradient(1440, 190, 1440, 246);
      viewGrad.addColorStop(0, '#030c1f'); viewGrad.addColorStop(1, '#020812');
      ctx.fillStyle = viewGrad;
      ctx.fillRect(1440, 190, 720, 56);
      ctx.save();
      ctx.shadowColor = '#38bdf8'; ctx.shadowBlur = 8;
      ctx.strokeStyle = '#0284c7'; ctx.lineWidth = 2;
      ctx.strokeRect(1440, 190, 720, 56);
      // Stars in viewport
      for (let vi = 0; vi < 30; vi++) {
        const vx = 1448 + (vi * 137) % 704;
        const vy = 198 + (vi * 53) % 38;
        const va = 0.3 + Math.sin(time + vi) * 0.3;
        ctx.fillStyle = `rgba(255,255,255,${va})`;
        ctx.fillRect(vx, vy, vi % 3 === 0 ? 2 : 1, vi % 3 === 0 ? 2 : 1);
      }
      ctx.fillStyle = '#22d3ee';
      ctx.font = "bold 10px 'Orbitron', 'JetBrains Mono', monospace";
      ctx.textAlign = 'center';
      ctx.fillText('◈ FORWARD TACTICAL VIEWPORT // DEEP SPACE SECTOR OMEGA ◈', 1800, 223);
      ctx.restore();

      // Holographic Star-Chart Projector at (1800, 400)
      ctx.save();
      ctx.translate(1800, 400);
      // Platform
      const platGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 58);
      platGrad.addColorStop(0, '#1a2840'); platGrad.addColorStop(1, '#0a1525');
      ctx.beginPath(); ctx.arc(0, 0, 58, 0, Math.PI * 2);
      ctx.fillStyle = platGrad; ctx.fill();
      ctx.shadowColor = '#06b6d4'; ctx.shadowBlur = 20;
      ctx.strokeStyle = '#0284c7'; ctx.lineWidth = 4;
      ctx.stroke(); ctx.shadowBlur = 0;

      // Rotating hologram globe
      ctx.strokeStyle = 'rgba(6,182,212,0.9)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, 38, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = 'rgba(6,182,212,0.6)';
      ctx.beginPath(); ctx.ellipse(0, 0, 38, Math.abs(Math.cos(time)) * 38, time, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(0, 0, Math.abs(Math.sin(time)) * 38, 38, -time, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = 'rgba(6,182,212,0.35)';
      ctx.beginPath(); ctx.ellipse(0, 0, 38, 12, time * 0.5, 0, Math.PI * 2); ctx.stroke();

      // Orbiting data glints
      for (let oi = 0; oi < 3; oi++) {
        const oa = time * 2 + (oi / 3) * Math.PI * 2;
        const or2 = 44 + oi * 4;
        ctx.save();
        ctx.shadowColor = '#38bdf8'; ctx.shadowBlur = 8;
        ctx.fillStyle = oi === 0 ? '#38bdf8' : oi === 1 ? '#f59e0b' : '#a78bfa';
        ctx.beginPath(); ctx.arc(Math.cos(oa) * or2, Math.sin(oa) * or2, oi === 0 ? 5 : 3.5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      ctx.restore();

      // =======================================================================
      // SECTOR 2: AI & QUANTUM MAINFRAME (North-West: x: 250-1050, y: 200-850)
      // =======================================================================
      const mainframeGrad = ctx.createLinearGradient(250, 200, 1050, 850);
      mainframeGrad.addColorStop(0, '#06020e'); mainframeGrad.addColorStop(0.5, '#0d0a1e'); mainframeGrad.addColorStop(1, '#06020e');
      ctx.fillStyle = mainframeGrad;
      ctx.fillRect(250, 200, 800, 650);
      ctx.save();
      ctx.shadowColor = '#6366f1'; ctx.shadowBlur = 16;
      ctx.strokeStyle = '#4f46e5'; ctx.lineWidth = 8;
      ctx.strokeRect(250, 200, 800, 650);
      ctx.strokeStyle = 'rgba(99,102,241,0.25)'; ctx.lineWidth = 2;
      ctx.strokeRect(256, 206, 788, 638);
      ctx.restore();

      // Floor grid (indigo)
      ctx.strokeStyle = 'rgba(99,102,241,0.06)'; ctx.lineWidth = 1;
      for (let gx = 290; gx < 1050; gx += 55) {
        ctx.beginPath(); ctx.moveTo(gx, 200); ctx.lineTo(gx, 850); ctx.stroke();
      }

      // Server racks with blinking LEDs
      for (let r = 0; r < 4; r++) {
        const sx = 310 + r * 120;
        const rackGrad = ctx.createLinearGradient(sx, 270, sx + 70, 270);
        rackGrad.addColorStop(0, '#16102a'); rackGrad.addColorStop(1, '#1e1636');
        ctx.fillStyle = rackGrad;
        ctx.fillRect(sx, 270, 70, 380);
        ctx.save();
        ctx.shadowColor = '#4f46e5'; ctx.shadowBlur = 8;
        ctx.strokeStyle = '#4f46e5'; ctx.lineWidth = 2;
        ctx.strokeRect(sx, 270, 70, 380);
        ctx.restore();
        for (let b = 0; b < 9; b++) {
          const isBlink = Math.sin(time * 5 + r * 2 + b) > 0;
          ctx.save();
          ctx.shadowColor = isBlink ? '#10b981' : '#4f46e5'; ctx.shadowBlur = 6;
          ctx.fillStyle = isBlink ? '#10b981' : '#1e1b4b';
          ctx.fillRect(sx + 10, 292 + b * 39, 16, 11);
          ctx.fillStyle = !isBlink ? '#38bdf8' : '#1e1b4b';
          ctx.fillRect(sx + 40, 292 + b * 39, 16, 11);
          ctx.restore();
        }
      }

      // Quantum cooling fan terminal at (650, 500)
      ctx.save();
      ctx.translate(650, 500);
      const fanPlatGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 54);
      fanPlatGrad.addColorStop(0, '#18104a'); fanPlatGrad.addColorStop(1, '#0a0720');
      ctx.beginPath(); ctx.arc(0, 0, 54, 0, Math.PI * 2);
      ctx.fillStyle = fanPlatGrad; ctx.fill();
      ctx.shadowColor = '#6366f1'; ctx.shadowBlur = 18;
      ctx.strokeStyle = '#6366f1'; ctx.lineWidth = 4; ctx.stroke();
      ctx.shadowBlur = 0;
      for (let f = 0; f < 4; f++) {
        const ba = time * 6 + (f * Math.PI) / 2;
        const bladeGrad = ctx.createRadialGradient(Math.cos(ba) * 26, Math.sin(ba) * 26, 0, Math.cos(ba) * 26, Math.sin(ba) * 26, 14);
        bladeGrad.addColorStop(0, '#6366f1'); bladeGrad.addColorStop(1, '#312e81');
        ctx.fillStyle = bladeGrad;
        ctx.beginPath(); ctx.arc(Math.cos(ba) * 26, Math.sin(ba) * 26, 13, 0, Math.PI * 2); ctx.fill();
      }
      // Central spindle
      ctx.fillStyle = '#818cf8'; ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      // =======================================================================
      // SECTOR 3: COMMUNICATIONS & SENSOR ARRAY (North-East: x: 2550-3350, y: 200-850)
      // =======================================================================
      const sensorGrad = ctx.createLinearGradient(2550, 200, 3350, 850);
      sensorGrad.addColorStop(0, '#100c02'); sensorGrad.addColorStop(0.5, '#1a1505'); sensorGrad.addColorStop(1, '#100c02');
      ctx.fillStyle = sensorGrad;
      ctx.fillRect(2550, 200, 800, 650);
      ctx.save();
      ctx.shadowColor = '#f59e0b'; ctx.shadowBlur = 16;
      ctx.strokeStyle = '#d97706'; ctx.lineWidth = 8;
      ctx.strokeRect(2550, 200, 800, 650);
      ctx.strokeStyle = 'rgba(245,158,11,0.25)'; ctx.lineWidth = 2;
      ctx.strokeRect(2556, 206, 788, 638);
      ctx.restore();

      // Floor grid (amber)
      ctx.strokeStyle = 'rgba(245,158,11,0.06)'; ctx.lineWidth = 1;
      for (let gx = 2590; gx < 3350; gx += 55) {
        ctx.beginPath(); ctx.moveTo(gx, 200); ctx.lineTo(gx, 850); ctx.stroke();
      }

      // Rotating Radar Dish at (2950, 500)
      ctx.save();
      ctx.translate(2950, 500);
      const radarPlatGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 58);
      radarPlatGrad.addColorStop(0, '#1f1700'); radarPlatGrad.addColorStop(1, '#0d0c02');
      ctx.beginPath(); ctx.arc(0, 0, 58, 0, Math.PI * 2);
      ctx.fillStyle = radarPlatGrad; ctx.fill();
      ctx.shadowColor = '#f59e0b'; ctx.shadowBlur = 20;
      ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 4; ctx.stroke();
      ctx.shadowBlur = 0;

      const sweepAngle = time * 2.2;
      // Radar sweep fade trail
      const trailCount = 8;
      for (let ti = 0; ti < trailCount; ti++) {
        const ta = sweepAngle - (ti / trailCount) * 0.8;
        ctx.strokeStyle = `rgba(245,158,11,${(1 - ti / trailCount) * 0.5})`;
        ctx.lineWidth = 3 - ti * 0.3;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(ta) * 52, Math.sin(ta) * 52); ctx.stroke();
      }
      // Range rings
      for (const [rr, alpha] of [[20, 0.3], [38, 0.25], [52, 0.2]]) {
        ctx.strokeStyle = `rgba(245,158,11,${alpha})`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(0, 0, rr, 0, Math.PI * 2); ctx.stroke();
      }
      // Blip dots
      ctx.save(); ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 10;
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(30, -18, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(-22, 34, 3, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      ctx.restore();

      // =======================================================================
      // SECTOR 4: SECURITY & SURVEILLANCE VAULT (West: x: 200-1000, y: 1100-1850)
      // =======================================================================
      const vaultGrad = ctx.createLinearGradient(200, 1100, 1000, 1850);
      vaultGrad.addColorStop(0, '#110407'); vaultGrad.addColorStop(0.5, '#1c0b0b'); vaultGrad.addColorStop(1, '#110407');
      ctx.fillStyle = vaultGrad;
      ctx.fillRect(200, 1100, 800, 750);
      ctx.save();
      ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 16;
      ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 8;
      ctx.strokeRect(200, 1100, 800, 750);
      ctx.strokeStyle = 'rgba(239,68,68,0.25)'; ctx.lineWidth = 2;
      ctx.strokeRect(206, 1106, 788, 738);
      ctx.restore();

      // Camera grid overlay
      ctx.strokeStyle = 'rgba(239,68,68,0.06)'; ctx.lineWidth = 1;
      for (let gx = 240; gx < 1000; gx += 60) {
        ctx.beginPath(); ctx.moveTo(gx, 1100); ctx.lineTo(gx, 1850); ctx.stroke();
      }

      // Security cam icons (wall)
      for (let ci = 0; ci < 3; ci++) {
        const camX = 280 + ci * 220;
        ctx.save();
        ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 8;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath(); ctx.arc(camX, 1130, 7, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#fca5a5'; ctx.lineWidth = 1.5;
        const blinkAlpha = Math.sin(time * 3 + ci * 1.5) > 0 ? 1 : 0.2;
        ctx.globalAlpha = blinkAlpha;
        ctx.beginPath(); ctx.arc(camX, 1130, 12, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.restore();
      }

      // Security surveillance terminal at (550, 1450)
      ctx.save();
      ctx.translate(550, 1450);
      const vaultPlatGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 60);
      vaultPlatGrad.addColorStop(0, '#2a0a0a'); vaultPlatGrad.addColorStop(1, '#0f0203');
      ctx.beginPath(); ctx.arc(0, 0, 60, 0, Math.PI * 2);
      ctx.fillStyle = vaultPlatGrad; ctx.fill();
      ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 22;
      ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 4; ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#f87171'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(0, 0, 26, 0, Math.PI * 2); ctx.stroke();
      // Pulsing eye
      const eyePulse = Math.abs(Math.sin(time * 2)) * 12 + 5;
      ctx.save(); ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 14;
      ctx.fillStyle = '#ef4444';
      ctx.beginPath(); ctx.arc(Math.cos(time * 2.5) * 10, Math.sin(time * 2.5) * 10, eyePulse, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      ctx.restore();

      // =======================================================================
      // SECTOR 5: CYBERNETICS & BIO-LAB (East: x: 2600-3400, y: 1100-1850)
      // =======================================================================
      const bioGrad = ctx.createLinearGradient(2600, 1100, 3400, 1850);
      bioGrad.addColorStop(0, '#020e0b'); bioGrad.addColorStop(0.5, '#051a12'); bioGrad.addColorStop(1, '#020e0b');
      ctx.fillStyle = bioGrad;
      ctx.fillRect(2600, 1100, 800, 750);
      ctx.save();
      ctx.shadowColor = '#10b981'; ctx.shadowBlur = 16;
      ctx.strokeStyle = '#059669'; ctx.lineWidth = 8;
      ctx.strokeRect(2600, 1100, 800, 750);
      ctx.strokeStyle = 'rgba(16,185,129,0.25)'; ctx.lineWidth = 2;
      ctx.strokeRect(2606, 1106, 788, 738);
      ctx.restore();

      // Bio floor grid
      ctx.strokeStyle = 'rgba(16,185,129,0.06)'; ctx.lineWidth = 1;
      for (let gx = 2640; gx < 3400; gx += 60) {
        ctx.beginPath(); ctx.moveTo(gx, 1100); ctx.lineTo(gx, 1850); ctx.stroke();
      }

      // DNA Double-Helix Hologram at (3050, 1450)
      ctx.save();
      ctx.translate(3050, 1450);
      const bioPlat = ctx.createRadialGradient(0, 0, 0, 0, 0, 60);
      bioPlat.addColorStop(0, '#032c20'); bioPlat.addColorStop(1, '#010d09');
      ctx.beginPath(); ctx.arc(0, 0, 60, 0, Math.PI * 2);
      ctx.fillStyle = bioPlat; ctx.fill();
      ctx.shadowColor = '#10b981'; ctx.shadowBlur = 20;
      ctx.strokeStyle = '#10b981'; ctx.lineWidth = 4; ctx.stroke();
      ctx.shadowBlur = 0;

      // Animated DNA strands
      for (let d = -36; d <= 36; d += 10) {
        const p = time * 3 + d * 0.12;
        const ox = Math.sin(p) * 18;
        ctx.save();
        ctx.shadowColor = '#34d399'; ctx.shadowBlur = 8;
        ctx.strokeStyle = '#34d399'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(d, -ox); ctx.lineTo(d, ox); ctx.stroke();
        ctx.fillStyle = '#10b981';
        ctx.beginPath(); ctx.arc(d, -ox, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#6ee7b7';
        ctx.beginPath(); ctx.arc(d, ox, 4, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      // Connecting rungs
      ctx.strokeStyle = 'rgba(52,211,153,0.4)'; ctx.lineWidth = 1;
      for (let d = -36; d <= 36; d += 10) {
        const p = time * 3 + d * 0.12;
        const ox = Math.sin(p) * 18;
        ctx.beginPath(); ctx.moveTo(d - 5, -ox); ctx.lineTo(d + 5, ox); ctx.stroke();
      }
      ctx.restore();

      // =======================================================================
      // SECTOR 6: QUANTUM HYPER-REACTOR CORE (South: x: 1340-2260, y: 1900-2550)
      // =======================================================================
      const reactorGrad = ctx.createLinearGradient(1340, 1900, 2260, 2550);
      reactorGrad.addColorStop(0, '#0a0314'); reactorGrad.addColorStop(0.5, '#14062a'); reactorGrad.addColorStop(1, '#0a0314');
      ctx.fillStyle = reactorGrad;
      ctx.fillRect(1340, 1900, 920, 650);
      ctx.save();
      ctx.shadowColor = '#8b5cf6'; ctx.shadowBlur = 20;
      ctx.strokeStyle = '#7c3aed'; ctx.lineWidth = 8;
      ctx.strokeRect(1340, 1900, 920, 650);
      ctx.strokeStyle = 'rgba(139,92,246,0.3)'; ctx.lineWidth = 2;
      ctx.strokeRect(1346, 1906, 908, 638);
      ctx.restore();

      // Reactor floor grid
      ctx.strokeStyle = 'rgba(139,92,246,0.07)'; ctx.lineWidth = 1;
      for (let gx = 1380; gx < 2260; gx += 60) {
        ctx.beginPath(); ctx.moveTo(gx, 1900); ctx.lineTo(gx, 2550); ctx.stroke();
      }
      for (let gy = 1940; gy < 2550; gy += 60) {
        ctx.beginPath(); ctx.moveTo(1340, gy); ctx.lineTo(2260, gy); ctx.stroke();
      }

      // Plasma Reactor Core at (1800, 2250)
      ctx.save();
      ctx.translate(1800, 2250);
      const reactorCoreGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, 82);
      reactorCoreGrad.addColorStop(0, '#1a0838'); reactorCoreGrad.addColorStop(1, '#07021a');
      ctx.beginPath(); ctx.arc(0, 0, 82, 0, Math.PI * 2);
      ctx.fillStyle = reactorCoreGrad; ctx.fill();
      ctx.shadowColor = '#8b5cf6'; ctx.shadowBlur = 30;
      ctx.strokeStyle = '#8b5cf6'; ctx.lineWidth = 5; ctx.stroke();
      ctx.shadowBlur = 0;

      // Counter-rotating magnetic containment rings
      ctx.save();
      ctx.shadowColor = '#a855f7'; ctx.shadowBlur = 12;
      ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 3.5;
      ctx.beginPath(); ctx.ellipse(0, 0, 63, 28, time * 1.5, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = '#c084fc';
      ctx.beginPath(); ctx.ellipse(0, 0, 63, 28, -time * 1.5, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = 'rgba(192,132,252,0.5)';
      ctx.beginPath(); ctx.ellipse(0, 0, 48, 20, time * 0.7, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();

      // Pulsing plasma sphere
      const plasmaPulse = Math.sin(time * 4) * 7;
      const plasmaGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 36 + plasmaPulse);
      plasmaGrad.addColorStop(0, '#ffffff');
      plasmaGrad.addColorStop(0.3, '#e9d5ff');
      plasmaGrad.addColorStop(0.65, '#8b5cf6');
      plasmaGrad.addColorStop(1, 'rgba(139,92,246,0)');
      ctx.fillStyle = plasmaGrad;
      ctx.save(); ctx.shadowColor = '#a855f7'; ctx.shadowBlur = 25;
      ctx.beginPath(); ctx.arc(0, 0, 36 + plasmaPulse, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      ctx.restore();

      // =======================================================================
      // THE SKELD: DROPSHIP WAITING ROOM (LOBBY) vs CAFETERIA & VENTS (IN GAME)
      // =======================================================================
      if (phase === 'LOBBY') {
        // Authentic Big Dropship Waiting Room with Space Viewport, Pilot Seats & Laptop Crate
        drawDropshipLobby(ctx, { x1: 1100, y1: 920, x2: 2500, y2: 1780 }, time);
      } else {
        // Authentic Skeld metal deck floor
        ctx.fillStyle = '#627184';
        ctx.fillRect(1340, 1040, 920, 620);

        // Floor metal panel seams
        ctx.strokeStyle = '#485566';
        ctx.lineWidth = 2;
        for (let px = 1340; px <= 2260; px += 115) {
          ctx.beginPath();
          ctx.moveTo(px, 1040);
          ctx.lineTo(px, 1660);
          ctx.stroke();
        }
        for (let py = 1040; py <= 1660; py += 103) {
          ctx.beginPath();
          ctx.moveTo(1340, py);
          ctx.lineTo(2260, py);
          ctx.stroke();
        }

        // Cafeteria thick boundary walls (The Skeld dark spaceship hull)
        ctx.strokeStyle = '#222936';
        ctx.lineWidth = 10;
        ctx.strokeRect(1340, 1040, 920, 620);
        ctx.strokeStyle = '#384456';
        ctx.lineWidth = 3;
        ctx.strokeRect(1345, 1045, 910, 610);

        // Room Title
        ctx.font = "900 18px 'Inter', sans-serif";
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.textAlign = 'center';
        ctx.fillText('CAFETERIA', 1800, 1100);

        // Helper function to draw authentic Skeld round dining tables with surrounding stools
        const drawDiningTable = (tx, ty) => {
          ctx.save();
          // Stool positions around table
          const stoolOffsets = [
            { dx: -55, dy: 0 },
            { dx: 55, dy: 0 },
            { dx: 0, dy: -55 },
            { dx: 0, dy: 55 }
          ];
          stoolOffsets.forEach((s) => {
            // Stool shadow
            ctx.beginPath();
            ctx.arc(tx + s.dx, ty + s.dy + 3, 13, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
            ctx.fill();
            // Stool body
            ctx.beginPath();
            ctx.arc(tx + s.dx, ty + s.dy, 13, 0, Math.PI * 2);
            ctx.fillStyle = '#475569';
            ctx.fill();
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2.5;
            ctx.stroke();
            // Stool center bolt
            ctx.beginPath();
            ctx.arc(tx + s.dx, ty + s.dy, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#94a3b8';
            ctx.fill();
          });

          // Table ground shadow
          ctx.beginPath();
          ctx.ellipse(tx, ty + 8, 44, 40, 0, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
          ctx.fill();

          // Table surface outer rim
          ctx.beginPath();
          ctx.arc(tx, ty, 42, 0, Math.PI * 2);
          ctx.fillStyle = '#94a3b8';
          ctx.fill();
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 3.5;
          ctx.stroke();

          // Inner table top (2-tone cell shaded)
          ctx.beginPath();
          ctx.arc(tx, ty, 35, 0, Math.PI * 2);
          ctx.fillStyle = '#cbd5e1';
          ctx.fill();

          // Shaded half
          ctx.save();
          ctx.clip();
          ctx.beginPath();
          ctx.rect(tx - 35, ty, 70, 35);
          ctx.fillStyle = '#94a3b8';
          ctx.fill();
          ctx.restore();

          // Center plate / bolts
          ctx.beginPath();
          ctx.arc(tx, ty, 10, 0, Math.PI * 2);
          ctx.fillStyle = '#64748b';
          ctx.fill();
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.restore();
        };

        // 4 Cafeteria Dining Tables
        drawDiningTable(1520, 1220);
        drawDiningTable(2080, 1220);
        drawDiningTable(1520, 1480);
        drawDiningTable(2080, 1480);

        // Central Emergency Button Meeting Table at (1800, 1350)
        ctx.save();
        ctx.translate(1800, 1350);

        // Shadow
        ctx.beginPath();
        ctx.arc(0, 6, 68, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fill();

        // Outer table base
        ctx.beginPath();
        ctx.arc(0, 0, 66, 0, Math.PI * 2);
        ctx.fillStyle = '#475569';
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Hazard warning yellow/black diagonal ring
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, 60, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillStyle = '#eab308';
        ctx.fill();
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 10;
        for (let hx = -80; hx <= 80; hx += 16) {
          ctx.beginPath();
          ctx.moveTo(hx - 20, -70);
          ctx.lineTo(hx + 20, 70);
          ctx.stroke();
        }
        ctx.restore();

        // Inner steel platform
        ctx.beginPath();
        ctx.arc(0, 0, 48, 0, Math.PI * 2);
        ctx.fillStyle = '#94a3b8';
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3.5;
        ctx.stroke();

        // Red Emergency Button Pedestal
        ctx.beginPath();
        ctx.arc(0, 0, 32, 0, Math.PI * 2);
        ctx.fillStyle = '#7f1d1d';
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Pulsing Emergency Button itself
        const pulseEmergency = Math.sin(time * 4) * 2;
        ctx.beginPath();
        ctx.arc(0, 0, 24 + pulseEmergency, 0, Math.PI * 2);
        ctx.fillStyle = '#dc2626';
        ctx.fill();
        ctx.strokeStyle = '#b91c1c';
        ctx.lineWidth = 2;
        ctx.stroke();

        // White Specular Crescent on Button
        ctx.beginPath();
        ctx.ellipse(-5, -6, 10, 5, -0.4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.fill();

        // Protective Glass Dome
        ctx.beginPath();
        ctx.arc(0, 0, 30, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(224, 242, 254, 0.22)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Text label
        ctx.font = "900 8px 'Inter', sans-serif";
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('EMERGENCY', 0, 3);

        ctx.restore();

        // Decontamination Wardrobe Pod / Laptop Station at (1550, 1140)
        ctx.save();
        ctx.translate(1550, 1140);
        // Wooden crate
        ctx.beginPath();
        ctx.roundRect(-24, -18, 48, 36, 4);
        ctx.fillStyle = '#854d0e';
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.stroke();
        // Laptop open
        ctx.beginPath();
        ctx.roundRect(-14, -12, 28, 16, 2);
        ctx.fillStyle = '#38bdf8';
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.font = "900 8px 'Inter', sans-serif";
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('CUSTOMIZE', 0, 28);
        ctx.restore();

        // Authentic Skeld Interconnected Vents across the Starship
        VENTS.forEach((v) => {
          const isHovered = myRole === 'MAFIA' && Math.hypot(localPos.x - v.x, localPos.y - v.y) < 85;
          let openProg = 0;
          const anim = ventAnimMap.current[v.id];
          if (anim) {
            const p = (Date.now() - anim.startTime) / anim.duration;
            if (p < 1) openProg = Math.sin(p * Math.PI);
            else delete ventAnimMap.current[v.id];
          }
          if (isVentedRef.current && currentVentIdRef.current === v.id) {
            openProg = Math.max(openProg, 0.2);
          }
          drawVent(ctx, v.x, v.y, openProg, isHovered);
        });
      }

      // =======================================================================
      // SPECIFIC BARRIERS: LOBBY LOCKDOWN FORCEFIELDS vs ACTIVE GAME CLEARANCE
      // =======================================================================
      if (phase === 'LOBBY') {
        // Glowing Red Laser Forcefield Barriers across all 4 exits of the Lobby:
        const drawLaserBarrier = (x1, y1, x2, y2, label, isHorizontal) => {
          ctx.save();
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 7;
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 16;
          const flicker = Math.sin(time * 18 + x1) * 2;
          ctx.beginPath();
          if (isHorizontal) {
            ctx.moveTo(x1, y1 + flicker);
            ctx.lineTo(x2, y2 - flicker);
          } else {
            ctx.moveTo(x1 + flicker, y1);
            ctx.lineTo(x2 - flicker, y2);
          }
          ctx.stroke();

          // Laser grid ribs
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
          ctx.lineWidth = 2;
          if (isHorizontal) {
            for (let lx = x1 + 10; lx < x2; lx += 18) {
              ctx.beginPath();
              ctx.moveTo(lx, y1 - 18);
              ctx.lineTo(lx, y1 + 18);
              ctx.stroke();
            }
          } else {
            for (let ly = y1 + 10; ly < y2; ly += 18) {
              ctx.beginPath();
              ctx.moveTo(x1 - 18, ly);
              ctx.lineTo(x1 + 18, ly);
              ctx.stroke();
            }
          }

          ctx.font = "bold 9px 'JetBrains Mono', monospace";
          ctx.fillStyle = '#fca5a5';
          ctx.textAlign = 'center';
          ctx.fillText(label, (x1 + x2) / 2, (y1 + y2) / 2 - (isHorizontal ? 22 : 0));
          ctx.restore();
        };

        // North Exit (to Bridge)
        drawLaserBarrier(1720, 1040, 1880, 1040, '🔒 FORCEFIELD // LOBBY LOCKED', true);
        // South Exit (to Reactor)
        drawLaserBarrier(1720, 1660, 1880, 1660, '🔒 FORCEFIELD // LOBBY LOCKED', true);
        // West Exit (to Vault)
        drawLaserBarrier(1340, 1320, 1340, 1480, '🔒 LOCKED', false);
        // East Exit (to Bio-Lab)
        drawLaserBarrier(2260, 1320, 2260, 1480, '🔒 LOCKED', false);
      } else {
        // In Game: Green Clearance Lights across open doorways
        ctx.fillStyle = '#10b981';
        ctx.fillRect(1720, 1036, 160, 8);
        ctx.fillRect(1720, 1656, 160, 8);
        ctx.fillRect(1336, 1320, 8, 160);
        ctx.fillRect(2256, 1320, 8, 160);
      }

      // Room Name Banners across Sectors
      ctx.font = "bold 15px 'JetBrains Mono', monospace";
      ctx.fillStyle = 'rgba(148, 163, 184, 0.8)';
      ctx.textAlign = 'center';
      ctx.fillText('COMMAND BRIDGE [SECTOR 1]', 1800, 270);
      ctx.fillText('AI & QUANTUM MAINFRAME [SECTOR 2]', 650, 250);
      ctx.fillText('COMMUNICATIONS & SENSORS [SECTOR 3]', 2950, 250);
      ctx.fillText('SECURITY & SURVEILLANCE VAULT [SECTOR 4]', 600, 1160);
      ctx.fillText('CYBERNETICS & BIO-LAB [SECTOR 5]', 3000, 1160);
      ctx.fillText('QUANTUM HYPER-REACTOR CORE [SECTOR 6]', 1800, 1960);
      ctx.fillText('CENTRAL ASSEMBLY ATRIUM (WAITING DECK)', 1800, 1090);

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
      // DRAW AUTHENTIC CREWMATE BEANS & DEAD BODIES
      // =======================================================================
      // Combine remote players and local player
      const allRoster = [...playersRef.current];
      const selfPlayer = allRoster.find((p) => p.id === socket.id);

      if (!selfPlayer) {
        const heroObj = getHero(selectedHero);
        allRoster.push({
          id: socket.id,
          username,
          characterId: selectedHero,
          hatId: selectedHat,
          color: heroObj.primaryColor,
          visorColor: heroObj.visorColor,
          operativeTitle: selectedTitle || heroObj.roleTitle,
          x: localPos.x,
          y: localPos.y,
          isMoving,
          facingLeft: facingLeftRef.current,
          role: myRole,
          isAlive: true
        });
      }

      // 1. Draw Dead Bodies on the deck floor for any eliminated/dead players
      allRoster.forEach((p) => {
        if (!p.isAlive) {
          drawDeadBody(ctx, p.characterId || 'red', p.x, p.y);
        }
      });

      // 2. Sort alive and ghost operatives by Y for depth layering
      allRoster.sort((a, b) => a.y - b.y);

      allRoster.forEach((p) => {
        const isLocal = p.id === socket.id || p.id === 'local_player';
        // If player is concealed inside a ventilation shaft, skip rendering
        if (isLocal && isVentedRef.current) return;
        if (!isLocal && p.isVented) return;

        const px = isLocal ? localPos.x : p.x;
        const py = isLocal ? localPos.y : p.y;
        const isFacingLeft = isLocal ? facingLeftRef.current : p.facingLeft;
        const isPlMoving = isLocal ? isMoving : p.isMoving;
        const isGhost = !p.isAlive;
        const pWalk = isPlMoving ? Math.sin(time * 12) * 4 : 0;
        const hatId = isLocal ? selectedHat : (p.hatId || 'none');

        ctx.save();
        ctx.translate(px, py);

        // Vector render authentic Innersloth Crewmate Bean with Hat & Visor
        drawCrewmate(ctx, p.characterId || 'red', hatId, pWalk, time, isPlMoving, isFacingLeft, isGhost, isLocal);

        ctx.restore();

        // Authentic Innersloth Outlined Nametag
        ctx.save();
        ctx.font = "900 12px 'Inter', -apple-system, sans-serif";
        ctx.textAlign = 'center';

        const isMafiaTeammate = myRole === 'MAFIA' && (p.role === 'MAFIA' || fellowMafia.includes(p.username));
        const nametagY = py - (hatId !== 'none' ? 46 : 36);

        const displayName = (isGhost ? '👻 ' : '') + p.username + (isLocal ? ' (YOU)' : '');

        // Thick black comic stroke outline
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = '#000000';
        ctx.lineJoin = 'round';
        ctx.strokeText(displayName, px, nametagY);

        // Name fill color
        ctx.fillStyle = isGhost ? 'rgba(203, 213, 225, 0.85)' : (isMafiaTeammate ? '#ef4444' : '#ffffff');
        ctx.fillText(displayName, px, nametagY);

        ctx.restore();
      });

      // 3. Draw in-vent navigation arrows for vented local player
      if (isVentedRef.current && currentVentIdRef.current) {
        const curVent = VENTS.find((v) => v.id === currentVentIdRef.current);
        if (curVent) {
          curVent.connections.forEach((connId) => {
            const targetVent = VENTS.find((v) => v.id === connId);
            if (targetVent) {
              const angle = Math.atan2(targetVent.y - curVent.y, targetVent.x - curVent.x);
              const ax = curVent.x + Math.cos(angle) * 54;
              const ay = curVent.y + Math.sin(angle) * 54;
              drawVentArrow(ctx, ax, ay, angle, false);
            }
          });
        }
      }

      ctx.restore(); // Restore camera translation & zoom

      // =======================================================================
      // NIGHT PHASE: FLASHLIGHT FOG-OF-WAR (Developers) vs NIGHT VISION (Mafia)
      // Screen-space overlay matching responsive viewport and player screen pos
      // =======================================================================
      if (phase === 'NIGHT') {
        const screenX = (localPos.x - cameraX) * ZOOM;
        const screenY = (localPos.y - cameraY) * ZOOM;

        if (myRole === 'MAFIA') {
          // Mafia: High-tech green night-vision HUD overlay
          ctx.fillStyle = 'rgba(16, 185, 129, 0.14)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          // Scanlines
          ctx.fillStyle = 'rgba(16, 185, 129, 0.05)';
          for (let y = 0; y < canvas.height; y += 4) {
            ctx.fillRect(0, y, canvas.width, 2);
          }
        } else {
          // Developers: Darkness mask with circular vision cut-out
          const maskCanvas = document.createElement('canvas');
          maskCanvas.width = canvas.width;
          maskCanvas.height = canvas.height;
          const maskCtx = maskCanvas.getContext('2d');

          maskCtx.fillStyle = 'rgba(3, 7, 18, 0.96)';
          maskCtx.fillRect(0, 0, canvas.width, canvas.height);

          maskCtx.globalCompositeOperation = 'destination-out';
          const radius = 155 * ZOOM;

          const flashlightGrad = maskCtx.createRadialGradient(screenX, screenY, 30 * ZOOM, screenX, screenY, radius);
          flashlightGrad.addColorStop(0, 'rgba(0,0,0,1)');
          flashlightGrad.addColorStop(0.85, 'rgba(0,0,0,0.85)');
          flashlightGrad.addColorStop(1, 'rgba(0,0,0,0)');

          maskCtx.fillStyle = flashlightGrad;
          maskCtx.beginPath();
          maskCtx.arc(screenX, screenY, radius, 0, Math.PI * 2);
          maskCtx.fill();

          ctx.drawImage(maskCanvas, 0, 0);
        }
      }

      // =======================================================================
      // PROXIMITY ACTION DETECTION (Within 80px)
      // =======================================================================
      let foundAction = null;

      // Check Vents for Impostor (within 85px)
      if (myRole === 'MAFIA' && !foundAction && phase !== 'LOBBY' && !isVentedRef.current) {
        const nearbyVent = VENTS.find((v) => Math.hypot(localPos.x - v.x, localPos.y - v.y) < 85);
        if (nearbyVent) {
          foundAction = {
            type: 'vent',
            id: nearbyVent.id,
            name: `Ventilation Duct [V] (${nearbyVent.name})`
          };
        }
      }

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

      // Check Emergency Beacon (1800, 1350)
      if (!foundAction && Math.hypot(localPos.x - 1800, localPos.y - 1350) < 80) {
        foundAction = {
          type: 'emergency',
          name: 'Central Lockdown Beacon'
        };
      }

      // Check Wardrobe Pod / Customization Laptop (1550, 1250)
      if (!foundAction && Math.hypot(localPos.x - 1550, localPos.y - 1250) < 85) {
        foundAction = {
          type: 'wardrobe',
          name: phase === 'LOBBY' ? 'Customization Laptop Pod [E]' : 'Decontamination Wardrobe Pod [E]'
        };
      }

      // Avoid unnecessary state re-renders at 60fps if nearby target hasn't changed
      setNearbyAction((prev) => {
        if (!prev && !foundAction) return prev;
        if (
          prev &&
          foundAction &&
          prev.type === foundAction.type &&
          prev.id === foundAction.id &&
          prev.solved === foundAction.solved
        ) {
          return prev;
        }
        return foundAction;
      });

      // =======================================================================
      // ROLE REVEAL INTRO SPLASH OVERLAY (3.5 SECONDS)
      // =======================================================================
      if (roleRevealRef.current) {
        const elapsed = (Date.now() - roleRevealRef.current) / 1000;
        if (elapsed <= 3.5) {
          drawRoleReveal(
            ctx,
            canvas.width,
            canvas.height,
            myRole,
            fellowMafia,
            selectedHero,
            selectedHat,
            username.trim() || 'Player',
            time,
            elapsed
          );
        } else {
          roleRevealRef.current = null;
          setRoleReveal(null);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    } catch (renderErr) {
      console.error('[Render Loop Exception]:', renderErr);
      animationFrameId = requestAnimationFrame(render);
    }
  };

  render();

    return () => {
      window.removeEventListener('resize', updateSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [localPos, terminals, myRole, phase, roomId, username, selectedColor, selectedVisor, selectedTitle, selectedHero, selectedHat, playerSpeed]);

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
        <div style={{ textAlign: 'center', marginBottom: '14px', zIndex: 2 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 12px',
              borderRadius: '20px',
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: '#38bdf8',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '1px',
              marginBottom: '8px',
              boxShadow: '0 0 15px rgba(56, 189, 248, 0.2)'
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: connected ? '#10b981' : '#ef4444' }} />
            3600x2700 THE SKELD MEGASTRUCTURE // AMONG US
          </div>

          <h1 style={{ fontSize: '38px', fontWeight: 900, letterSpacing: '-1px', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <span style={{ color: '#38bdf8', textShadow: '0 0 20px rgba(56, 189, 248, 0.5)' }}>CODE</span>
            <span style={{ color: '#ef4444', textShadow: '0 0 20px rgba(239, 68, 68, 0.6)' }}>MAFIA</span>
          </h1>
          <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', maxWidth: '520px', lineHeight: '1.4' }}>
            Explore the authentic Skeld dreadnought, solve simplified engineering terminals, navigate animated vents, and catch the cyber infiltrators!
          </p>
        </div>

        <div
          style={{
            width: '100%',
            maxWidth: '1040px',
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(16px)',
            border: '1px solid #334155',
            borderRadius: '16px',
            padding: '20px 24px',
            boxSizing: 'border-box',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px rgba(56, 189, 248, 0.15)',
            zIndex: 2
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '10px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc', letterSpacing: '1px' }}>
                SPACESHIP AIRLOCK REGISTRATION
              </span>
              <span style={{ fontSize: '9px', padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(56,189,248,0.15)', color: '#38bdf8', fontWeight: 800 }}>
                LAPTOP WIDESCREEN
              </span>
            </div>
            <span style={{ fontSize: '11px', color: connected ? '#10b981' : '#f87171', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: connected ? '#10b981' : '#ef4444' }} />
              {connected ? 'GAME SERVER ONLINE' : 'SOLO / OFFLINE READY'}
            </span>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!roomId.trim() || !username.trim()) return;
              if (!connected) {
                setShowServerConfig(true);
                alert("⚠️ Cannot Board: Game Server Offline!\n\nYour game frontend is running on Vercel, but it cannot connect to the backend WebSocket server.\n\n👉 Click 'LAUNCH SOLO SIMULATION' to practice offline, or enter your Render backend link in 'Server URL'!");
                return;
              }
              const heroObj = getHero(selectedHero);
              socket.emit('join_room', {
                roomId: roomId.trim(),
                username: username.trim(),
                color: heroObj.primaryColor,
                visorColor: heroObj.visorColor,
                operativeTitle: selectedTitle || heroObj.roleTitle,
                characterId: selectedHero,
                hatId: selectedHat
              });
              setInRoom(true);
            }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
              gap: '24px',
              alignItems: 'start'
            }}
          >
            {/* COLUMN 1: CREWMATE WARDROBE & IDENTITY */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.8px', borderBottom: '1px solid #1e293b', paddingBottom: '4px' }}>
                ◈ CREWMATE DOSSIER & WARDROBE
              </div>

              {/* Crewmate Preview & Callsign */}
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center', backgroundColor: '#090d16', padding: '10px 12px', borderRadius: '10px', border: '1px solid #1e293b' }}>
                <div style={{ width: '80px', height: '96px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#030712', borderRadius: '8px', border: '1px solid #334155', flexShrink: 0 }}>
                  <CrewmatePreview colorId={selectedHero} hatId={selectedHat} width={74} height={90} isMoving={true} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>CREWMATE CALLSIGN</label>
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
                    style={{ width: '100%', padding: '8px 10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '13px', fontWeight: 700, fontFamily: 'inherit', boxSizing: 'border-box' }}
                  />
                  <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
                    Color: <span style={{ color: getCrewmateColor(selectedHero).hex, fontWeight: 700 }}>{getCrewmateColor(selectedHero).name}</span>
                  </div>
                </div>
              </div>

              {/* Select Among Us Color (12 colors) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.8px' }}>
                    SUIT COLOR: <span style={{ color: getCrewmateColor(selectedHero).hex }}>{getCrewmateColor(selectedHero).name.toUpperCase()}</span>
                  </label>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px' }}>
                  {CREWMATE_COLORS.map((c) => {
                    const isSel = selectedHero === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setSelectedHero(c.id);
                          setSelectedColor(c.hex);
                          setSelectedVisor('#98d0e1');
                          localStorage.setItem('amongus_color', c.id);
                          localStorage.setItem('code_mafia_hero', c.id);
                        }}
                        style={{
                          height: '30px',
                          borderRadius: '6px',
                          backgroundColor: c.hex,
                          border: isSel ? '3px solid #ffffff' : '2px solid rgba(0,0,0,0.6)',
                          boxShadow: isSel ? '0 0 10px #ffffff' : 'none',
                          cursor: 'pointer',
                          transform: isSel ? 'scale(1.08)' : 'scale(1)',
                          transition: 'all 0.15s ease'
                        }}
                        title={c.name}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Select Among Us Hat (10 hats) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.8px' }}>
                    EQUIP HAT: <span style={{ color: '#38bdf8' }}>{CREWMATE_HATS.find(h => h.id === selectedHat)?.name.toUpperCase() || 'NO HAT'}</span>
                  </label>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '5px' }}>
                  {CREWMATE_HATS.map((h) => {
                    const isSel = selectedHat === h.id;
                    return (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => {
                          setSelectedHat(h.id);
                          localStorage.setItem('amongus_hat', h.id);
                        }}
                        style={{
                          padding: '4px 2px',
                          borderRadius: '6px',
                          backgroundColor: isSel ? '#1e293b' : '#090d16',
                          border: isSel ? '2px solid #38bdf8' : '1px solid #1e293b',
                          color: '#fff',
                          fontSize: '10px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '2px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span style={{ fontSize: '16px' }}>{h.emoji}</span>
                        <span style={{ fontSize: '8.5px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '48px' }}>
                          {h.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* COLUMN 2: SECTOR LAUNCH & FLIGHT CONTROLS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.8px', borderBottom: '1px solid #1e293b', paddingBottom: '4px' }}>
                ◈ SECTOR DISPATCH & LAUNCH
              </div>

              {/* Server Connection Status Banner */}
              <div style={{
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: connected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.12)',
                border: connected ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.35)',
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
                    Target: <span style={{ color: '#f87171', fontFamily: 'monospace' }}>{SERVER_URL || 'None'}</span>. Click <b style={{ color: '#38bdf8' }}>⚙️ Server URL</b> to enter your Render backend.
                  </div>
                )}
                {showServerConfig && (
                  <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input
                        type="text"
                        placeholder="https://code-mafia-server.onrender.com"
                        value={serverUrlInput}
                        onChange={(e) => setServerUrlInput(e.target.value)}
                        style={{ flex: 1, padding: '6px 8px', backgroundColor: '#090d16', border: '1px solid #334155', borderRadius: '4px', color: '#fff', fontSize: '11px', fontFamily: 'monospace' }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const formatted = (serverUrlInput.trim() || PROD_SERVER_URL).replace(/\/$/, '');
                          localStorage.setItem('code_mafia_server_url', formatted);
                          window.location.reload();
                        }}
                        style={{ padding: '6px 12px', backgroundColor: '#0284c7', border: 'none', borderRadius: '4px', color: '#fff', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Connect
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          localStorage.removeItem('code_mafia_server_url');
                          window.location.reload();
                        }}
                        title="Reset to official cloud server"
                        style={{ padding: '6px 10px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '4px', color: '#94a3b8', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Room Code */}
              <div>
                <label style={{ display: 'block', fontSize: '10px', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.8px', marginBottom: '4px' }}>
                  SPACESHIP SECTOR CODE
                </label>
                <input
                  type="text"
                  required
                  maxLength={24}
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', backgroundColor: '#090d16', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '13px', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
              </div>

              {/* Launch Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {connected && (
                  <button
                    type="submit"
                    disabled={!roomId.trim() || !username.trim()}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                      border: '1px solid #38bdf8',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '12px',
                      fontWeight: 800,
                      letterSpacing: '1px',
                      fontFamily: 'inherit',
                      cursor: (!roomId.trim() || !username.trim()) ? 'not-allowed' : 'pointer',
                      boxShadow: '0 0 20px rgba(56, 189, 248, 0.4)'
                    }}
                  >
                    ENTER MULTIPLAYER DECK ➔
                  </button>
                )}

                <button
                  type="button"
                  onClick={startSoloSimulation}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'linear-gradient(135deg, #0284c7 0%, #7c3aed 100%)',
                    border: '1px solid #38bdf8',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 800,
                    letterSpacing: '1px',
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                    boxShadow: '0 0 25px rgba(56, 189, 248, 0.45)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  🚀 LAUNCH SOLO SIMULATION (PRACTICE OFFLINE) ➔
                </button>
              </div>

              {/* Laptop Flight Controls Cheat-Sheet */}
              <div style={{ padding: '10px 12px', borderRadius: '8px', backgroundColor: '#090d16', border: '1px solid #1e293b' }}>
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#38bdf8', marginBottom: '6px', letterSpacing: '0.8px' }}>
                  🕹️ LAPTOP FLIGHT CONTROLS
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', fontSize: '10.5px', color: '#94a3b8' }}>
                  <div><kbd style={{ backgroundColor: '#1e293b', color: '#f8fafc', padding: '1px 5px', borderRadius: '3px', fontWeight: 700, fontSize: '10px' }}>WASD</kbd> Move</div>
                  <div><kbd style={{ backgroundColor: '#1e293b', color: '#f8fafc', padding: '1px 5px', borderRadius: '3px', fontWeight: 700, fontSize: '10px' }}>E</kbd> Use / Terminal</div>
                  <div><kbd style={{ backgroundColor: '#1e293b', color: '#c084fc', padding: '1px 5px', borderRadius: '3px', fontWeight: 700, fontSize: '10px' }}>V</kbd> Vent (Impostor)</div>
                  <div><kbd style={{ backgroundColor: '#1e293b', color: '#f87171', padding: '1px 5px', borderRadius: '3px', fontWeight: 700, fontSize: '10px' }}>R</kbd> Report Body</div>
                  <div><kbd style={{ backgroundColor: '#1e293b', color: '#f87171', padding: '1px 5px', borderRadius: '3px', fontWeight: 700, fontSize: '10px' }}>Q</kbd> Sabotage / Kill</div>
                  <div><kbd style={{ backgroundColor: '#1e293b', color: '#38bdf8', padding: '1px 5px', borderRadius: '3px', fontWeight: 700, fontSize: '10px' }}>M</kbd> Mini-Map</div>
                </div>
              </div>
            </div>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '19px', fontWeight: 900, color: '#f8fafc', letterSpacing: '1px' }}>AMONG <span style={{ color: '#ef4444' }}>US</span></span>
            <span style={{ fontSize: '10px', color: '#38bdf8', marginLeft: '2px', fontWeight: 800 }}>// THE SKELD</span>
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
              <Clock size={16} color={timer < 60 ? '#ef4444' : '#38bdf8'} />
              <span style={{ fontSize: '18px', fontWeight: 800, color: timer < 60 ? '#ef4444' : '#ffffff', fontVariantNumeric: 'tabular-nums' }}>
                {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
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

        {/* Right Controls: Speed, Wardrobe & Mini-map Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Admin / Host Speed Controls */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => isHost && setShowAdminSpeedModal(!showAdminSpeedModal)}
              style={{
                padding: '6px 12px',
                backgroundColor: isHost ? '#0f172a' : '#090d16',
                border: isHost ? '1px solid #38bdf8' : '1px solid #334155',
                borderRadius: '6px',
                color: isHost ? '#38bdf8' : '#94a3b8',
                fontSize: '11px',
                fontWeight: 700,
                cursor: isHost ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title={isHost ? 'Admin Speed Control (Click to Adjust)' : 'Operative Movement Speed'}
            >
              <Zap size={13} color="#f59e0b" />
              <span>SPEED: {playerSpeed}x</span>
              {isHost && <Sliders size={12} />}
            </button>

            {isHost && showAdminSpeedModal && (
              <div
                style={{
                  position: 'absolute',
                  top: '115%',
                  right: 0,
                  width: '240px',
                  backgroundColor: 'rgba(15, 23, 42, 0.98)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid #38bdf8',
                  borderRadius: '8px',
                  padding: '12px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.8), 0 0 15px rgba(56, 189, 248, 0.25)',
                  zIndex: 50
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#38bdf8' }}>HOST SPEED CONTROL</span>
                  <button
                    onClick={() => setShowAdminSpeedModal(false)}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
                  >
                    <X size={14} />
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#cbd5e1', marginBottom: '6px' }}>
                  <span>Speed:</span>
                  <span style={{ fontWeight: 800, color: '#f59e0b' }}>{playerSpeed}x</span>
                </div>
                <input
                  type="range"
                  min="1.5"
                  max="4.5"
                  step="0.1"
                  value={playerSpeed}
                  onChange={(e) => {
                    const spd = parseFloat(e.target.value);
                    setPlayerSpeed(spd);
                    socket.emit('set_game_settings', { roomId, imposterSetting, playerSpeed: spd });
                  }}
                  style={{ width: '100%', marginBottom: '10px', accentColor: '#38bdf8' }}
                />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                  {[
                    { label: '1.8x', val: 1.8 },
                    { label: '2.4x', val: 2.4 },
                    { label: '3.2x', val: 3.2 },
                    { label: '4.0x', val: 4.0 }
                  ].map((p) => (
                    <button
                      key={p.val}
                      onClick={() => {
                        setPlayerSpeed(p.val);
                        socket.emit('set_game_settings', { roomId, imposterSetting, playerSpeed: p.val });
                      }}
                      style={{
                        padding: '4px 0',
                        fontSize: '10px',
                        fontWeight: 700,
                        backgroundColor: playerSpeed === p.val ? '#0284c7' : '#1e293b',
                        border: 'none',
                        borderRadius: '4px',
                        color: '#fff',
                        cursor: 'pointer'
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

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

      {/* Main Canvas Play Area (Responsive Full-Bleed for Laptop & Desktop) */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          backgroundColor: '#020508'
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            display: 'block'
          }}
        />

        {/* Authentic Top-Left TOTAL TASKS COMPLETED Progress Bar */}
        {phase !== 'LOBBY' && phase !== 'VOTING' && (
          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              width: '280px',
              zIndex: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <div
              style={{
                backgroundColor: 'rgba(5, 46, 22, 0.94)',
                border: '3px solid #14532d',
                borderRadius: '8px',
                padding: '6px 10px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.7)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '10px', fontWeight: 900, color: '#ffffff', letterSpacing: '0.8px', fontFamily: "'Inter', sans-serif" }}>
                  TOTAL TASKS COMPLETED
                </span>
                <span style={{ fontSize: '10px', fontWeight: 900, color: '#4ade80' }}>
                  {solvedCount}/{totalTerminals}
                </span>
              </div>
              <div
                style={{
                  height: '14px',
                  backgroundColor: '#052e16',
                  borderRadius: '4px',
                  border: '1.5px solid #166534',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, Math.round((solvedCount / Math.max(1, totalTerminals)) * 100))}%`,
                    backgroundColor: '#22c55e',
                    boxShadow: '0 0 10px #22c55e',
                    transition: 'width 0.4s ease'
                  }}
                />
              </div>
            </div>

            {/* Task list preview */}
            <div
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(8px)',
                borderRadius: '6px',
                padding: '6px 10px',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '3px'
              }}
            >
              {terminals.slice(0, 3).map((t) => (
                <div key={t.id} style={{ fontSize: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: t.solved ? '#22c55e' : (t.sabotaged ? '#ef4444' : '#facc15') }}>
                    {t.solved ? '✔' : '•'}
                  </span>
                  <span style={{ color: t.solved ? '#86efac' : (t.sabotaged ? '#fca5a5' : '#fef08a'), fontWeight: 600 }}>
                    {t.roomName.split('(')[0]}: {t.functionName}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Authentic Circular Among Us Action Buttons (USE, REPORT, KILL, VENT) */}
        {phase !== 'VOTING' && (
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              right: '16px',
              zIndex: 20,
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-end'
            }}
          >
            {/* VENT / HOP / EXIT Controls (Impostor/Mafia in Day/Night phases) */}
            {myRole === 'MAFIA' && phase !== 'LOBBY' && (
              <>
                {isVented ? (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {/* Fast Jump to Connected Network Vents */}
                    {(() => {
                      const curVent = VENTS.find((v) => v.id === currentVentId);
                      return (curVent?.connections || []).map((connId) => {
                        const tv = VENTS.find((v) => v.id === connId);
                        return (
                          <button
                            key={connId}
                            type="button"
                            onClick={() => handleVentTravel(connId)}
                            style={{
                              padding: '8px 12px',
                              borderRadius: '20px',
                              backgroundColor: '#3b0764',
                              border: '2px solid #a855f7',
                              color: '#ffffff',
                              fontSize: '11px',
                              fontWeight: 800,
                              cursor: 'pointer',
                              boxShadow: '0 0 12px rgba(168, 85, 247, 0.5)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <span>➔</span>
                            <span>{tv?.name.split(' ')[0]}</span>
                          </button>
                        );
                      });
                    })()}

                    {/* Exit Vent Button */}
                    <button
                      type="button"
                      onClick={handleExitVent}
                      style={{
                        width: '74px',
                        height: '74px',
                        borderRadius: '50%',
                        backgroundColor: '#581c87',
                        border: '4px solid #c084fc',
                        color: '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 0 22px rgba(192, 132, 252, 0.7)',
                        transition: 'all 0.15s ease'
                      }}
                      title="Exit ventilation duct [V]"
                    >
                      <span style={{ fontSize: '20px' }}>🚪</span>
                      <span style={{ fontSize: '9px', fontWeight: 900, marginTop: '2px' }}>EXIT [V]</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const nearbyVent = VENTS.find((v) => Math.hypot(localPos.x - v.x, localPos.y - v.y) < 85);
                      if (nearbyVent) handleEnterVent(nearbyVent);
                    }}
                    disabled={!VENTS.some((v) => Math.hypot(localPos.x - v.x, localPos.y - v.y) < 85)}
                    style={{
                      width: '74px',
                      height: '74px',
                      borderRadius: '50%',
                      backgroundColor: VENTS.some((v) => Math.hypot(localPos.x - v.x, localPos.y - v.y) < 85) ? '#4c1d95' : '#1e1b4b',
                      border: VENTS.some((v) => Math.hypot(localPos.x - v.x, localPos.y - v.y) < 85) ? '4px solid #a855f7' : '3px solid #6b21a8',
                      color: '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: VENTS.some((v) => Math.hypot(localPos.x - v.x, localPos.y - v.y) < 85) ? 'pointer' : 'default',
                      opacity: VENTS.some((v) => Math.hypot(localPos.x - v.x, localPos.y - v.y) < 85) ? 1 : 0.5,
                      boxShadow: VENTS.some((v) => Math.hypot(localPos.x - v.x, localPos.y - v.y) < 85) ? '0 0 20px rgba(168, 85, 247, 0.6)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                    title="Enter ventilation shafts [V]"
                  >
                    <span style={{ fontSize: '20px' }}>💨</span>
                    <span style={{ fontSize: '9px', fontWeight: 900, marginTop: '2px' }}>VENT [V]</span>
                  </button>
                )}
              </>
            )}

            {/* KILL / SABOTAGE Button (Impostor/Mafia in Night phase) */}
            {myRole === 'MAFIA' && phase === 'NIGHT' && (
              <button
                type="button"
                onClick={() => {
                  if (nearbyAction && nearbyAction.type === 'terminal') {
                    playKillSound();
                    socket.emit('sabotage_terminal', { roomId, terminalId: nearbyAction.id });
                  }
                }}
                style={{
                  width: '74px',
                  height: '74px',
                  borderRadius: '50%',
                  backgroundColor: '#7f1d1d',
                  border: '4px solid #ef4444',
                  color: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 0 20px rgba(239, 68, 68, 0.6)',
                  transition: 'all 0.15s ease'
                }}
                title="Sabotage Subsystems / Eliminate [Q]"
              >
                <Skull size={24} color="#ffffff" />
                <span style={{ fontSize: '9px', fontWeight: 900, marginTop: '2px' }}>KILL [Q]</span>
              </button>
            )}

            {/* REPORT Button */}
            <button
              type="button"
              onClick={() => {
                if (phase === 'DAY') {
                  playEmergencyAlarm();
                  socket.emit('call_emergency', { roomId });
                }
              }}
              style={{
                width: '74px',
                height: '74px',
                borderRadius: '50%',
                backgroundColor: phase === 'DAY' ? '#dc2626' : '#334155',
                border: phase === 'DAY' ? '4px solid #f87171' : '3px solid #64748b',
                color: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: phase === 'DAY' ? 'pointer' : 'not-allowed',
                boxShadow: phase === 'DAY' ? '0 0 20px rgba(239, 68, 68, 0.5)' : 'none',
                opacity: phase === 'DAY' ? 1 : 0.6,
                transition: 'all 0.15s ease'
              }}
              title="Report Dead Body / Emergency Meeting [R]"
            >
              <Megaphone size={24} color="#ffffff" />
              <span style={{ fontSize: '9px', fontWeight: 900, marginTop: '2px' }}>REPORT [R]</span>
            </button>

            {/* USE Button */}
            <button
              type="button"
              onClick={() => {
                if (!nearbyAction) return;
                if (nearbyAction.type === 'terminal') {
                  const term = terminals.find((t) => t.id === nearbyAction.id);
                  if (term) {
                    setActiveTerminal(term);
                    setTerminalCode(term.code || term.starterCode);
                    setTestResults(null);
                  }
                } else if (nearbyAction.type === 'wardrobe') {
                  setShowWardrobe(true);
                } else if (nearbyAction.type === 'emergency') {
                  if (phase === 'DAY') {
                    playEmergencyAlarm();
                    socket.emit('call_emergency', { roomId });
                  }
                } else if (nearbyAction.type === 'vent' && myRole === 'MAFIA') {
                  const nearbyVent = VENTS.find((v) => v.id === nearbyAction.id);
                  if (nearbyVent) handleEnterVent(nearbyVent);
                }
              }}
              style={{
                width: '74px',
                height: '74px',
                borderRadius: '50%',
                backgroundColor: nearbyAction ? '#0284c7' : '#1e293b',
                border: nearbyAction ? '4px solid #38bdf8' : '3px solid #475569',
                color: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: nearbyAction ? 'pointer' : 'default',
                boxShadow: nearbyAction ? '0 0 24px rgba(56, 189, 248, 0.6)' : 'none',
                opacity: nearbyAction ? 1 : 0.55,
                transition: 'all 0.15s ease'
              }}
              title="Interact with terminal, customize pod, or emergency button [E]"
            >
              <span style={{ fontSize: '20px' }}>⚡</span>
              <span style={{ fontSize: '10px', fontWeight: 900, marginTop: '2px' }}>USE [E]</span>
            </button>
          </div>
        )}

        {/* Floating Contextual Interaction Pill */}
        {nearbyAction && activeTerminal === null && phase !== 'VOTING' && (
          <div
            style={{
              position: 'absolute',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '10px 20px',
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#38bdf8' }}>
                LOBBY ROSTER ({players.length}/3 MINIMUM)
              </span>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                Host: {players.find((p) => p.id === hostId)?.username || 'Connecting...'}
              </span>
            </div>

            {/* 3-Player Lobby Gate Status */}
            <div
              style={{
                padding: '8px 10px',
                backgroundColor: players.length >= 3 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                border: players.length >= 3 ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '6px',
                marginBottom: '10px',
                fontSize: '11px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, color: players.length >= 3 ? '#34d399' : '#f87171' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: players.length >= 3 ? '#10b981' : '#ef4444' }} />
                <span>{players.length >= 3 ? 'SQUAD READY (3/3 LOGGED IN)' : `WAITING FOR 3 PLAYERS (${players.length}/3)`}</span>
              </div>
              <div style={{ fontSize: '10px', color: '#cbd5e1' }}>
                {players.length >= 3
                  ? '3 players logged in! Redirecting to main battle map...'
                  : `Game stays in lobby until 3 players log in (need ${3 - players.length} more).`}
              </div>
            </div>

            {/* Imposter Scaling Info & Setting */}
            <div style={{ padding: '8px 10px', backgroundColor: '#090d16', borderRadius: '6px', border: '1px solid #1e293b', marginBottom: '8px', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', marginBottom: '4px' }}>
                <span>Imposter Scaling:</span>
                <span style={{ color: '#ef4444', fontWeight: 700 }}>{calculatedImposters} Infiltrator(s)</span>
              </div>
              {isHost && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                  <label style={{ fontSize: '10px', color: '#64748b' }}>Imposter Mode:</label>
                  <select
                    value={imposterSetting}
                    onChange={(e) => socket.emit('set_game_settings', { roomId, imposterSetting: e.target.value, playerSpeed })}
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

            {/* Movement Speed Info & Host Calibration */}
            <div style={{ padding: '8px 10px', backgroundColor: '#090d16', borderRadius: '6px', border: '1px solid #1e293b', marginBottom: '12px', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', marginBottom: '4px' }}>
                <span>Movement Speed:</span>
                <span style={{ color: '#38bdf8', fontWeight: 700 }}>{playerSpeed}x {playerSpeed === 2.4 ? '(Balanced)' : ''}</span>
              </div>
              {isHost ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                  <input
                    type="range"
                    min="1.5"
                    max="4.5"
                    step="0.1"
                    value={playerSpeed}
                    onChange={(e) => {
                      const spd = parseFloat(e.target.value);
                      setPlayerSpeed(spd);
                      socket.emit('set_game_settings', { roomId, imposterSetting, playerSpeed: spd });
                    }}
                    style={{ width: '100%', accentColor: '#38bdf8' }}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                    {[
                      { label: 'Stealth 1.8x', val: 1.8 },
                      { label: 'Normal 2.4x', val: 2.4 },
                      { label: 'Combat 3.2x', val: 3.2 },
                      { label: 'Super 4.0x', val: 4.0 }
                    ].map((p) => (
                      <button
                        key={p.val}
                        type="button"
                        onClick={() => {
                          setPlayerSpeed(p.val);
                          socket.emit('set_game_settings', { roomId, imposterSetting, playerSpeed: p.val });
                        }}
                        style={{
                          padding: '3px 0',
                          fontSize: '9px',
                          fontWeight: 700,
                          backgroundColor: playerSpeed === p.val ? '#0284c7' : '#1e293b',
                          border: playerSpeed === p.val ? '1px solid #38bdf8' : '1px solid #334155',
                          borderRadius: '4px',
                          color: '#fff',
                          cursor: 'pointer'
                        }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                  Speed managed by Host.
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
                disabled={players.length < 3}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: players.length >= 3 ? '#0284c7' : '#334155',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 800,
                  letterSpacing: '1px',
                  cursor: players.length >= 3 ? 'pointer' : 'not-allowed',
                  boxShadow: players.length >= 3 ? '0 0 15px rgba(2, 132, 199, 0.5)' : 'none'
                }}
              >
                {players.length >= 3 ? 'REDIRECT SQUAD TO MAIN MAP ➔' : `LOBBY LOCKED (${players.length}/3 PLAYERS)`}
              </button>
            ) : (
              <div style={{ textAlign: 'center', fontSize: '11px', color: '#94a3b8', padding: '8px' }}>
                {players.length >= 3
                  ? '3 players in lobby! Redirecting to main map...'
                  : `Game stays in lobby until 3 players log in (${players.length}/3)...`}
              </div>
            )}
          </div>
        )}

        {/* REAL-TIME MINI-MAP HUD (Top Right, 240x175 Widescreen Laptop Radar) */}
        {showMiniMap && (
          <div
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              width: '240px',
              height: '175px',
              backgroundColor: 'rgba(5, 10, 20, 0.94)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              borderRadius: '10px',
              boxShadow: '0 12px 30px rgba(0,0,0,0.8), 0 0 16px rgba(56, 189, 248, 0.15)',
              zIndex: 15,
              overflow: 'hidden'
            }}
          >
            {/* Radar Header */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '20px',
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                borderBottom: '1px solid rgba(56, 189, 248, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 8px',
                zIndex: 3
              }}
            >
              <span style={{ fontSize: '9px', fontWeight: 900, color: '#38bdf8', letterSpacing: '0.8px' }}>
                RADAR // 3600x2700
              </span>
              <span style={{ fontSize: '8px', color: '#94a3b8' }}>
                [M] TOGGLE
              </span>
            </div>

            {/* Map Rooms Outline in miniature with subtle room tints */}
            <div style={{ position: 'absolute', inset: '20px 0 0 0', opacity: 0.75 }}>
              {/* Bridge */}
              <div style={{ position: 'absolute', left: '37.5%', top: '7.4%', width: '25%', height: '22.2%', border: '1px solid #38bdf8', backgroundColor: 'rgba(56, 189, 248, 0.08)', borderRadius: '3px' }}>
                <span style={{ position: 'absolute', top: '2px', left: '3px', fontSize: '7px', color: '#7dd3fc', fontWeight: 700 }}>BRIDGE</span>
              </div>
              {/* AI Mainframe */}
              <div style={{ position: 'absolute', left: '6.9%', top: '7.4%', width: '22.2%', height: '24%', border: '1px solid #818cf8', backgroundColor: 'rgba(129, 140, 248, 0.08)', borderRadius: '3px' }}>
                <span style={{ position: 'absolute', top: '2px', left: '3px', fontSize: '7px', color: '#a5b4fc', fontWeight: 700 }}>ENGINES</span>
              </div>
              {/* Comms */}
              <div style={{ position: 'absolute', left: '70.8%', top: '7.4%', width: '22.2%', height: '24%', border: '1px solid #f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.08)', borderRadius: '3px' }}>
                <span style={{ position: 'absolute', top: '2px', left: '3px', fontSize: '7px', color: '#fcd34d', fontWeight: 700 }}>COMMS</span>
              </div>
              {/* Security */}
              <div style={{ position: 'absolute', left: '5.5%', top: '40.7%', width: '22.2%', height: '27.7%', border: '1px solid #ef4444', backgroundColor: 'rgba(239, 68, 68, 0.08)', borderRadius: '3px' }}>
                <span style={{ position: 'absolute', top: '2px', left: '3px', fontSize: '7px', color: '#fca5a5', fontWeight: 700 }}>SECURITY</span>
              </div>
              {/* Central Atrium */}
              <div style={{ position: 'absolute', left: '37.5%', top: '38.8%', width: '25%', height: '22.2%', border: '1px solid #94a3b8', backgroundColor: 'rgba(148, 163, 184, 0.08)', borderRadius: '3px' }}>
                <span style={{ position: 'absolute', top: '2px', left: '3px', fontSize: '7px', color: '#cbd5e1', fontWeight: 700 }}>ATRIUM</span>
              </div>
              {/* Bio-Lab */}
              <div style={{ position: 'absolute', left: '72.2%', top: '40.7%', width: '22.2%', height: '27.7%', border: '1px solid #10b981', backgroundColor: 'rgba(16, 185, 129, 0.08)', borderRadius: '3px' }}>
                <span style={{ position: 'absolute', top: '2px', left: '3px', fontSize: '7px', color: '#6ee7b7', fontWeight: 700 }}>MEDBAY</span>
              </div>
              {/* Reactor */}
              <div style={{ position: 'absolute', left: '37.5%', top: '70.3%', width: '25%', height: '22.2%', border: '1px solid #a855f7', backgroundColor: 'rgba(168, 85, 247, 0.08)', borderRadius: '3px' }}>
                <span style={{ position: 'absolute', top: '2px', left: '3px', fontSize: '7px', color: '#d8b4fe', fontWeight: 700 }}>REACTOR</span>
              </div>
            </div>

            {/* Terminal Status Blips */}
            {terminals.map((t) => (
              <div
                key={t.id}
                title={`${t.name} (${t.solved ? 'FIXED' : t.sabotaged ? 'SABOTAGED' : 'PENDING'})`}
                style={{
                  position: 'absolute',
                  left: `${Math.round((t.x / MAP_WIDTH) * 240) - 3}px`,
                  top: `${20 + Math.round((t.y / MAP_HEIGHT) * 155) - 3}px`,
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: t.solved ? '#10b981' : (t.sabotaged ? '#ef4444' : '#f59e0b'),
                  boxShadow: t.solved ? '0 0 6px #10b981' : (t.sabotaged ? '0 0 8px #ef4444' : '0 0 6px #f59e0b'),
                  zIndex: 4
                }}
              />
            ))}

            {/* Local Player Blip */}
            <div
              style={{
                position: 'absolute',
                left: `${Math.round((localPos.x / MAP_WIDTH) * 240) - 4}px`,
                top: `${20 + Math.round((localPos.y / MAP_HEIGHT) * 155) - 4}px`,
                width: '9px',
                height: '9px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                border: '2px solid #38bdf8',
                boxShadow: '0 0 10px #38bdf8, 0 0 4px #ffffff',
                zIndex: 5
              }}
            />
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
              width: '540px',
              backgroundColor: '#0f172a',
              border: '2px solid #38bdf8',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.9), 0 0 30px rgba(56, 189, 248, 0.25)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '12px', marginBottom: '18px' }}>
              <span style={{ fontSize: '15px', fontWeight: 900, color: '#38bdf8', letterSpacing: '1px' }}>
                CREWMATE CUSTOMIZER // LAPTOP
              </span>
              <button
                onClick={() => setShowWardrobe(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
              {/* Left: Live Crewmate Preview */}
              <div
                style={{
                  width: '140px',
                  backgroundColor: '#090d16',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px 6px'
                }}
              >
                <CrewmatePreview colorId={selectedHero} hatId={selectedHat} width={110} height={130} isMoving={true} />
                <span style={{ fontSize: '12px', fontWeight: 900, color: getCrewmateColor(selectedHero).hex, marginTop: '4px' }}>
                  {getCrewmateColor(selectedHero).name}
                </span>
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                  {CREWMATE_HATS.find(h => h.id === selectedHat)?.name || 'No Hat'}
                </span>
              </div>

              {/* Right: Colors & Hats Grid */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* 12 Colors */}
                <div>
                  <label style={{ display: 'block', fontSize: '10px', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.8px', marginBottom: '6px' }}>
                    SUIT COLOR
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px' }}>
                    {CREWMATE_COLORS.map((c) => {
                      const isSel = selectedHero === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setSelectedHero(c.id);
                            setSelectedColor(c.hex);
                            setSelectedVisor('#98d0e1');
                            localStorage.setItem('amongus_color', c.id);
                            localStorage.setItem('code_mafia_hero', c.id);
                            socket.emit('update_appearance', {
                              roomId,
                              color: c.hex,
                              visorColor: '#98d0e1',
                              operativeTitle: selectedTitle,
                              characterId: c.id,
                              hatId: selectedHat
                            });
                          }}
                          style={{
                            height: '28px',
                            borderRadius: '6px',
                            backgroundColor: c.hex,
                            border: isSel ? '3px solid #ffffff' : '1px solid rgba(0,0,0,0.6)',
                            boxShadow: isSel ? '0 0 10px #ffffff' : 'none',
                            cursor: 'pointer',
                            transform: isSel ? 'scale(1.1)' : 'scale(1)',
                            transition: 'all 0.15s ease'
                          }}
                          title={c.name}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* 10 Hats */}
                <div>
                  <label style={{ display: 'block', fontSize: '10px', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.8px', marginBottom: '6px' }}>
                    EQUIP HAT
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', maxHeight: '120px', overflowY: 'auto' }}>
                    {CREWMATE_HATS.map((h) => {
                      const isSel = selectedHat === h.id;
                      return (
                        <button
                          key={h.id}
                          type="button"
                          onClick={() => {
                            setSelectedHat(h.id);
                            localStorage.setItem('amongus_hat', h.id);
                            socket.emit('update_appearance', {
                              roomId,
                              color: getCrewmateColor(selectedHero).hex,
                              visorColor: '#98d0e1',
                              operativeTitle: selectedTitle,
                              characterId: selectedHero,
                              hatId: h.id
                            });
                          }}
                          style={{
                            padding: '6px 2px',
                            borderRadius: '6px',
                            backgroundColor: isSel ? '#1e293b' : '#090d16',
                            border: isSel ? '2px solid #38bdf8' : '1px solid #1e293b',
                            color: '#fff',
                            fontSize: '10px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '2px'
                          }}
                        >
                          <span style={{ fontSize: '16px' }}>{h.emoji}</span>
                          <span style={{ fontSize: '8px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '44px' }}>
                            {h.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Role Title */}
                <div>
                  <label style={{ display: 'block', fontSize: '10px', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.8px', marginBottom: '4px' }}>
                    CREW TITLE
                  </label>
                  <select
                    value={selectedTitle}
                    onChange={(e) => {
                      setSelectedTitle(e.target.value);
                      socket.emit('update_appearance', {
                        roomId,
                        color: getCrewmateColor(selectedHero).hex,
                        visorColor: '#98d0e1',
                        operativeTitle: e.target.value,
                        characterId: selectedHero,
                        hatId: selectedHat
                      });
                    }}
                    style={{ width: '100%', padding: '6px 10px', backgroundColor: '#090d16', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '11px' }}
                  >
                    {OPERATIVE_TITLES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowWardrobe(false)}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#0284c7',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontWeight: 800,
                fontSize: '12px',
                letterSpacing: '1px',
                cursor: 'pointer',
                boxShadow: '0 0 16px rgba(56, 189, 248, 0.4)'
              }}
            >
              SAVE & RETURN TO THE SKELD
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
                {/* 10-Minute Code Sprint Timer Badge */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: timer < 60 ? '1px solid #ef4444' : '1px solid #0284c7',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: 800,
                    color: timer < 60 ? '#f87171' : '#38bdf8',
                    fontVariantNumeric: 'tabular-nums'
                  }}
                >
                  <Clock size={13} color={timer < 60 ? '#ef4444' : '#38bdf8'} />
                  <span>TIME REMAINING: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</span>
                </div>

                <button
                  onClick={() => {
                    setIsRunningTests(true);
                    if (!connected || isSoloMode) {
                      setTimeout(() => {
                        const results = evaluateTerminalLocally(activeTerminal, terminalCode);
                        setIsRunningTests(false);
                        setTestResults(results);
                        if (results.isSolved) {
                          setTerminals((prev) =>
                            prev.map((t) => (t.id === activeTerminal.id ? { ...t, solved: true } : t))
                          );
                          setSolvedCount((c) => c + 1);
                          setChatMessages((prev) => [
                            ...prev,
                            {
                              id: Date.now().toString(),
                              sender: 'SHIP-AI',
                              text: `[SYSTEM] ${activeTerminal.name} has been stabilized by ${username.trim() || 'Operative'}!`,
                              system: true
                            }
                          ]);
                        }
                      }, 350);
                      return;
                    }
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
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '20px', backgroundColor: 'rgba(239, 68, 68, 0.25)', border: '2px solid #ef4444', color: '#f87171', fontSize: '12px', fontWeight: 900, letterSpacing: '1px', marginBottom: '8px' }}>
              <AlertTriangle size={15} /> EMERGENCY MEETING // TIME REMAINING: {timer}s
            </div>
            <h2 style={{ margin: 0, fontSize: '32px', fontWeight: 900, color: '#f8fafc', letterSpacing: '1px', textShadow: '0 0 20px rgba(255,255,255,0.3)' }}>
              Who Is The Impostor?
            </h2>
            <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>
              Called by: <span style={{ color: '#38bdf8', fontWeight: 700 }}>{emergencyCaller || 'Emergency Button'}</span>. Vote out the suspect or skip.
            </p>
          </div>

          {/* Voting Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', width: '100%', maxWidth: '880px', marginBottom: '20px' }}>
            {players.filter((p) => p.isAlive).map((suspect) => {
              const hasVoted = Boolean(suspect.votedFor);
              return (
                <div
                  key={suspect.id}
                  style={{
                    padding: '12px',
                    backgroundColor: votedSuspect === suspect.id ? '#1e293b' : '#0f172a',
                    border: votedSuspect === suspect.id ? '2px solid #38bdf8' : '2px solid #334155',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    position: 'relative',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.6)'
                  }}
                >
                  {/* Red VOTED Stamp */}
                  {hasVoted && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        padding: '2px 6px',
                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                        border: '2px solid #ef4444',
                        color: '#ef4444',
                        fontSize: '9px',
                        fontWeight: 900,
                        borderRadius: '4px',
                        transform: 'rotate(12deg)',
                        letterSpacing: '1px'
                      }}
                    >
                      VOTED
                    </div>
                  )}

                  <div style={{ width: '60px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CrewmatePreview colorId={suspect.characterId || 'red'} hatId={suspect.hatId || 'none'} width={54} height={64} isMoving={false} />
                  </div>

                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc', textAlign: 'center', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {suspect.username} {suspect.id === socket.id && '(YOU)'}
                  </span>

                  {suspect.id !== socket.id && !votedSuspect && (
                    <button
                      onClick={() => {
                        playVoteSound();
                        setVotedSuspect(suspect.id);
                        socket.emit('cast_vote', { roomId, suspectId: suspect.id });
                      }}
                      style={{
                        width: '100%',
                        padding: '8px',
                        marginTop: '4px',
                        backgroundColor: '#16a34a',
                        border: '1px solid #22c55e',
                        borderRadius: '6px',
                        color: '#fff',
                        fontSize: '11px',
                        fontWeight: 900,
                        cursor: 'pointer',
                        boxShadow: '0 0 10px rgba(34, 197, 94, 0.4)'
                      }}
                    >
                      VOTE SUSPECT ✔
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
                playVoteSound();
                setVotedSuspect('SKIP');
                socket.emit('cast_vote', { roomId, suspectId: 'SKIP' });
              }}
              style={{
                padding: '10px 28px',
                backgroundColor: '#1e293b',
                border: '2px solid #475569',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '12px',
                fontWeight: 900,
                letterSpacing: '0.8px',
                cursor: 'pointer',
                marginBottom: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
              }}
            >
              SKIP VOTE / NO ONE EJECTED
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
                if (!connected || isSoloMode) {
                  const heroObj = getHero(selectedHero);
                  setChatMessages((prev) => [
                    ...prev,
                    {
                      id: Date.now().toString(),
                      sender: username.trim() || 'Operative',
                      color: heroObj.primaryColor,
                      text: chatInput.trim(),
                      system: false
                    }
                  ]);
                } else {
                  socket.emit('send_chat', { roomId, message: chatInput });
                }
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

      {/* =====================================================================
          THANOS SNAP CINEMATIC ELIMINATION MODAL
          ===================================================================== */}
      {eliminationCutscene && (
        <EliminationCinematicModal
          cutscene={eliminationCutscene}
          onClose={() => setEliminationCutscene(null)}
        />
      )}
    </div>
  );
}