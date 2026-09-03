// =============================================================================
// AVENGERS ASSEMBLE: HEROES DATA, PROCEDURAL VECTOR GRAPHICS & ANIMATION ENGINE
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
    glowColor: 'rgba(239, 68, 68, 0.45)',
    relicName: 'Arc Reactor & Mark 85 Helmet',
    quote: 'I am Iron Man.',
    iconEmoji: '🦾'
  },
  {
    id: 'captainamerica',
    name: 'Captain America',
    alias: 'Steve Rogers',
    roleTitle: 'First Avenger',
    primaryColor: '#2563eb',
    secondaryColor: '#ef4444',
    visorColor: '#ffffff',
    glowColor: 'rgba(37, 99, 235, 0.45)',
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
    glowColor: 'rgba(103, 232, 249, 0.45)',
    relicName: 'Mjolnir Lightning Hammer',
    quote: 'Bring me Thanos!',
    iconEmoji: '⚡'
  },
  {
    id: 'hulk',
    name: 'Hulk',
    alias: 'Bruce Banner',
    roleTitle: 'Gamma Juggernaut',
    primaryColor: '#16a34a',
    secondaryColor: '#7c3aed',
    visorColor: '#86efac',
    glowColor: 'rgba(22, 163, 74, 0.45)',
    relicName: 'Gamma Radiation Crater',
    quote: 'Hulk Smash!',
    iconEmoji: '💥'
  },
  {
    id: 'blackwidow',
    name: 'Black Widow',
    alias: 'Natasha Romanoff',
    roleTitle: 'Master Assassin',
    primaryColor: '#1e293b',
    secondaryColor: '#ea580c',
    visorColor: '#38bdf8',
    glowColor: 'rgba(234, 88, 12, 0.45)',
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
    glowColor: 'rgba(225, 29, 72, 0.45)',
    relicName: 'Webbed Spider Mask',
    quote: 'With great power comes great responsibility.',
    iconEmoji: '🕸️'
  },
  {
    id: 'doctorstrange',
    name: 'Doctor Strange',
    alias: 'Stephen Strange',
    roleTitle: 'Sorcerer Supreme',
    primaryColor: '#4338ca',
    secondaryColor: '#991b1b',
    visorColor: '#f97316',
    glowColor: 'rgba(249, 115, 22, 0.45)',
    relicName: 'Eye of Agamotto Amulet',
    quote: "We're in the endgame now.",
    iconEmoji: '🔮'
  },
  {
    id: 'blackpanther',
    name: 'Black Panther',
    alias: "King T'Challa",
    roleTitle: 'King of Wakanda',
    primaryColor: '#18181b',
    secondaryColor: '#c084fc',
    visorColor: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.45)',
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
    glowColor: 'rgba(126, 34, 206, 0.45)',
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
  let x = cx;
  let y = cy;
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

// =============================================================================
// MAIN PROCEDURAL 2D VECTOR DRAWING ENGINE FOR AVENGERS
// =============================================================================
export function drawAvenger(ctx, heroId, pWalk, time, isPlMoving, isFacingLeft, isGhost, isLocal) {
  const hero = getHero(heroId);

  ctx.save();

  // Ethereal Ghost Mode for Eliminated Spectators
  if (isGhost) {
    ctx.globalAlpha = 0.42;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    // Gentle floating bob
    ctx.translate(0, -8 + Math.sin(time * 3) * 4);
  }

  // Draw Ground Shadow (Unless Ghost)
  if (!isGhost) {
    ctx.save();
    ctx.beginPath();
    const shadowRad = hero.id === 'hulk' ? 24 : 17;
    ctx.ellipse(0, 22, shadowRad, 7, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fill();
    ctx.restore();
  }

  if (isFacingLeft) {
    ctx.scale(-1, 1);
  }

  // Render Character Based on Avenger Identity
  switch (hero.id) {
    case 'ironman':
      renderIronMan(ctx, pWalk, time, isPlMoving, isGhost);
      break;
    case 'captainamerica':
      renderCaptainAmerica(ctx, pWalk, time, isPlMoving, isGhost);
      break;
    case 'thor':
      renderThor(ctx, pWalk, time, isPlMoving, isGhost);
      break;
    case 'hulk':
      renderHulk(ctx, pWalk, time, isPlMoving, isGhost);
      break;
    case 'blackwidow':
      renderBlackWidow(ctx, pWalk, time, isPlMoving, isGhost);
      break;
    case 'spiderman':
      renderSpiderMan(ctx, pWalk, time, isPlMoving, isGhost);
      break;
    case 'doctorstrange':
      renderDoctorStrange(ctx, pWalk, time, isPlMoving, isGhost);
      break;
    case 'blackpanther':
      renderBlackPanther(ctx, pWalk, time, isPlMoving, isGhost);
      break;
    case 'hawkeye':
      renderHawkeye(ctx, pWalk, time, isPlMoving, isGhost);
      break;
    default:
      renderIronMan(ctx, pWalk, time, isPlMoving, isGhost);
  }

  // Ghost Halo Indicator
  if (isGhost) {
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, -38, 12, 4, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

// 1. IRON MAN (Mark 85 Armor with Boot Jet Particles & Unibeam Arc Reactor)
function renderIronMan(ctx, pWalk, time, isMoving, isGhost) {
  const hoverY = isMoving ? 0 : Math.sin(time * 3) * 2;
  ctx.translate(0, hoverY);

  // Repulsor Boot Jet Exhaust Flames
  if (isMoving && !isGhost) {
    ctx.save();
    const flameL = 10 + Math.random() * 8;
    const flameGrad = ctx.createLinearGradient(0, 20, 0, 20 + flameL);
    flameGrad.addColorStop(0, '#ffffff');
    flameGrad.addColorStop(0.3, '#38bdf8');
    flameGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');

    ctx.fillStyle = flameGrad;
    // Left boot thrust
    ctx.beginPath();
    ctx.moveTo(-9 + pWalk, 22);
    ctx.lineTo(-5 + pWalk, 22 + flameL);
    ctx.lineTo(-1 + pWalk, 22);
    ctx.fill();
    // Right boot thrust
    ctx.beginPath();
    ctx.moveTo(1 - pWalk, 22);
    ctx.lineTo(5 - pWalk, 22 + flameL);
    ctx.lineTo(9 - pWalk, 22);
    ctx.fill();
    ctx.restore();
  }

  // Armored Legs
  ctx.fillStyle = '#991b1b'; // Deep Crimson
  ctx.fillRect(-8 + pWalk, 8, 13, 13);
  ctx.fillRect(2 - pWalk, 8, 7, 13);

  // Gold Knee Accents & Boots
  ctx.fillStyle = '#eab308'; // Gold
  ctx.fillRect(-8 + pWalk, 12, 7, 3);
  ctx.fillRect(2 - pWalk, 12, 7, 3);
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(-9 + pWalk, 18, 8, 5);
  ctx.fillRect(1 - pWalk, 18, 8, 5);

  // Torso / Ballistic Chestplate
  ctx.fillStyle = '#b91c1c';
  ctx.beginPath();
  ctx.moveTo(-14, -14);
  ctx.lineTo(14, -14);
  ctx.lineTo(11, 9);
  ctx.lineTo(-11, 9);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Gold Rib Inlays
  ctx.fillStyle = '#eab308';
  ctx.fillRect(-13, -8, 3, 14);
  ctx.fillRect(10, -8, 3, 14);

  // Arc Reactor Unibeam
  const arcPulse = Math.sin(time * 6) * 1.5;
  ctx.save();
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(0, -2, 4.5 + arcPulse, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  // Shoulder Pauldrons & Arms
  ctx.fillStyle = '#eab308';
  ctx.fillRect(-17, -13, 5, 9);
  ctx.fillRect(12, -13, 5, 9);
  ctx.fillStyle = '#b91c1c';
  ctx.fillRect(-16, -4, 4, 12);
  ctx.fillRect(12, -4, 4, 12);
  // Repulsor Palms
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(-16, 7, 4, 2);
  ctx.fillRect(12, 7, 4, 2);

  // Helmet & Gold Faceplate
  ctx.fillStyle = '#b91c1c';
  ctx.beginPath();
  ctx.arc(0, -24, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#7f1d1d';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Gold Faceplate
  ctx.fillStyle = '#eab308';
  ctx.beginPath();
  ctx.moveTo(-6, -30);
  ctx.lineTo(6, -30);
  ctx.lineTo(8, -20);
  ctx.lineTo(5, -13);
  ctx.lineTo(-5, -13);
  ctx.lineTo(-8, -20);
  ctx.closePath();
  ctx.fill();

  // Glowing Cyan Visor Slits
  ctx.save();
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 8;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-6, -24, 4, 2);
  ctx.fillRect(2, -24, 4, 2);
  ctx.restore();
}

// 2. CAPTAIN AMERICA (Vibranium Shield with Star, Cowl 'A', Red/White Stripes)
function renderCaptainAmerica(ctx, pWalk, time, isMoving) {
  // Legs & Combat Boots
  ctx.fillStyle = '#1e3a8a'; // Navy Blue
  ctx.fillRect(-8 + pWalk, 8, 7, 13);
  ctx.fillRect(2 - pWalk, 8, 7, 13);
  ctx.fillStyle = '#78350f'; // Brown Leather Boots
  ctx.fillRect(-9 + pWalk, 17, 8, 6);
  ctx.fillRect(1 - pWalk, 17, 8, 6);

  // Torso (Navy Blue Chest, Red/White Stripes Midriff)
  ctx.fillStyle = '#1d4ed8';
  ctx.beginPath();
  ctx.moveTo(-14, -14);
  ctx.lineTo(14, -14);
  ctx.lineTo(11, -1);
  ctx.lineTo(-11, -1);
  ctx.closePath();
  ctx.fill();

  // White Chest Star
  drawStar(ctx, 0, -8, 5, 5, 2.2, '#ffffff');

  // Red & White Vertical Midriff Stripes
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#dc2626' : '#ffffff';
    ctx.fillRect(-10 + i * 5, -1, 5, 10);
  }

  // Brown Utility Belt with Brass Buckle
  ctx.fillStyle = '#78350f';
  ctx.fillRect(-12, 6, 24, 4);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(-3, 6, 6, 4);

  // Head & Helmet
  ctx.fillStyle = '#1d4ed8';
  ctx.beginPath();
  ctx.arc(0, -24, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#1e3a8a';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Face Skin
  ctx.fillStyle = '#fed7aa';
  ctx.beginPath();
  ctx.arc(0, -21, 6.5, 0, Math.PI);
  ctx.fill();

  // Helmet Letter 'A'
  ctx.font = "bold 9px 'Inter', sans-serif";
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText('A', 0, -26);

  // Temple Wings
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fillRect(-12, -26, 3, 2);
  ctx.fillRect(9, -26, 3, 2);

  // Vibranium Shield on Arm
  ctx.save();
  const shieldTilt = isMoving ? pWalk * 0.15 : 0;
  ctx.translate(-14, 0);
  ctx.rotate(shieldTilt);

  // Outer Red Ring
  ctx.beginPath();
  ctx.arc(0, 0, 15, 0, Math.PI * 2);
  ctx.fillStyle = '#dc2626';
  ctx.fill();
  ctx.strokeStyle = '#991b1b';
  ctx.lineWidth = 1;
  ctx.stroke();

  // White Ring
  ctx.beginPath();
  ctx.arc(0, 0, 11, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Inner Red Ring
  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, Math.PI * 2);
  ctx.fillStyle = '#dc2626';
  ctx.fill();

  // Blue Center
  ctx.beginPath();
  ctx.arc(0, 0, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#1d4ed8';
  ctx.fill();

  // Center Star
  drawStar(ctx, 0, 0, 5, 4.5, 2, '#ffffff');

  // Specular gleam
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 13, -Math.PI / 3, 0);
  ctx.stroke();
  ctx.restore();
}

// 3. THOR (Crimson Norse Cape, Silver Discs, Wielding Mjolnir with Lightning)
function renderThor(ctx, pWalk, time, isMoving) {
  // Flowing Crimson Cape (Behind Body)
  const capeWiggle = isMoving ? Math.sin(time * 8) * 6 : Math.sin(time * 3) * 2;
  ctx.fillStyle = '#b91c1c';
  ctx.beginPath();
  ctx.moveTo(-14, -14);
  ctx.lineTo(14, -14);
  ctx.quadraticCurveTo(18 + capeWiggle, 12, 14 + capeWiggle, 24);
  ctx.lineTo(-14 + capeWiggle, 24);
  ctx.quadraticCurveTo(-18 + capeWiggle, 12, -14, -14);
  ctx.closePath();
  ctx.fill();

  // Legs & Chainmail Armor
  ctx.fillStyle = '#334155';
  ctx.fillRect(-8 + pWalk, 8, 7, 13);
  ctx.fillRect(2 - pWalk, 8, 7, 13);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-9 + pWalk, 17, 8, 6);
  ctx.fillRect(1 - pWalk, 17, 8, 6);

  // Dark Armor Vest
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-13, -14, 26, 22);
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-13, -14, 26, 22);

  // 4 Silver Armor Discs
  ctx.fillStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.arc(-6, -8, 3.5, 0, Math.PI * 2);
  ctx.arc(6, -8, 3.5, 0, Math.PI * 2);
  ctx.arc(-6, 2, 3.5, 0, Math.PI * 2);
  ctx.arc(6, 2, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Head & Golden Hair
  ctx.fillStyle = '#facc15'; // Golden Hair Locks
  ctx.beginPath();
  ctx.arc(0, -24, 15, 0, Math.PI * 2);
  ctx.fill();

  // Face
  ctx.fillStyle = '#fed7aa';
  ctx.beginPath();
  ctx.arc(0, -24, 10, 0, Math.PI * 2);
  ctx.fill();

  // Silver Winged Helmet
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(-9, -33, 18, 5);
  // Wings
  ctx.fillStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.moveTo(-9, -31);
  ctx.lineTo(-15, -40);
  ctx.lineTo(-9, -35);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(9, -31);
  ctx.lineTo(15, -40);
  ctx.lineTo(9, -35);
  ctx.fill();

  // Wielding Mjolnir Hammer
  ctx.save();
  const hammerSwing = isMoving ? Math.sin(time * 8) * 0.3 : 0;
  ctx.translate(16, 2);
  ctx.rotate(hammerSwing);

  // Handle
  ctx.fillStyle = '#78350f';
  ctx.fillRect(-2, -4, 4, 16);
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(-2, 10, 4, 2); // Bottom cap

  // Silver Hammer Head
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(-8, -14, 16, 10);
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-8, -14, 16, 10);

  // Electric Blue Lightning Sparks from Mjolnir
  ctx.save();
  ctx.shadowColor = '#67e8f9';
  ctx.shadowBlur = 8;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-6, -14);
  ctx.lineTo(-10 + Math.random() * 4, -20);
  ctx.lineTo(-6, -24);
  ctx.stroke();

  ctx.strokeStyle = '#67e8f9';
  ctx.beginPath();
  ctx.moveTo(6, -14);
  ctx.lineTo(12 + Math.random() * 4, -18);
  ctx.lineTo(8, -22);
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

// 4. HULK (Gamma Green, Bulging Muscles, Ripped Purple Shorts, Stomping Gait)
function renderHulk(ctx, pWalk, time, isMoving) {
  // Scale up Hulk for massive frame
  ctx.scale(1.22, 1.22);
  const stompSway = isMoving ? Math.sin(time * 6) * 3 : 0;
  ctx.translate(stompSway, 0);

  // Massive Green Legs
  ctx.fillStyle = '#16a34a';
  ctx.fillRect(-9 + pWalk, 8, 8, 12);
  ctx.fillRect(1 - pWalk, 8, 8, 12);

  // Bare Green Feet
  ctx.fillRect(-11 + pWalk, 17, 10, 5);
  ctx.fillRect(1 - pWalk, 17, 10, 5);

  // Shredded Purple Shorts with Torn Hem
  ctx.fillStyle = '#7c3aed';
  ctx.beginPath();
  ctx.moveTo(-16, 0);
  ctx.lineTo(16, 0);
  ctx.lineTo(14, 12);
  ctx.lineTo(10, 10);
  ctx.lineTo(6, 13);
  ctx.lineTo(0, 9);
  ctx.lineTo(-6, 13);
  ctx.lineTo(-10, 10);
  ctx.lineTo(-14, 12);
  ctx.closePath();
  ctx.fill();

  // Muscular Green Torso & Abs
  ctx.fillStyle = '#15803d';
  ctx.fillRect(-17, -16, 34, 18);
  ctx.fillStyle = '#22c55e';
  // Pectoral definition
  ctx.fillRect(-14, -14, 12, 7);
  ctx.fillRect(2, -14, 12, 7);
  // Abs
  ctx.fillRect(-8, -5, 6, 4);
  ctx.fillRect(2, -5, 6, 4);

  // Massive Clenched Green Fists & Biceps
  ctx.fillStyle = '#16a34a';
  ctx.beginPath();
  ctx.arc(-18, -6, 7, 0, Math.PI * 2);
  ctx.arc(18, -6, 7, 0, Math.PI * 2);
  ctx.fill();

  // Hulk Head & Shaggy Hair
  ctx.fillStyle = '#15803d';
  ctx.beginPath();
  ctx.arc(0, -25, 13, 0, Math.PI * 2);
  ctx.fill();

  // Shaggy Black Hair
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(0, -29, 14, Math.PI, Math.PI * 2);
  ctx.lineTo(14, -26);
  ctx.lineTo(8, -24);
  ctx.lineTo(0, -27);
  ctx.lineTo(-8, -24);
  ctx.lineTo(-14, -26);
  ctx.closePath();
  ctx.fill();

  // Fierce Glowing Green Eyes
  ctx.fillStyle = '#86efac';
  ctx.fillRect(-6, -26, 3, 2);
  ctx.fillRect(3, -26, 3, 2);
}

// 5. BLACK WIDOW (Stealth Catsuit, Red Hair Braid, Widow's Bite Taser Gauntlets)
function renderBlackWidow(ctx, pWalk, time, isMoving) {
  // Vibrant Red Ponytail Braid Swishing Behind
  const braidWave = isMoving ? Math.sin(time * 9) * 6 : Math.sin(time * 2) * 2;
  ctx.fillStyle = '#ea580c';
  ctx.beginPath();
  ctx.moveTo(4, -28);
  ctx.quadraticCurveTo(16 + braidWave, -20, 12 + braidWave, -4);
  ctx.lineTo(8 + braidWave, -4);
  ctx.quadraticCurveTo(10 + braidWave, -20, 2, -26);
  ctx.closePath();
  ctx.fill();

  // Legs & Black Tactical Boots
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-7 + pWalk, 8, 6, 13);
  ctx.fillRect(1 - pWalk, 8, 6, 13);
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-8 + pWalk, 17, 7, 5);
  ctx.fillRect(1 - pWalk, 17, 7, 5);

  // Sleek Black Catsuit Torso
  ctx.fillStyle = '#090d16';
  ctx.beginPath();
  ctx.moveTo(-11, -14);
  ctx.lineTo(11, -14);
  ctx.lineTo(8, 8);
  ctx.lineTo(-8, 8);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Red Hourglass Belt Emblem
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.moveTo(-3, 4);
  ctx.lineTo(3, 4);
  ctx.lineTo(-3, 8);
  ctx.lineTo(3, 8);
  ctx.closePath();
  ctx.fill();

  // Dual Widow's Bite Electro Gauntlets
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-14, -2, 4, 10);
  ctx.fillRect(10, -2, 4, 10);

  // Cyan Taser Glow & Spark Arcs
  ctx.save();
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 8;
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(-14, 5, 4, 3);
  ctx.fillRect(10, 5, 4, 3);

  if (isMoving) {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-14, 6);
    ctx.lineTo(-18, 4 + Math.random() * 4);
    ctx.moveTo(14, 6);
    ctx.lineTo(18, 4 + Math.random() * 4);
    ctx.stroke();
  }
  ctx.restore();

  // Head & Red Hair
  ctx.fillStyle = '#ea580c';
  ctx.beginPath();
  ctx.arc(0, -24, 12, 0, Math.PI * 2);
  ctx.fill();

  // Face Skin
  ctx.fillStyle = '#fed7aa';
  ctx.beginPath();
  ctx.arc(0, -22, 7.5, 0, Math.PI * 2);
  ctx.fill();
}

// 6. SPIDER-MAN (Web Suit, Black Chest Spider, Large White Triangular Eyes)
function renderSpiderMan(ctx, pWalk, time, isMoving) {
  // Springy Crouch Bounce
  const bounceY = isMoving ? Math.abs(Math.sin(time * 12)) * 2 : 0;
  ctx.translate(0, bounceY);

  // Blue Legs & High Red Boots with Webbing
  ctx.fillStyle = '#1d4ed8'; // Royal Blue
  ctx.fillRect(-8 + pWalk, 8, 7, 7);
  ctx.fillRect(2 - pWalk, 8, 7, 7);
  ctx.fillStyle = '#dc2626'; // Red Boots
  ctx.fillRect(-8 + pWalk, 14, 7, 8);
  ctx.fillRect(2 - pWalk, 14, 7, 8);

  // Torso (Red Core & Blue Flanks)
  ctx.fillStyle = '#1d4ed8';
  ctx.fillRect(-12, -14, 24, 22);

  // Red Chest & Abdomen Inlay
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.moveTo(-6, -14);
  ctx.lineTo(6, -14);
  ctx.lineTo(5, 8);
  ctx.lineTo(-5, 8);
  ctx.closePath();
  ctx.fill();

  // Black Spider Insignia
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(0, -4, 3, 0, Math.PI * 2);
  ctx.fill();
  // Spider Legs
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-2, -5);
  ctx.lineTo(-7, -9);
  ctx.moveTo(2, -5);
  ctx.lineTo(7, -9);
  ctx.moveTo(-2, -3);
  ctx.lineTo(-8, -2);
  ctx.moveTo(2, -3);
  ctx.lineTo(8, -2);
  ctx.stroke();

  // Head Mask
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.arc(0, -24, 13, 0, Math.PI * 2);
  ctx.fill();

  // Iconic Large White Triangular Spider Eyes with Black Rims
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.moveTo(-8, -28);
  ctx.lineTo(-1, -25);
  ctx.lineTo(-7, -20);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(8, -28);
  ctx.lineTo(1, -25);
  ctx.lineTo(7, -20);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(-7, -27);
  ctx.lineTo(-2, -25);
  ctx.lineTo(-6, -21);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(7, -27);
  ctx.lineTo(2, -25);
  ctx.lineTo(6, -21);
  ctx.closePath();
  ctx.fill();
}

// 7. DOCTOR STRANGE (Cloak of Levitation, Eye of Agamotto, Rotating Eldritch Spell Shields)
function renderDoctorStrange(ctx, pWalk, time, isMoving) {
  // True Mystical Levitation Offset
  const floatY = -6 + Math.sin(time * 4) * 3;
  ctx.translate(0, floatY);

  // Crimson Cloak of Levitation (High Collar & Flowing Cape)
  ctx.fillStyle = '#991b1b';
  ctx.beginPath();
  ctx.moveTo(-16, -24); // High collar
  ctx.lineTo(-11, -14);
  ctx.lineTo(-16, 24);
  ctx.lineTo(16, 24);
  ctx.lineTo(11, -14);
  ctx.lineTo(16, -24); // High collar
  ctx.lineTo(0, -18);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#7f1d1d';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Dark Navy Sorcerer Robes
  ctx.fillStyle = '#1e3a8a';
  ctx.fillRect(-10, -14, 20, 26);

  // Golden Eye of Agamotto Amulet (Green Time Stone Glow)
  ctx.save();
  ctx.shadowColor = '#10b981';
  ctx.shadowBlur = 8;
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.ellipse(0, -6, 5, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#10b981';
  ctx.beginPath();
  ctx.arc(0, -6, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Head & Hair
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(0, -24, 12, 0, Math.PI * 2);
  ctx.fill();
  // Face
  ctx.fillStyle = '#fed7aa';
  ctx.beginPath();
  ctx.arc(0, -22, 7.5, 0, Math.PI * 2);
  ctx.fill();
  // Silver Temples
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(-11, -26, 2, 5);
  ctx.fillRect(9, -26, 2, 5);

  // Rotating Eldritch Magic Spell Shields Around Hands
  ctx.save();
  ctx.shadowColor = '#f97316';
  ctx.shadowBlur = 10;
  ctx.strokeStyle = '#fb923c';
  ctx.lineWidth = 1.5;

  // Left Spell Mandala
  ctx.save();
  ctx.translate(-16, -2);
  ctx.rotate(time * 2.5);
  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeRect(-4, -4, 8, 8);
  ctx.restore();

  // Right Spell Mandala
  ctx.save();
  ctx.translate(16, -2);
  ctx.rotate(-time * 2.5);
  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeRect(-4, -4, 8, 8);
  ctx.restore();
  ctx.restore();
}

// 8. BLACK PANTHER (Vibranium Suit, Pointed Ears, Claw Necklace, Kinetic Purple Pulse)
function renderBlackPanther(ctx, pWalk, time, isMoving) {
  // Kinetic Purple Energy Pulse
  const kineticPulse = isMoving ? 10 : 4;
  const kineticAlpha = 0.5 + Math.sin(time * 8) * 0.4;

  // Legs & Boots
  ctx.fillStyle = '#09090b';
  ctx.fillRect(-8 + pWalk, 8, 7, 13);
  ctx.fillRect(2 - pWalk, 8, 7, 13);

  // Purple kinetic lines on legs
  ctx.strokeStyle = `rgba(168, 85, 247, ${kineticAlpha})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-5 + pWalk, 10);
  ctx.lineTo(-5 + pWalk, 18);
  ctx.moveTo(5 - pWalk, 10);
  ctx.lineTo(5 - pWalk, 18);
  ctx.stroke();

  // Matte-Black Vibranium Torso
  ctx.fillStyle = '#18181b';
  ctx.beginPath();
  ctx.moveTo(-13, -14);
  ctx.lineTo(13, -14);
  ctx.lineTo(10, 8);
  ctx.lineTo(-10, 8);
  ctx.closePath();
  ctx.fill();

  // Silver Tooth / Claw Necklace
  ctx.fillStyle = '#e2e8f0';
  for (let i = -3; i <= 3; i++) {
    const angle = (i / 3) * (Math.PI / 3);
    const x = Math.sin(angle) * 9;
    const y = -10 + Math.cos(angle) * 5;
    ctx.beginPath();
    ctx.moveTo(x - 1.5, y);
    ctx.lineTo(x + 1.5, y);
    ctx.lineTo(x, y + 3.5);
    ctx.closePath();
    ctx.fill();
  }

  // Glowing Purple Kinetic Weave Across Chest
  ctx.save();
  ctx.shadowColor = '#a855f7';
  ctx.shadowBlur = kineticPulse;
  ctx.strokeStyle = `rgba(192, 132, 252, ${kineticAlpha})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-10, -8);
  ctx.lineTo(0, -2);
  ctx.lineTo(10, -8);
  ctx.moveTo(-8, 2);
  ctx.lineTo(0, 6);
  ctx.lineTo(8, 2);
  ctx.stroke();
  ctx.restore();

  // Panther Cowl & Pointed Feline Ears
  ctx.fillStyle = '#09090b';
  ctx.beginPath();
  ctx.arc(0, -24, 13, 0, Math.PI * 2);
  ctx.fill();

  // Pointed Ears
  ctx.beginPath();
  ctx.moveTo(-10, -28);
  ctx.lineTo(-14, -38);
  ctx.lineTo(-6, -32);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(10, -28);
  ctx.lineTo(14, -38);
  ctx.lineTo(6, -32);
  ctx.closePath();
  ctx.fill();

  // Silver Eye Lenses
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(-6, -24, 3, 2);
  ctx.fillRect(3, -24, 3, 2);
}

// 9. HAWKEYE (Tactical Archer Vest, Quiver with Arrows, Recurve Compound Bow)
function renderHawkeye(ctx, pWalk, time, isMoving) {
  // Quiver & Arrow Fletchings on Back
  ctx.fillStyle = '#334155';
  ctx.fillRect(8, -26, 6, 20); // Quiver
  ctx.fillStyle = '#f59e0b'; // Arrow Fletchings
  ctx.fillRect(9, -32, 2, 7);
  ctx.fillRect(12, -30, 2, 6);

  // Legs & Cargo Pants
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-8 + pWalk, 8, 7, 13);
  ctx.fillRect(2 - pWalk, 8, 7, 13);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(-9 + pWalk, 17, 8, 5);
  ctx.fillRect(1 - pWalk, 17, 8, 5);

  // Asymmetrical Purple & Charcoal Archer Vest
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-13, -14, 26, 22);
  ctx.fillStyle = '#7e22ce'; // Ronin Plum Purple
  ctx.beginPath();
  ctx.moveTo(-13, -14);
  ctx.lineTo(5, -14);
  ctx.lineTo(1, 8);
  ctx.lineTo(-11, 8);
  ctx.closePath();
  ctx.fill();

  // Head & Tactical Headset
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.arc(0, -24, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fed7aa';
  ctx.beginPath();
  ctx.arc(0, -22, 7.5, 0, Math.PI * 2);
  ctx.fill();
  // Comms earpiece
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(-11, -24, 3, 4);

  // Compound Recurve Bow in Hand
  ctx.save();
  const bowSway = isMoving ? Math.sin(time * 8) * 0.2 : 0;
  ctx.translate(-14, 0);
  ctx.rotate(bowSway);

  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(0, 0, 14, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();
  // Bowstring
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, -14);
  ctx.lineTo(-3, 0);
  ctx.lineTo(0, 14);
  ctx.stroke();
  ctx.restore();
}

// =============================================================================
// FALLEN HERO RELIC MONUMENT (RENDERED ON FLOOR FOR DEAD PLAYERS)
// =============================================================================
export function drawFallenRelic(ctx, heroId, x, y, time) {
  const hero = getHero(heroId);

  ctx.save();
  ctx.translate(x, y);

  // Ground scorch / relic aura
  ctx.beginPath();
  ctx.ellipse(0, 0, 22, 10, 0, 0, Math.PI * 2);
  ctx.fillStyle = hero.glowColor || 'rgba(255, 255, 255, 0.15)';
  ctx.fill();

  switch (hero.id) {
    case 'captainamerica': {
      // Vibranium Shield embedded vertically in the deck plate
      ctx.save();
      ctx.rotate(-0.25);
      ctx.beginPath();
      ctx.arc(0, -6, 15, 0, Math.PI * 2);
      ctx.fillStyle = '#dc2626';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, -6, 11, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, -6, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#dc2626';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, -6, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#1d4ed8';
      ctx.fill();
      drawStar(ctx, 0, -6, 5, 4.5, 2, '#ffffff');
      ctx.restore();
      break;
    }
    case 'thor': {
      // Mjolnir lying on floor with crackling residual sparks
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-12, -2, 16, 4);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(2, -8, 14, 16);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(2, -8, 14, 16);

      // Residual Lightning Sparks
      ctx.save();
      ctx.shadowColor = '#67e8f9';
      ctx.shadowBlur = 8;
      ctx.strokeStyle = '#67e8f9';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(8, -8);
      ctx.lineTo(6, -14);
      ctx.lineTo(10, -18);
      ctx.stroke();
      ctx.restore();
      break;
    }
    case 'ironman': {
      // Mark 85 Helmet and glowing Arc Reactor
      ctx.fillStyle = '#b91c1c';
      ctx.beginPath();
      ctx.arc(-6, -4, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#eab308';
      ctx.fillRect(-9, -6, 6, 6);

      // Arc Reactor
      ctx.save();
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(8, -2, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
      break;
    }
    case 'hulk': {
      // Cracked gamma crater with shredded purple cloth
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#7c3aed';
      ctx.fillRect(-6, -4, 12, 8);
      break;
    }
    case 'spiderman': {
      // Spidey mask in a webbed cradle
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-16, -10);
      ctx.lineTo(16, 10);
      ctx.moveTo(-16, 10);
      ctx.lineTo(16, -10);
      ctx.stroke();
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(0, -2, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-4, -4, 3, 2);
      ctx.fillRect(1, -4, 3, 2);
      break;
    }
    case 'doctorstrange': {
      // Golden Eye of Agamotto with orange rune circle
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'blackwidow': {
      // Dual Widow's bite gauntlets with taser wires
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-8, -4, 6, 8);
      ctx.fillRect(2, -4, 6, 8);
      ctx.strokeStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(-2, 0);
      ctx.lineTo(2, 0);
      ctx.stroke();
      break;
    }
    case 'blackpanther': {
      // Vibranium claw necklace on purple kinetic ripple
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#e2e8f0';
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        ctx.fillRect(Math.cos(a) * 7 - 1, Math.sin(a) * 7 - 1, 2, 2);
      }
      break;
    }
    case 'hawkeye': {
      // Compound bow and arrow stuck in floor
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 12, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
      ctx.strokeStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(-10, -10);
      ctx.lineTo(4, 4);
      ctx.stroke();
      break;
    }
    default: {
      ctx.fillStyle = '#64748b';
      ctx.fillRect(-6, -6, 12, 12);
    }
  }

  // Memorial Marker Label
  ctx.font = "bold 8px 'JetBrains Mono', monospace";
  ctx.fillStyle = '#cbd5e1';
  ctx.textAlign = 'center';
  ctx.fillText(hero.name.toUpperCase(), 0, 18);

  ctx.restore();
}

// =============================================================================
// THANOS SNAP DISINTEGRATION EFFECT (FOR CINEMATIC ELIMINATION CUTSCENE)
// =============================================================================
export function drawThanosSnap(ctx, heroId, progress, time, width = 320, height = 320) {
  const hero = getHero(heroId);

  ctx.save();
  ctx.clearRect(0, 0, width, height);

  const centerX = width / 2;
  const centerY = height / 2 + 10;

  // Render the Hero at Large Scale (2.4x)
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.scale(2.4, 2.4);

  // Progressive clip path: from bottom to top, the body dissolves
  const clipHeight = 100 * (1 - progress);
  ctx.beginPath();
  ctx.rect(-60, -80, 120, clipHeight);
  ctx.clip();

  drawAvenger(ctx, hero.id, 0, time, false, false, false, false);
  ctx.restore();

  // Cosmic Dust / Ash Disintegration Particles
  const particleCount = Math.floor(progress * 180);
  ctx.save();

  for (let i = 0; i < particleCount; i++) {
    // Deterministic pseudo-random seed based on index
    const seed = (i * 9301 + 49297) % 233280;
    const rndX = (seed / 233280) * 120 - 60;
    const rndY = ((seed * 7) % 233280) / 233280;

    // Disintegration drift speed and trajectory
    const driftY = -progress * 140 - rndY * 60;
    const driftX = rndX + Math.sin(time * 3 + i) * 20 * progress;

    const pX = centerX + driftX;
    const pY = centerY + 30 + driftY;

    const pAlpha = Math.max(0, 1 - (progress * 1.1 + rndY * 0.3));
    const pSize = (i % 3 === 0 ? 3 : 2) * (1 - progress * 0.5);

    ctx.fillStyle = i % 2 === 0 ? hero.primaryColor : (i % 3 === 0 ? '#f59e0b' : '#ffffff');
    ctx.globalAlpha = pAlpha;
    ctx.beginPath();
    ctx.arc(pX, pY, pSize, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  ctx.restore();
}
