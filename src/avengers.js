// =============================================================================
// AVENGERS ASSEMBLE: HEROES DATA, PREMIUM HD VECTOR GRAPHICS & ANIMATION ENGINE
// Ultra-realistic shading, gradient fills, glow effects, cinematic quality
// =============================================================================

export const AVENGERS_HEROES = [
  {
    id: 'ironman',
    name: 'Iron Man',
    alias: 'Tony Stark',
    roleTitle: 'Armored Avenger',
    primaryColor: '#ef4444',
    secondaryColor: '#eab308',
    visorColor: '#38bdf8',
    glowColor: 'rgba(239, 68, 68, 0.55)',
    relicName: 'Arc Reactor & Mark 85 Helmet',
    quote: 'I am Iron Man.',
    iconEmoji: '🦾'
  },
  {
    id: 'captainamerica',
    name: 'Captain America',
    alias: 'Steve Rogers',
    roleTitle: 'First Avenger',
    primaryColor: '#3b82f6',
    secondaryColor: '#ef4444',
    visorColor: '#ffffff',
    glowColor: 'rgba(59, 130, 246, 0.55)',
    relicName: 'Vibranium Shield',
    quote: 'I can do this all day.',
    iconEmoji: '🛡️'
  },
  {
    id: 'thor',
    name: 'Thor',
    alias: 'Odinson',
    roleTitle: 'God of Thunder',
    primaryColor: '#dc2626',
    secondaryColor: '#cbd5e1',
    visorColor: '#67e8f9',
    glowColor: 'rgba(103, 232, 249, 0.6)',
    relicName: 'Mjolnir Lightning Hammer',
    quote: 'Bring me Thanos!',
    iconEmoji: '⚡'
  },
  {
    id: 'hulk',
    name: 'Hulk',
    alias: 'Bruce Banner',
    roleTitle: 'Gamma Juggernaut',
    primaryColor: '#22c55e',
    secondaryColor: '#7c3aed',
    visorColor: '#86efac',
    glowColor: 'rgba(34, 197, 94, 0.6)',
    relicName: 'Gamma Radiation Crater',
    quote: 'Hulk Smash!',
    iconEmoji: '💥'
  },
  {
    id: 'blackwidow',
    name: 'Black Widow',
    alias: 'Natasha Romanoff',
    roleTitle: 'Master Assassin',
    primaryColor: '#475569',
    secondaryColor: '#ea580c',
    visorColor: '#38bdf8',
    glowColor: 'rgba(234, 88, 12, 0.55)',
    relicName: "Widow's Bite Taser Gauntlets",
    quote: 'I have red in my ledger.',
    iconEmoji: '🕷️'
  },
  {
    id: 'spiderman',
    name: 'Spider-Man',
    alias: 'Peter Parker',
    roleTitle: 'Web-Slinger',
    primaryColor: '#e11d48',
    secondaryColor: '#1d4ed8',
    visorColor: '#ffffff',
    glowColor: 'rgba(225, 29, 72, 0.55)',
    relicName: 'Webbed Spider Mask',
    quote: 'With great power comes great responsibility.',
    iconEmoji: '🕸️'
  },
  {
    id: 'doctorstrange',
    name: 'Doctor Strange',
    alias: 'Stephen Strange',
    roleTitle: 'Sorcerer Supreme',
    primaryColor: '#6366f1',
    secondaryColor: '#991b1b',
    visorColor: '#f97316',
    glowColor: 'rgba(249, 115, 22, 0.6)',
    relicName: 'Eye of Agamotto Amulet',
    quote: "We're in the endgame now.",
    iconEmoji: '🔮'
  },
  {
    id: 'blackpanther',
    name: 'Black Panther',
    alias: "King T'Challa",
    roleTitle: 'King of Wakanda',
    primaryColor: '#a855f7',
    secondaryColor: '#c084fc',
    visorColor: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.6)',
    relicName: 'Vibranium Claw Necklace',
    quote: 'Wakanda Forever!',
    iconEmoji: '🐾'
  },
  {
    id: 'hawkeye',
    name: 'Hawkeye',
    alias: 'Clint Barton',
    roleTitle: 'Master Marksman',
    primaryColor: '#7e22ce',
    secondaryColor: '#334155',
    visorColor: '#f59e0b',
    glowColor: 'rgba(126, 34, 206, 0.55)',
    relicName: 'Recurve Bow & Quiver',
    quote: 'I never miss.',
    iconEmoji: '🎯'
  }
];

export function getHero(heroId) {
  return AVENGERS_HEROES.find((h) => h.id === heroId) || AVENGERS_HEROES[0];
}

// Helper to draw a 5-pointed star
function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius, fillStyle) {
  let rot = (Math.PI / 2) * 3;
  let x = cx, y = cy;
  const step = Math.PI / spikes;
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;
    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fillStyle = fillStyle;
  ctx.fill();
}

// Helper: apply a metallic sheen gradient
function makeMetalGrad(ctx, x1, y1, x2, y2, colorDark, colorMid, colorLight) {
  const g = ctx.createLinearGradient(x1, y1, x2, y2);
  g.addColorStop(0,   colorDark);
  g.addColorStop(0.3, colorMid);
  g.addColorStop(0.6, colorLight);
  g.addColorStop(1,   colorDark);
  return g;
}

// Helper: radial glow fill
function makeRadialGlow(ctx, x, y, r1, r2, colorInner, colorOuter) {
  const g = ctx.createRadialGradient(x, y, r1, x, y, r2);
  g.addColorStop(0, colorInner);
  g.addColorStop(1, colorOuter);
  return g;
}

// =============================================================================
// MAIN DRAW DISPATCHER
// =============================================================================
export function drawAvenger(ctx, heroId, pWalk, time, isPlMoving, isFacingLeft, isGhost, isLocal) {
  const hero = getHero(heroId);
  ctx.save();

  // Ethereal Ghost Mode — semi-transparent blue specter
  if (isGhost) {
    ctx.globalAlpha = 0.38;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 18;
    ctx.translate(0, -10 + Math.sin(time * 2.5) * 5);
  }

  // Ground Shadow (graded ellipse)
  if (!isGhost) {
    ctx.save();
    const shadowRad = hero.id === 'hulk' ? 26 : 18;
    const shadowGrad = ctx.createRadialGradient(0, 22, 0, 0, 22, shadowRad);
    shadowGrad.addColorStop(0, 'rgba(0,0,0,0.55)');
    shadowGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.ellipse(0, 22, shadowRad, 8, 0, 0, Math.PI * 2);
    ctx.fillStyle = shadowGrad;
    ctx.fill();
    ctx.restore();
  }

  if (isFacingLeft) ctx.scale(-1, 1);

  switch (hero.id) {
    case 'ironman':        renderIronMan(ctx, pWalk, time, isPlMoving, isGhost); break;
    case 'captainamerica': renderCaptainAmerica(ctx, pWalk, time, isPlMoving, isGhost); break;
    case 'thor':           renderThor(ctx, pWalk, time, isPlMoving, isGhost); break;
    case 'hulk':           renderHulk(ctx, pWalk, time, isPlMoving, isGhost); break;
    case 'blackwidow':     renderBlackWidow(ctx, pWalk, time, isPlMoving, isGhost); break;
    case 'spiderman':      renderSpiderMan(ctx, pWalk, time, isPlMoving, isGhost); break;
    case 'doctorstrange':  renderDoctorStrange(ctx, pWalk, time, isPlMoving, isGhost); break;
    case 'blackpanther':   renderBlackPanther(ctx, pWalk, time, isPlMoving, isGhost); break;
    case 'hawkeye':        renderHawkeye(ctx, pWalk, time, isPlMoving, isGhost); break;
    default:               renderIronMan(ctx, pWalk, time, isPlMoving, isGhost);
  }

  // Ghost halo
  if (isGhost) {
    ctx.save();
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 10;
    ctx.strokeStyle = 'rgba(56,189,248,0.9)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, -42, 13, 4, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Local player outline glow
  if (isLocal && !isGhost) {
    ctx.save();
    ctx.shadowColor = 'rgba(255,255,255,0.6)';
    ctx.shadowBlur = 14;
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 30, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}

// =============================================================================
// 1. IRON MAN — Mark 85 Nanotech Armor with Arc Reactor & Boot Jets
// =============================================================================
function renderIronMan(ctx, pWalk, time, isMoving, isGhost) {
  const hoverY = isMoving ? 0 : Math.sin(time * 2.5) * 1.5;
  ctx.translate(0, hoverY);

  // --- Boot Jet Exhaust ---
  if (isMoving && !isGhost) {
    ctx.save();
    const flameL = 14 + Math.random() * 8;
    const flameGrad = ctx.createLinearGradient(0, 22, 0, 22 + flameL);
    flameGrad.addColorStop(0, '#ffffff');
    flameGrad.addColorStop(0.25, '#38bdf8');
    flameGrad.addColorStop(0.7, 'rgba(6,182,212,0.4)');
    flameGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = flameGrad;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 10;
    // Left boot
    ctx.beginPath(); ctx.moveTo(-10 + pWalk, 22); ctx.lineTo(-5 + pWalk, 22 + flameL); ctx.lineTo(-1 + pWalk, 22); ctx.fill();
    // Right boot
    ctx.beginPath(); ctx.moveTo(1 - pWalk, 22); ctx.lineTo(5 - pWalk, 22 + flameL); ctx.lineTo(9 - pWalk, 22); ctx.fill();
    ctx.restore();
  }

  // --- Legs: Crimson Nano-Plates ---
  const legGrad = makeMetalGrad(ctx, -10, 8, 10, 22, '#7f1d1d', '#b91c1c', '#ef4444');
  ctx.fillStyle = legGrad;
  ctx.fillRect(-9 + pWalk, 8, 13, 14);
  ctx.fillRect(2 - pWalk, 8, 8, 14);

  // Gold knee joints
  ctx.fillStyle = '#ca8a04';
  ctx.fillRect(-8 + pWalk, 13, 7, 3);
  ctx.fillRect(2 - pWalk, 13, 7, 3);

  // Red boots
  ctx.fillStyle = makeMetalGrad(ctx, -10, 20, 10, 24, '#991b1b', '#dc2626', '#ef4444');
  ctx.fillRect(-10 + pWalk, 19, 9, 5);
  ctx.fillRect(1 - pWalk, 19, 9, 5);

  // --- Torso: Red/Gold Chestplate ---
  const chestGrad = makeMetalGrad(ctx, -14, -14, 14, 9, '#7f1d1d', '#b91c1c', '#ef4444');
  ctx.beginPath();
  ctx.moveTo(-14, -14); ctx.lineTo(14, -14);
  ctx.lineTo(11, 9); ctx.lineTo(-11, 9);
  ctx.closePath();
  ctx.fillStyle = chestGrad;
  ctx.fill();
  ctx.strokeStyle = '#ca8a04';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Gold rib inlays
  const goldGrad = makeMetalGrad(ctx, -14, -8, 14, 6, '#78350f', '#ca8a04', '#fde68a');
  ctx.fillStyle = goldGrad;
  ctx.fillRect(-14, -8, 3.5, 15);
  ctx.fillRect(10.5, -8, 3.5, 15);

  // --- Arc Reactor (Unibeam) ---
  const arcPulse = Math.sin(time * 6) * 1.8;
  ctx.save();
  const arcGrad = makeRadialGlow(ctx, 0, -2, 0, 7 + arcPulse, '#ffffff', 'rgba(56,189,248,0)');
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.arc(0, -2, 5.5 + arcPulse, 0, Math.PI * 2);
  ctx.fillStyle = arcGrad;
  ctx.fill();
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Inner core
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, -2, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // --- Shoulder Pauldrons ---
  const shoulderGrad = makeMetalGrad(ctx, -17, -13, 17, -4, '#78350f', '#ca8a04', '#fde68a');
  ctx.fillStyle = shoulderGrad;
  ctx.fillRect(-18, -14, 5.5, 10);
  ctx.fillRect(12.5, -14, 5.5, 10);

  // Arms
  ctx.fillStyle = makeMetalGrad(ctx, -17, -4, 17, 8, '#7f1d1d', '#dc2626', '#ef4444');
  ctx.fillRect(-17, -4, 4.5, 13);
  ctx.fillRect(12.5, -4, 4.5, 13);

  // Repulsor palms (glowing)
  ctx.save();
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 8;
  ctx.fillStyle = '#7dd3fc';
  ctx.fillRect(-17, 7, 4.5, 2.5);
  ctx.fillRect(12.5, 7, 4.5, 2.5);
  ctx.restore();

  // --- Helmet ---
  const helmGrad = makeRadialGlow(ctx, -3, -26, 2, 14, '#ef4444', '#7f1d1d');
  ctx.beginPath();
  ctx.arc(0, -25, 13.5, 0, Math.PI * 2);
  ctx.fillStyle = helmGrad;
  ctx.fill();
  ctx.strokeStyle = '#7f1d1d';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Gold faceplate
  const faceGrad = makeMetalGrad(ctx, -8, -32, 8, -13, '#78350f', '#ca8a04', '#fde68a');
  ctx.beginPath();
  ctx.moveTo(-7, -31); ctx.lineTo(7, -31);
  ctx.lineTo(8.5, -20); ctx.lineTo(5, -13);
  ctx.lineTo(-5, -13); ctx.lineTo(-8.5, -20);
  ctx.closePath();
  ctx.fillStyle = faceGrad;
  ctx.fill();

  // Glowing cyan visor slits
  ctx.save();
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 12;
  ctx.fillStyle = '#e0f7ff';
  ctx.fillRect(-7, -24, 4.5, 2.5);
  ctx.fillRect(2.5, -24, 4.5, 2.5);
  ctx.restore();
}

// =============================================================================
// 2. CAPTAIN AMERICA — Vibranium Shield, Cowl Star, Red/White Stripes
// =============================================================================
function renderCaptainAmerica(ctx, pWalk, time, isMoving) {
  // Legs
  const legGrad = makeMetalGrad(ctx, -10, 8, 10, 22, '#1e3a8a', '#2563eb', '#3b82f6');
  ctx.fillStyle = legGrad;
  ctx.fillRect(-9 + pWalk, 8, 8, 14);
  ctx.fillRect(2 - pWalk, 8, 8, 14);
  // Brown boots
  ctx.fillStyle = '#78350f';
  ctx.fillRect(-10 + pWalk, 18, 9, 6);
  ctx.fillRect(1 - pWalk, 18, 9, 6);

  // Torso — blue upper
  const chestGrad = makeMetalGrad(ctx, -14, -14, 14, -1, '#1e3a8a', '#2563eb', '#3b82f6');
  ctx.beginPath();
  ctx.moveTo(-14, -14); ctx.lineTo(14, -14);
  ctx.lineTo(11, -1); ctx.lineTo(-11, -1);
  ctx.closePath();
  ctx.fillStyle = chestGrad;
  ctx.fill();

  // Chest star
  ctx.save();
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 8;
  drawStar(ctx, 0, -8, 5, 5.5, 2.5, '#ffffff');
  ctx.restore();

  // Red & white stripes (midriff)
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#dc2626' : '#f1f5f9';
    ctx.fillRect(-11 + i * 5.5, -1, 5.5, 10);
  }

  // Belt
  ctx.fillStyle = '#78350f';
  ctx.fillRect(-12, 7, 24, 4);
  ctx.fillStyle = '#ca8a04';
  ctx.fillRect(-3, 7, 6, 4);

  // Head
  const helmGrad = makeRadialGlow(ctx, -3, -26, 2, 14, '#2563eb', '#1e3a8a');
  ctx.beginPath();
  ctx.arc(0, -25, 13.5, 0, Math.PI * 2);
  ctx.fillStyle = helmGrad;
  ctx.fill();
  ctx.strokeStyle = '#1e3a8a';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Face skin
  ctx.fillStyle = '#fde68a';
  ctx.beginPath();
  ctx.arc(0, -22, 7, 0, Math.PI);
  ctx.fill();

  // 'A' helmet letter
  ctx.save();
  ctx.font = "bold 10px 'Orbitron', sans-serif";
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText('A', 0, -26);
  ctx.restore();

  // Temple wings
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillRect(-13, -27, 3, 2.5);
  ctx.fillRect(10, -27, 3, 2.5);

  // Vibranium Shield
  ctx.save();
  const shieldTilt = isMoving ? pWalk * 0.12 : 0;
  ctx.translate(-16, 0);
  ctx.rotate(shieldTilt);

  // Shield — outer red ring
  const shieldOuterGrad = makeRadialGlow(ctx, 0, 0, 6, 16, '#ef4444', '#7f1d1d');
  ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI * 2);
  ctx.fillStyle = shieldOuterGrad; ctx.fill();
  ctx.strokeStyle = '#991b1b'; ctx.lineWidth = 1.2; ctx.stroke();

  // White ring
  ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2);
  ctx.fillStyle = '#f1f5f9'; ctx.fill();

  // Inner red
  ctx.beginPath(); ctx.arc(0, 0, 8.5, 0, Math.PI * 2);
  ctx.fillStyle = '#ef4444'; ctx.fill();

  // Blue center
  const centerGrad = makeRadialGlow(ctx, 0, 0, 0, 5.5, '#3b82f6', '#1e3a8a');
  ctx.beginPath(); ctx.arc(0, 0, 5.5, 0, Math.PI * 2);
  ctx.fillStyle = centerGrad; ctx.fill();

  // Star
  ctx.save();
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 6;
  drawStar(ctx, 0, 0, 5, 4.5, 2, '#ffffff');
  ctx.restore();

  // Specular gleam
  ctx.strokeStyle = 'rgba(255,255,255,0.45)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, 0, 14, -Math.PI / 3, 0); ctx.stroke();
  ctx.restore();
}

// =============================================================================
// 3. THOR — Norse Cape, Silver Discs, Mjolnir with Crackling Lightning
// =============================================================================
function renderThor(ctx, pWalk, time, isMoving) {
  // Flowing Crimson Cape
  const capeWave = isMoving ? Math.sin(time * 8) * 7 : Math.sin(time * 2.5) * 2;
  const capeGrad = makeMetalGrad(ctx, -14, -14, 14 + capeWave, 24, '#7f1d1d', '#b91c1c', '#dc2626');
  ctx.beginPath();
  ctx.moveTo(-14, -14); ctx.lineTo(14, -14);
  ctx.quadraticCurveTo(18 + capeWave, 10, 14 + capeWave, 24);
  ctx.lineTo(-14 + capeWave * 0.5, 24);
  ctx.quadraticCurveTo(-18 + capeWave * 0.3, 10, -14, -14);
  ctx.closePath();
  ctx.fillStyle = capeGrad;
  ctx.fill();

  // Legs & chainmail
  ctx.fillStyle = makeMetalGrad(ctx, -10, 8, 10, 22, '#1e293b', '#334155', '#475569');
  ctx.fillRect(-9 + pWalk, 8, 8, 14);
  ctx.fillRect(2 - pWalk, 8, 8, 14);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-10 + pWalk, 18, 9, 6);
  ctx.fillRect(1 - pWalk, 18, 9, 6);

  // Dark armor vest
  const vestGrad = makeMetalGrad(ctx, -13, -14, 13, 8, '#0f172a', '#1e293b', '#334155');
  ctx.fillStyle = vestGrad;
  ctx.fillRect(-13, -14, 26, 22);
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-13, -14, 26, 22);

  // Four silver armor discs
  for (const [dx, dy] of [[-6, -8], [6, -8], [-6, 2], [6, 2]]) {
    const discGrad = makeRadialGlow(ctx, dx - 1, dy - 1, 0, 4.5, '#e2e8f0', '#94a3b8');
    ctx.beginPath(); ctx.arc(dx, dy, 4, 0, Math.PI * 2);
    ctx.fillStyle = discGrad; ctx.fill();
    ctx.strokeStyle = '#475569'; ctx.lineWidth = 0.8; ctx.stroke();
  }

  // Head — golden hair
  const hairGrad = makeRadialGlow(ctx, -3, -27, 3, 16, '#fbbf24', '#b45309');
  ctx.beginPath(); ctx.arc(0, -25, 15, 0, Math.PI * 2);
  ctx.fillStyle = hairGrad; ctx.fill();

  // Face
  ctx.fillStyle = '#fde68a';
  ctx.beginPath(); ctx.arc(0, -25, 10, 0, Math.PI * 2); ctx.fill();

  // Silver helmet
  ctx.fillStyle = makeMetalGrad(ctx, -10, -34, 10, -29, '#64748b', '#94a3b8', '#e2e8f0');
  ctx.fillRect(-10, -34, 20, 5.5);
  // Wings
  ctx.fillStyle = '#e2e8f0';
  ctx.beginPath(); ctx.moveTo(-10, -32); ctx.lineTo(-17, -42); ctx.lineTo(-9, -36); ctx.fill();
  ctx.beginPath(); ctx.moveTo(10, -32); ctx.lineTo(17, -42); ctx.lineTo(9, -36); ctx.fill();

  // Mjolnir
  ctx.save();
  const hammerSwing = isMoving ? Math.sin(time * 8) * 0.35 : 0;
  ctx.translate(17, 2);
  ctx.rotate(hammerSwing);

  // Handle
  ctx.fillStyle = '#78350f';
  ctx.fillRect(-2.5, -4, 5, 17);
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(-2.5, 11, 5, 2.5);

  // Hammer head
  const hammerGrad = makeMetalGrad(ctx, -9, -15, 9, -4, '#64748b', '#cbd5e1', '#e2e8f0');
  ctx.fillStyle = hammerGrad;
  ctx.fillRect(-9, -15, 18, 11);
  ctx.strokeStyle = '#475569'; ctx.lineWidth = 1.5;
  ctx.strokeRect(-9, -15, 18, 11);

  // Lightning from Mjolnir
  ctx.save();
  ctx.shadowColor = '#67e8f9';
  ctx.shadowBlur = 14;
  ctx.strokeStyle = '#e0f7ff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-5, -15); ctx.lineTo(-9 + Math.random() * 3, -22);
  ctx.lineTo(-4, -27); ctx.stroke();
  ctx.strokeStyle = '#67e8f9'; ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(5, -15); ctx.lineTo(11 + Math.random() * 3, -20);
  ctx.lineTo(7, -25); ctx.stroke();
  ctx.restore();

  ctx.restore();
}

// =============================================================================
// 4. HULK — Gamma Juggernaut: Bulging Muscles, Ripped Shorts
// =============================================================================
function renderHulk(ctx, pWalk, time, isMoving) {
  ctx.scale(1.25, 1.25);
  const stompSway = isMoving ? Math.sin(time * 5) * 3 : 0;
  ctx.translate(stompSway, 0);

  // Massive legs
  const legGrad = makeMetalGrad(ctx, -10, 8, 10, 22, '#14532d', '#15803d', '#22c55e');
  ctx.fillStyle = legGrad;
  ctx.fillRect(-10 + pWalk, 8, 9, 13);
  ctx.fillRect(2 - pWalk, 8, 9, 13);
  ctx.fillRect(-12 + pWalk, 18, 11, 5);
  ctx.fillRect(1 - pWalk, 18, 11, 5);

  // Shredded purple shorts
  ctx.fillStyle = makeMetalGrad(ctx, -16, 0, 16, 12, '#4c1d95', '#6d28d9', '#7c3aed');
  ctx.beginPath();
  ctx.moveTo(-17, 0); ctx.lineTo(17, 0);
  ctx.lineTo(15, 13); ctx.lineTo(10, 11);
  ctx.lineTo(6, 14); ctx.lineTo(0, 10);
  ctx.lineTo(-6, 14); ctx.lineTo(-10, 11);
  ctx.lineTo(-15, 13); ctx.closePath();
  ctx.fill();

  // Muscular torso
  const torsoGrad = makeMetalGrad(ctx, -18, -16, 18, 8, '#14532d', '#16a34a', '#22c55e');
  ctx.fillStyle = torsoGrad;
  ctx.fillRect(-18, -16, 36, 18);

  // Pec definition + abs
  ctx.fillStyle = 'rgba(74,222,128,0.35)';
  ctx.fillRect(-15, -14, 12, 8);
  ctx.fillRect(3, -14, 12, 8);
  ctx.fillRect(-9, -4, 7, 4.5);
  ctx.fillRect(2, -4, 7, 4.5);

  // Fists
  const fistGrad = makeRadialGlow(ctx, -19, -6, 0, 8, '#22c55e', '#14532d');
  ctx.fillStyle = fistGrad;
  ctx.beginPath(); ctx.arc(-19, -6, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = makeRadialGlow(ctx, 19, -6, 0, 8, '#22c55e', '#14532d');
  ctx.beginPath(); ctx.arc(19, -6, 8, 0, Math.PI * 2); ctx.fill();

  // Knuckle ridges
  ctx.fillStyle = '#15803d';
  for (let i = -2; i <= 2; i++) {
    ctx.fillRect(i * 3 - 20 + 0.5, -8, 2, 2);
    ctx.fillRect(i * 3 + 18, -8, 2, 2);
  }

  // Head
  const headGrad = makeRadialGlow(ctx, -3, -27, 3, 14, '#22c55e', '#14532d');
  ctx.beginPath(); ctx.arc(0, -26, 14, 0, Math.PI * 2);
  ctx.fillStyle = headGrad; ctx.fill();

  // Shaggy black hair
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(0, -30, 15, Math.PI, Math.PI * 2);
  ctx.lineTo(15, -27); ctx.lineTo(8, -25);
  ctx.lineTo(0, -28); ctx.lineTo(-8, -25);
  ctx.lineTo(-15, -27); ctx.closePath();
  ctx.fill();

  // Fierce gamma eyes
  ctx.save();
  ctx.shadowColor = '#86efac'; ctx.shadowBlur = 10;
  ctx.fillStyle = '#86efac';
  ctx.fillRect(-7, -27, 4, 2.5);
  ctx.fillRect(3, -27, 4, 2.5);
  ctx.restore();
}

// =============================================================================
// 5. BLACK WIDOW — Stealth Catsuit, Red Hair, Widow's Bite Gauntlets
// =============================================================================
function renderBlackWidow(ctx, pWalk, time, isMoving) {
  // Red ponytail braid
  const braidWave = isMoving ? Math.sin(time * 9) * 7 : Math.sin(time * 2) * 2;
  const braidGrad = makeMetalGrad(ctx, 4, -30, 14 + braidWave, -2, '#b45309', '#ea580c', '#f97316');
  ctx.fillStyle = braidGrad;
  ctx.beginPath();
  ctx.moveTo(3, -29); ctx.quadraticCurveTo(17 + braidWave, -20, 13 + braidWave, -3);
  ctx.lineTo(9 + braidWave, -3); ctx.quadraticCurveTo(11 + braidWave, -20, 1, -27);
  ctx.closePath(); ctx.fill();

  // Legs
  ctx.fillStyle = makeMetalGrad(ctx, -8, 8, 8, 22, '#020617', '#0f172a', '#1e293b');
  ctx.fillRect(-8 + pWalk, 8, 7, 14);
  ctx.fillRect(1 - pWalk, 8, 7, 14);
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-9 + pWalk, 18, 8, 5);
  ctx.fillRect(1 - pWalk, 18, 8, 5);

  // Sleek black catsuit torso
  const catGrad = makeMetalGrad(ctx, -11, -14, 11, 8, '#020617', '#0f172a', '#1e293b');
  ctx.beginPath();
  ctx.moveTo(-12, -14); ctx.lineTo(12, -14);
  ctx.lineTo(9, 8); ctx.lineTo(-9, 8);
  ctx.closePath();
  ctx.fillStyle = catGrad; ctx.fill();
  ctx.strokeStyle = '#334155'; ctx.lineWidth = 1; ctx.stroke();

  // Red hourglass emblem
  ctx.save();
  ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 6;
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.moveTo(-3.5, 3); ctx.lineTo(3.5, 3);
  ctx.lineTo(-3.5, 8); ctx.lineTo(3.5, 8);
  ctx.closePath(); ctx.fill();
  ctx.restore();

  // Widow's Bite gauntlets
  const gauntletGrad = makeMetalGrad(ctx, -15, -2, -10, 10, '#0f172a', '#1e293b', '#334155');
  ctx.fillStyle = gauntletGrad;
  ctx.fillRect(-15, -2, 5, 11);
  ctx.fillRect(10, -2, 5, 11);

  // Taser glow
  ctx.save();
  ctx.shadowColor = '#38bdf8'; ctx.shadowBlur = 12;
  ctx.fillStyle = '#7dd3fc';
  ctx.fillRect(-15, 6, 5, 3.5);
  ctx.fillRect(10, 6, 5, 3.5);
  // Arc sparks
  if (isMoving) {
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-15, 7); ctx.lineTo(-20, 5 + Math.random() * 4);
    ctx.moveTo(15, 7);  ctx.lineTo(20, 5 + Math.random() * 4);
    ctx.stroke();
  }
  ctx.restore();

  // Head
  const headGrad = makeRadialGlow(ctx, -3, -25, 3, 13, '#ea580c', '#7c2d12');
  ctx.beginPath(); ctx.arc(0, -25, 12.5, 0, Math.PI * 2);
  ctx.fillStyle = headGrad; ctx.fill();

  // Face
  ctx.fillStyle = '#fde68a';
  ctx.beginPath(); ctx.arc(0, -23, 7.5, 0, Math.PI * 2); ctx.fill();
}

// =============================================================================
// 6. SPIDER-MAN — Web Suit, Large Triangular Eyes, Web-Swinging Crouch
// =============================================================================
function renderSpiderMan(ctx, pWalk, time, isMoving) {
  const bounceY = isMoving ? Math.abs(Math.sin(time * 12)) * 2.5 : 0;
  ctx.translate(0, bounceY);

  // Blue legs + red boots
  ctx.fillStyle = makeMetalGrad(ctx, -9, 8, 9, 22, '#1e3a8a', '#1d4ed8', '#2563eb');
  ctx.fillRect(-9 + pWalk, 8, 8, 8);
  ctx.fillRect(1 - pWalk, 8, 8, 8);
  ctx.fillStyle = makeMetalGrad(ctx, -9, 15, 9, 23, '#991b1b', '#dc2626', '#ef4444');
  ctx.fillRect(-9 + pWalk, 15, 8, 8);
  ctx.fillRect(1 - pWalk, 15, 8, 8);

  // Blue flanks + red center
  ctx.fillStyle = makeMetalGrad(ctx, -13, -14, 13, 8, '#1e3a8a', '#1d4ed8', '#3b82f6');
  ctx.fillRect(-13, -14, 26, 22);
  const redGrad = makeMetalGrad(ctx, -7, -14, 7, 8, '#991b1b', '#dc2626', '#ef4444');
  ctx.beginPath();
  ctx.moveTo(-7, -14); ctx.lineTo(7, -14);
  ctx.lineTo(6, 8); ctx.lineTo(-6, 8);
  ctx.closePath();
  ctx.fillStyle = redGrad; ctx.fill();

  // Spider insignia
  ctx.fillStyle = '#000000';
  ctx.beginPath(); ctx.arc(0, -4, 3.5, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#000000'; ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-2, -5); ctx.lineTo(-8, -9);
  ctx.moveTo(2, -5);  ctx.lineTo(8, -9);
  ctx.moveTo(-2, -3); ctx.lineTo(-9, -2);
  ctx.moveTo(2, -3);  ctx.lineTo(9, -2);
  ctx.moveTo(-1, -1); ctx.lineTo(-6, 2);
  ctx.moveTo(1, -1);  ctx.lineTo(6, 2);
  ctx.stroke();

  // Web pattern on blue areas (fine lines)
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 0.6;
  for (let wy = -12; wy < 8; wy += 5) {
    ctx.beginPath(); ctx.moveTo(-13, wy); ctx.lineTo(13, wy); ctx.stroke();
  }
  for (let wx = -12; wx < 13; wx += 5) {
    ctx.beginPath(); ctx.moveTo(wx, -14); ctx.lineTo(wx, 8); ctx.stroke();
  }

  // Mask
  const maskGrad = makeRadialGlow(ctx, -3, -26, 3, 14, '#ef4444', '#991b1b');
  ctx.beginPath(); ctx.arc(0, -25, 13.5, 0, Math.PI * 2);
  ctx.fillStyle = maskGrad; ctx.fill();

  // Large white triangular eyes
  for (const side of [-1, 1]) {
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(side * 8, -29); ctx.lineTo(side * 1, -25);
    ctx.lineTo(side * 7, -20); ctx.closePath(); ctx.fill();
    ctx.save();
    ctx.shadowColor = '#e0f7ff'; ctx.shadowBlur = 8;
    ctx.fillStyle = '#e0f7ff';
    ctx.beginPath();
    ctx.moveTo(side * 7, -28); ctx.lineTo(side * 2, -25);
    ctx.lineTo(side * 6, -21); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
}

// =============================================================================
// 7. DOCTOR STRANGE — Cloak of Levitation, Eldritch Mandalas, Eye of Agamotto
// =============================================================================
function renderDoctorStrange(ctx, pWalk, time, isMoving) {
  const floatY = -7 + Math.sin(time * 3.5) * 3.5;
  ctx.translate(0, floatY);

  // Crimson Cloak
  const cloakGrad = makeMetalGrad(ctx, -16, -24, 16, 24, '#7f1d1d', '#b91c1c', '#dc2626');
  ctx.beginPath();
  ctx.moveTo(-17, -24); ctx.lineTo(-12, -14);
  ctx.lineTo(-17, 25); ctx.lineTo(17, 25);
  ctx.lineTo(12, -14); ctx.lineTo(17, -24);
  ctx.lineTo(0, -19); ctx.closePath();
  ctx.fillStyle = cloakGrad; ctx.fill();
  ctx.strokeStyle = '#7f1d1d'; ctx.lineWidth = 1.5; ctx.stroke();

  // Navy sorcerer robes
  ctx.fillStyle = makeMetalGrad(ctx, -10, -14, 10, 12, '#1e3a8a', '#1d4ed8', '#2563eb');
  ctx.fillRect(-10, -14, 20, 26);

  // Eye of Agamotto
  ctx.save();
  ctx.shadowColor = '#10b981'; ctx.shadowBlur = 10;
  ctx.fillStyle = '#ca8a04';
  ctx.beginPath(); ctx.ellipse(0, -5, 5.5, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#10b981';
  ctx.beginPath(); ctx.arc(0, -5, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(-0.5, -5.5, 0.8, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // Head
  ctx.fillStyle = makeMetalGrad(ctx, -12, -30, 12, -14, '#0f172a', '#1e293b', '#334155');
  ctx.beginPath(); ctx.arc(0, -25, 12.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fde68a';
  ctx.beginPath(); ctx.arc(0, -23, 7.5, 0, Math.PI * 2); ctx.fill();
  // Silver temples
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(-12, -27, 2.5, 5.5);
  ctx.fillRect(9.5, -27, 2.5, 5.5);

  // Rotating eldritch mandalas
  ctx.save();
  ctx.shadowColor = '#fb923c'; ctx.shadowBlur = 14;
  ctx.strokeStyle = '#fb923c'; ctx.lineWidth = 1.5;
  for (const [sx, dir] of [[-17, 1], [17, -1]]) {
    ctx.save();
    ctx.translate(sx, -2);
    ctx.rotate(time * 2.8 * dir);
    ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeRect(-5, -5, 10, 10);
    ctx.beginPath();
    ctx.moveTo(-9, 0); ctx.lineTo(9, 0);
    ctx.moveTo(0, -9); ctx.lineTo(0, 9);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

// =============================================================================
// 8. BLACK PANTHER — Vibranium Suit, Pointed Ears, Kinetic Energy Weave
// =============================================================================
function renderBlackPanther(ctx, pWalk, time, isMoving) {
  const kineticPulse = isMoving ? 14 : 5;
  const kineticAlpha = 0.5 + Math.sin(time * 7) * 0.45;

  // Legs
  ctx.fillStyle = makeMetalGrad(ctx, -9, 8, 9, 22, '#09090b', '#18181b', '#27272a');
  ctx.fillRect(-9 + pWalk, 8, 8, 14);
  ctx.fillRect(1 - pWalk, 8, 8, 14);

  // Purple kinetic lines on legs
  ctx.save();
  ctx.shadowColor = '#a855f7'; ctx.shadowBlur = kineticPulse;
  ctx.strokeStyle = `rgba(168,85,247,${kineticAlpha})`; ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-6 + pWalk, 10); ctx.lineTo(-6 + pWalk, 19);
  ctx.moveTo(5 - pWalk, 10); ctx.lineTo(5 - pWalk, 19);
  ctx.stroke();
  ctx.restore();

  // Matte vibranium torso
  const torsoGrad = makeMetalGrad(ctx, -13, -14, 13, 8, '#09090b', '#18181b', '#3f3f46');
  ctx.beginPath();
  ctx.moveTo(-13, -14); ctx.lineTo(13, -14);
  ctx.lineTo(10, 8); ctx.lineTo(-10, 8);
  ctx.closePath();
  ctx.fillStyle = torsoGrad; ctx.fill();

  // Silver claw necklace
  ctx.fillStyle = '#e2e8f0';
  for (let i = -3; i <= 3; i++) {
    const angle = (i / 3) * (Math.PI / 3);
    const x = Math.sin(angle) * 9;
    const y = -10 + Math.cos(angle) * 5;
    ctx.beginPath();
    ctx.moveTo(x - 1.8, y); ctx.lineTo(x + 1.8, y); ctx.lineTo(x, y + 4); ctx.closePath(); ctx.fill();
  }

  // Purple kinetic chest weave
  ctx.save();
  ctx.shadowColor = '#a855f7'; ctx.shadowBlur = kineticPulse;
  ctx.strokeStyle = `rgba(192,132,252,${kineticAlpha})`; ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-11, -8); ctx.lineTo(0, -2); ctx.lineTo(11, -8);
  ctx.moveTo(-9, 2); ctx.lineTo(0, 6); ctx.lineTo(9, 2);
  ctx.stroke();
  ctx.restore();

  // Panther cowl
  const cowlGrad = makeRadialGlow(ctx, -3, -26, 3, 14, '#27272a', '#09090b');
  ctx.beginPath(); ctx.arc(0, -25, 13.5, 0, Math.PI * 2);
  ctx.fillStyle = cowlGrad; ctx.fill();

  // Pointed ears
  ctx.fillStyle = '#09090b';
  ctx.beginPath(); ctx.moveTo(-11, -29); ctx.lineTo(-15, -40); ctx.lineTo(-6, -33); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(11, -29); ctx.lineTo(15, -40); ctx.lineTo(6, -33); ctx.closePath(); ctx.fill();

  // Silver visor eyes
  ctx.save();
  ctx.shadowColor = '#c084fc'; ctx.shadowBlur = 8;
  ctx.fillStyle = '#c084fc';
  ctx.fillRect(-7, -25, 3.5, 2.5);
  ctx.fillRect(3.5, -25, 3.5, 2.5);
  ctx.restore();
}

// =============================================================================
// 9. HAWKEYE — Tactical Archer, Compound Bow, Quiver of Arrows
// =============================================================================
function renderHawkeye(ctx, pWalk, time, isMoving) {
  // Quiver on back
  ctx.fillStyle = makeMetalGrad(ctx, 8, -26, 14, -6, '#1e293b', '#334155', '#475569');
  ctx.fillRect(8, -26, 6.5, 22);
  ctx.fillStyle = '#ca8a04';
  ctx.fillRect(9, -33, 2.5, 8);
  ctx.fillRect(12.5, -31, 2.5, 7);
  ctx.fillStyle = '#7c3aed';
  ctx.fillRect(10.8, -28, 2, 5);

  // Legs
  ctx.fillStyle = makeMetalGrad(ctx, -9, 8, 9, 22, '#0f172a', '#1e293b', '#334155');
  ctx.fillRect(-9 + pWalk, 8, 8, 14);
  ctx.fillRect(1 - pWalk, 8, 8, 14);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(-10 + pWalk, 18, 9, 6);
  ctx.fillRect(1 - pWalk, 18, 9, 6);

  // Asymmetric vest
  ctx.fillStyle = makeMetalGrad(ctx, -13, -14, 13, 8, '#0f172a', '#1e293b', '#334155');
  ctx.fillRect(-13, -14, 26, 22);
  const vestPurpleGrad = makeMetalGrad(ctx, -13, -14, 5, 8, '#4c1d95', '#6d28d9', '#7e22ce');
  ctx.beginPath();
  ctx.moveTo(-13, -14); ctx.lineTo(5, -14);
  ctx.lineTo(1, 8); ctx.lineTo(-12, 8); ctx.closePath();
  ctx.fillStyle = vestPurpleGrad; ctx.fill();

  // Head
  const headGrad = makeMetalGrad(ctx, -12, -30, 12, -14, '#1e293b', '#334155', '#475569');
  ctx.beginPath(); ctx.arc(0, -25, 12.5, 0, Math.PI * 2);
  ctx.fillStyle = headGrad; ctx.fill();
  ctx.fillStyle = '#fde68a';
  ctx.beginPath(); ctx.arc(0, -23, 7.5, 0, Math.PI * 2); ctx.fill();
  // Earpiece
  ctx.save();
  ctx.shadowColor = '#f59e0b'; ctx.shadowBlur = 6;
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(-12, -25, 3.5, 4.5);
  ctx.restore();

  // Compound bow
  ctx.save();
  const bowSway = isMoving ? Math.sin(time * 8) * 0.22 : 0;
  ctx.translate(-15, 0);
  ctx.rotate(bowSway);
  ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(0, 0, 15, -Math.PI / 2, Math.PI / 2); ctx.stroke();
  // Cams
  ctx.fillStyle = '#475569';
  ctx.beginPath(); ctx.arc(0, -14, 3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(0, 14, 3, 0, Math.PI * 2); ctx.fill();
  // Bowstring
  ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(-4, 0); ctx.lineTo(0, 14); ctx.stroke();
  ctx.restore();
}

// =============================================================================
// FALLEN HERO RELIC MONUMENT (Floor memorial for eliminated players)
// =============================================================================
export function drawFallenRelic(ctx, heroId, x, y, time) {
  const hero = getHero(heroId);
  ctx.save();
  ctx.translate(x, y);

  // Glowing aura on floor
  const auraGrad = makeRadialGlow(ctx, 0, 0, 0, 26, hero.glowColor || 'rgba(255,255,255,0.25)', 'rgba(0,0,0,0)');
  ctx.beginPath(); ctx.ellipse(0, 0, 26, 11, 0, 0, Math.PI * 2);
  ctx.fillStyle = auraGrad; ctx.fill();

  // Pulsing ring
  const ringPulse = 18 + Math.sin(time * 3) * 4;
  ctx.strokeStyle = hero.primaryColor;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.5 + Math.sin(time * 3) * 0.3;
  ctx.beginPath(); ctx.ellipse(0, 0, ringPulse, ringPulse * 0.4, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.globalAlpha = 1;

  switch (hero.id) {
    case 'captainamerica': {
      ctx.save(); ctx.rotate(-0.25);
      for (const [r, col, cr] of [[16, '#dc2626', '#991b1b'], [12, '#f1f5f9', null], [8.5, '#dc2626', null], [5.5, '#1d4ed8', '#1e3a8a']]) {
        const cg = cr ? makeRadialGlow(ctx, 0, -6, 0, r, col, cr) : null;
        ctx.beginPath(); ctx.arc(0, -6, r, 0, Math.PI * 2);
        ctx.fillStyle = cg || col; ctx.fill();
      }
      ctx.save(); ctx.shadowColor = '#ffffff'; ctx.shadowBlur = 6;
      drawStar(ctx, 0, -6, 5, 4.5, 2, '#ffffff'); ctx.restore();
      ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, -6, 14.5, -Math.PI / 3, 0); ctx.stroke();
      ctx.restore(); break;
    }
    case 'thor': {
      ctx.fillStyle = '#78350f'; ctx.fillRect(-13, -2, 17, 4.5);
      const mhg = makeMetalGrad(ctx, 2, -8, 16, 8, '#64748b', '#cbd5e1', '#e2e8f0');
      ctx.fillStyle = mhg; ctx.fillRect(2, -8, 15, 16);
      ctx.strokeStyle = '#475569'; ctx.lineWidth = 1.5; ctx.strokeRect(2, -8, 15, 16);
      ctx.save(); ctx.shadowColor = '#67e8f9'; ctx.shadowBlur = 12;
      ctx.strokeStyle = '#67e8f9'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(8, -8); ctx.lineTo(5, -15); ctx.lineTo(10, -20); ctx.stroke();
      ctx.restore(); break;
    }
    case 'ironman': {
      const hg = makeRadialGlow(ctx, -6, -4, 2, 10, '#ef4444', '#7f1d1d');
      ctx.beginPath(); ctx.arc(-6, -4, 10, 0, Math.PI * 2);
      ctx.fillStyle = hg; ctx.fill();
      const fg = makeMetalGrad(ctx, -10, -7, -3, -1, '#78350f', '#ca8a04', '#fde68a');
      ctx.fillStyle = fg; ctx.fillRect(-10, -7, 7, 7);
      ctx.save(); ctx.shadowColor = '#38bdf8'; ctx.shadowBlur = 14;
      const ag = makeRadialGlow(ctx, 8, -2, 0, 6, '#ffffff', 'rgba(56,189,248,0)');
      ctx.beginPath(); ctx.arc(8, -2, 6, 0, Math.PI * 2);
      ctx.fillStyle = ag; ctx.fill();
      ctx.strokeStyle = '#0284c7'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore(); break;
    }
    case 'hulk': {
      ctx.save(); ctx.shadowColor = '#22c55e'; ctx.shadowBlur = 10;
      ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
      ctx.fillStyle = makeMetalGrad(ctx, -7, -4, 7, 4, '#4c1d95', '#7c3aed', '#8b5cf6');
      ctx.fillRect(-7, -5, 14, 9); break;
    }
    case 'spiderman': {
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1;
      for (const [a, b] of [[-16, -10, 16, 10], [-16, 10, 16, -10]]) {
        ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(16, 10); ctx.stroke();
      }
      const mg = makeRadialGlow(ctx, 0, -2, 2, 9, '#ef4444', '#991b1b');
      ctx.beginPath(); ctx.arc(0, -2, 9, 0, Math.PI * 2); ctx.fillStyle = mg; ctx.fill();
      ctx.save(); ctx.shadowColor = '#e0f7ff'; ctx.shadowBlur = 6;
      ctx.fillStyle = '#e0f7ff'; ctx.fillRect(-5, -4, 3.5, 2.5); ctx.fillRect(1.5, -4, 3.5, 2.5);
      ctx.restore(); break;
    }
    case 'doctorstrange': {
      ctx.save(); ctx.shadowColor = '#fb923c'; ctx.shadowBlur = 12;
      ctx.strokeStyle = '#fb923c'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
      ctx.fillStyle = '#ca8a04'; ctx.beginPath(); ctx.arc(0, 0, 5.5, 0, Math.PI * 2); ctx.fill();
      ctx.save(); ctx.shadowColor = '#10b981'; ctx.shadowBlur = 8;
      ctx.fillStyle = '#10b981'; ctx.beginPath(); ctx.arc(0, 0, 2.8, 0, Math.PI * 2); ctx.fill(); ctx.restore(); break;
    }
    case 'blackwidow': {
      const gg = makeMetalGrad(ctx, -9, -4, -3, 7, '#0f172a', '#1e293b', '#334155');
      ctx.fillStyle = gg; ctx.fillRect(-9, -4, 7, 9);
      ctx.fillRect(2, -4, 7, 9);
      ctx.save(); ctx.shadowColor = '#38bdf8'; ctx.shadowBlur = 10;
      ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-2, 0); ctx.lineTo(2, 0); ctx.stroke(); ctx.restore(); break;
    }
    case 'blackpanther': {
      ctx.save(); ctx.shadowColor = '#a855f7'; ctx.shadowBlur = 12;
      ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      ctx.fillStyle = '#e2e8f0';
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        ctx.fillRect(Math.cos(a) * 8 - 1.2, Math.sin(a) * 8 - 1.2, 2.5, 2.5);
      } break;
    }
    case 'hawkeye': {
      ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(0, 0, 13, -Math.PI / 2, Math.PI / 2); ctx.stroke();
      ctx.save(); ctx.shadowColor = '#f59e0b'; ctx.shadowBlur = 6;
      ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.moveTo(-11, -11); ctx.lineTo(5, 5); ctx.stroke(); ctx.restore(); break;
    }
    default: {
      ctx.fillStyle = '#64748b'; ctx.fillRect(-6, -6, 12, 12);
    }
  }

  // Name label
  ctx.font = "bold 8px 'Orbitron', 'JetBrains Mono', monospace";
  ctx.fillStyle = hero.primaryColor;
  ctx.textAlign = 'center';
  ctx.shadowColor = hero.primaryColor; ctx.shadowBlur = 5;
  ctx.fillText(hero.name.toUpperCase(), 0, 20);
  ctx.shadowBlur = 0;

  ctx.restore();
}

// =============================================================================
// THANOS SNAP DISINTEGRATION EFFECT (Cinematic Elimination)
// =============================================================================
export function drawThanosSnap(ctx, heroId, progress, time, width = 600, height = 360) {
  const hero = getHero(heroId);
  ctx.save();
  ctx.clearRect(0, 0, width, height);

  // Cinematic dark background with subtle gradient
  const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width * 0.7);
  bgGrad.addColorStop(0, 'rgba(15,20,40,1)');
  bgGrad.addColorStop(1, 'rgba(3,7,18,1)');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Dramatic vignette
  const vigGrad = ctx.createRadialGradient(width / 2, height / 2, height * 0.2, width / 2, height / 2, height * 0.8);
  vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
  vigGrad.addColorStop(1, 'rgba(0,0,0,0.7)');
  ctx.fillStyle = vigGrad;
  ctx.fillRect(0, 0, width, height);

  const centerX = width / 2;
  const centerY = height / 2 + 15;

  // Hero at large scale, clipped from bottom-up as progress increases
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.scale(2.8, 2.8);
  const clipH = 90 * (1 - progress);
  ctx.beginPath();
  ctx.rect(-55, -75, 110, clipH);
  ctx.clip();
  drawAvenger(ctx, hero.id, 0, time, false, false, false, false);
  ctx.restore();

  // Dramatic glow behind hero
  if (progress < 0.7) {
    const glowAlpha = (1 - progress / 0.7) * 0.4;
    const heroGlow = ctx.createRadialGradient(centerX, centerY - 30, 0, centerX, centerY - 30, 120);
    heroGlow.addColorStop(0, hero.glowColor || 'rgba(255,255,255,0.4)');
    heroGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = glowAlpha;
    ctx.fillStyle = heroGlow;
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 1;
  }

  // Infinity stone golden dust particles
  const particleCount = Math.floor(progress * 240);
  for (let i = 0; i < particleCount; i++) {
    const seed   = (i * 9301 + 49297) % 233280;
    const rndX   = (seed / 233280) * 130 - 65;
    const rndY   = ((seed * 7) % 233280) / 233280;
    const driftY = -progress * 160 - rndY * 70;
    const driftX = rndX + Math.sin(time * 3 + i) * 25 * progress;
    const pX     = centerX + driftX;
    const pY     = centerY + 35 + driftY;
    const pAlpha = Math.max(0, 1 - (progress * 1.1 + rndY * 0.3));
    const pSize  = (i % 3 === 0 ? 3.5 : i % 2 === 0 ? 2.5 : 1.8) * (1 - progress * 0.5);

    let pColor;
    if (i % 5 === 0) pColor = '#fbbf24';         // gold
    else if (i % 4 === 0) pColor = hero.primaryColor;
    else if (i % 3 === 0) pColor = '#ffffff';
    else pColor = hero.secondaryColor || hero.primaryColor;

    ctx.globalAlpha = pAlpha;
    ctx.fillStyle = pColor;
    ctx.shadowColor = pColor; ctx.shadowBlur = 6;
    ctx.beginPath(); ctx.arc(pX, pY, pSize, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;

  ctx.restore();
}
